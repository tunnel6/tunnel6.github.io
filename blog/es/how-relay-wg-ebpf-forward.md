---
title: "Reenvío de relay WireGuard, parte 2: redirección en TC ingress con eBPF"
date: 2026-11-24
author: YAT Team
description: "Implementación de reenvío eBPF en un nodo relay: TC y clsact, por qué los flags de bpf_redirect deben ser 0, qué evita esta ruta y qué supuestos añade."
excerpt: "El reenvío eBPF pone la decisión del relay en un programa de TC ingress y no depende de una cadena FORWARD que otro software puede reescribir. Cuesta más privilegios, menos cobertura de protocolos y un diagnóstico más difícil."
tags:
  - WireGuard
  - Relay
  - eBPF
  - Kernel de Linux
publish: true
layout: doc
sidebar: true
aside: false
pageClass: blog-post
---

La [parte 1](./how-relay-wg-kernel-forward.md) deja reenviar al kernel: activa `ip_forward`, desactiva `rp_filter` y acepta el tráfico en una cadena forward de nftables. Este artículo usa otra vía: interceptar el paquete antes de la pila de protocolos y enviarlo directamente a la salida de la interfaz.

La ruta es:

```
UDP 58021 recibe el texto cifrado → desencapsulación (WireGuard en kernel descifra)
                                  → el texto en claro llega a TC ingress de la interfaz
                                                          │ programa BPF asociado aquí
                                                          │ bpf_redirect(ifindex, 0)
                                                          ▼
                                Qdisc de salida de la interfaz → wg_xmit()
                                → recifrado (WireGuard en kernel) → B
```

El paquete no consulta la tabla de rutas, no entra en el hook FORWARD de netfilter, no entra en conntrack ni sale del kernel.

Primero el alcance: la [parte 1](./how-relay-wg-kernel-forward.md) divide el proceso en desencapsulación, reenvío y reencapsulación. Esta ruta sustituye solo el reenvío. WireGuard en kernel sigue descifrando con la sesión de A, verificando tag y contador, y cifrando con la sesión de B. Tras enviarlo `bpf_redirect`, el paquete sigue pasando por el mismo `wg_xmit()`.

La diferencia está en dónde reside la decisión de reenvío. La ruta del kernel depende de un interruptor global, dos valores `rp_filter` y un hook FORWARD compartido. Es estado de toda la máquina. Docker al reiniciar contenedores, `ufw reload` o un agente de seguridad pueden cambiarlo sin avisar. La ruta eBPF incluye la decisión en su propio programa: no lee el interruptor global ni recorre FORWARD.

Basta conocer TC y qdisc de forma general; la siguiente sección los define.

## Tres conceptos: TC, clsact y SchedCLS

**TC (Traffic Control)** es el framework de Linux para procesar la recepción y transmisión de cada dispositivo. Cada dispositivo tiene un árbol de colas. En salida, el qdisc raíz decide el encolamiento—donde se aplica la limitación de velocidad. En entrada normalmente casi no procesa.

**clsact** es un qdisc especial cuyo único propósito es ofrecer puntos de conexión para clasificadores `ingress` y `egress`. Su handle es `ffff:0` y no entra en conflicto con el qdisc raíz de salida. Así, un programa BPF en ingress puede coexistir con limitación HTB en egress. clsact debe existir antes de asociar algo a ingress.

**`BPF_PROG_TYPE_SCHED_CLS`** (`ebpf.SchedCLS` en Go) se ejecuta en esos puntos. Su entrada es un `__sk_buff`; su valor de retorno es una acción TC:

| Valor de retorno | Significado |
|---|---|
| `TC_ACT_OK` (0) | Continuar la ruta normal del paquete |
| `TC_ACT_SHOT` (2) | Descartar |
| `TC_ACT_REDIRECT` (7) | Enviado a otro sitio por `bpf_redirect` |

En modo DirectAction, el retorno del programa es el veredicto TC. Sin él, solo es una clasificación y una acción police o classid configurada decide el siguiente paso. Edge usa DirectAction.

`bpf_redirect(ifindex, flags)` envía el paquete a la ruta de transmisión del dispositivo indicado y devuelve `TC_ACT_REDIRECT`. Los parámetros se explican más abajo.

## Asociación

```
Start():
  link = netlink.LinkByName(ifName)
  link.Type() != "wireguard"            → error; no adivinar otros tipos
  cfg.IfIndex = link.Attrs().Index      ← usado en cada decisión de paquete
  cfg.MTU     = link.Attrs().MTU

  statsMap = ebpf.NewMap(...)           HashMap por dirección de origen
  prog     = ebpf.NewProgram(...)       se carga solo si el verificador lo acepta

  QdiscAdd(clsact)                      reutiliza EEXIST; aborta en otros errores
  FilterAdd(BpfFilter{
      Parent: HANDLE_MIN_INGRESS, Priority: 1, Handle: 1,
      Protocol: ETH_P_ALL, DirectAction: true, Name: "yat_redirect",
  })                                    CREATE|EXCL: falla si está ocupado; nunca sustituye otro filtro

Stop():
  FilterDel → prog.Close → map.Close
```

Hay tres detalles importantes.

**Comprueba el tipo de interfaz.** La lógica solo es válida en WireGuard: la entrada lleva IP en claro ya descifrada y la salida, IP en claro pendiente de cifrar. En otros dispositivos la semántica cambia.

**Espera las confirmaciones de netlink.** Los cambios de qdisc y filtro usan peticiones con acuse. Con recepción no bloqueante, `Recvfrom` puede tratar `EAGAIN` como éxito y ocultar una regla que nunca se instaló; es muy difícil de diagnosticar.

**Usa prioridad 1, no 100.** Los filtros del mismo hook se ejecutan de menor a mayor. El programa de reenvío usa 1 y el contador independiente usa 10: primero decide, después cuenta. El reenvío por kernel no cuenta por sí mismo; el programa eBPF de reenvío sí lo hace.

## Decisiones del programa

El programa no tiene bucles ni búsquedas en tablas por paquete. Red, máscara, dirección del relay, índice de interfaz y MTU son valores inmediatos escritos al cargar. "Devolver a la pila" significa retornar `TC_ACT_OK`:

| Orden | Comprobación | Si falla |
|---|---|---|
| 1 | ¿Se pueden leer los primeros 20 bytes? | Devolver a la pila |
| 2 | ¿El primer byte es `0x45` (IPv4, sin opciones)? | Devolver a la pila |
| 3 | ¿Origen y destino están en esta red? | Devolver a la pila |
| 4 | ¿El destino es el propio relay? | Devolver a la pila (tráfico para el relay) |
| 5 | ¿Es multicast, broadcast o dirección de red? `/31` y `/32` omiten la comprobación de dirección de red. | Devolver a la pila |
| 6 | ¿TTL ya es ≤ 1? | Devolver a la pila (deja que la pila envíe ICMP time exceeded) |
| 7 | Cabecera < 20 o longitud total > `skb->len` | Descartar |
| 8 | Longitud total ≠ `skb->len` (padding) o > MTU | Devolver a la pila |
| 9 | Validar el checksum IPv4 en complemento a uno | Descartar |
| 10 | Reducir TTL, actualizar checksum, `bpf_redirect(ifindex, 0)` y actualizar contadores por origen | — |

El pseudocódigo equivalente es:

```
data     = skb->data          // offset 76 de __sk_buff
data_end = skb->data_end      // offset 80 de __sk_buff
if data + 20 > data_end { return TC_ACT_OK }

version_ihl = *data                       // debe ser 0x45: IPv4, cabecera de 20 bytes
                                          // no hay cabecera Ethernet tras desencapsular
src = ntohl(*(u32*)(data + 12))
dst = ntohl(*(u32*)(data + 16))
if (src & NETMASK) != NETWORK { return TC_ACT_OK }
if (dst & NETMASK) != NETWORK { return TC_ACT_OK }
if dst == RELAY_IP || dst >= 224.0.0.0 { return TC_ACT_OK }
if data[8] <= 1 { return TC_ACT_OK }

totlen = ntohs(*(u16*)(data + 2))
if totlen < 20 || totlen > skb->len { return TC_ACT_SHOT }
if totlen != skb->len || totlen > MTU { return TC_ACT_OK }

if ones_complement_sum(data[0..20]) != 0xffff { return TC_ACT_SHOT }

data[8] -= 1                              // equivalente a ip_decrease_ttl()
data[10..12] += 0x100 y plegar a 16 bits  // actualización incremental del checksum
return bpf_redirect(IFINDEX, 0)
```

Hay tres detalles fáciles de pasar por alto.

**Valida el checksum de cabecera.** Normalmente lo hace `ip_rcv`. Esta ruta omite esa entrada, así que una cabecera inválida llegaría hasta B y se rechazaría allí: parece reenvío, pero no funciona.

**Reduce el TTL y actualiza el checksum.** El relay es un router. Sin decrementar TTL, un bucle puede persistir. El checksum debe seguir el cambio o B recibe un paquete inválido. Como solo cambia el byte de TTL, la corrección incremental evita recalcular todo el checksum.

**Repite las comprobaciones de límites.** El verificador BPF rechaza movimientos de puntero sin validar. `data` y `data_end` son campos fijos de `__sk_buff` (76 y 80); `skb->len` está en el offset 0 e incluye datos no lineales.

## El segundo argumento de bpf_redirect debe ser 0

`flags = 0` envía a la **salida** del dispositivo: `dev_queue_xmit`, el qdisc de salida y después `ndo_start_xmit`. En WireGuard es `wg_xmit`, exactamente la ruta deseada.

`flags = BPF_F_INGRESS` envía a la **entrada** del dispositivo. El destino es la misma interfaz, así que el paquete vuelve a este programa y se produce un bucle.

Dos alternativas parecen válidas pero no lo son:

- **`bpf_redirect_peer`**: exige que el destino sea un dispositivo peer en otro network namespace, normalmente los extremos de un par veth. Las dos partes de nuestra interfaz WireGuard están en un mismo netns, así que no hay ese peer. Su valor de retorno también debe comprobarse, y el envío correcto no garantiza que WireGuard transmita ni que el peer reciba.
- **`bpf_clone_redirect`**: clona el paquete y deja el original continuando por la pila. Necesitamos un único paquete por otra ruta, ya modificado en TTL y checksum; clonar añade trabajo sin resolver nada.

La elección final es `bpf_redirect(ifindex, 0)`, con la contabilidad dentro del programa.

## Qué se evita y qué cuesta

Ambas rutas juntas:

```
Ruta del kernel: descifrar → ip_rcv → enrutamiento y rp_filter → ip_forward
                 → FORWARD(nftables) → ip_output → qdisc → wg_xmit
Ruta eBPF:       descifrar → TC ingress → bpf_redirect → qdisc → wg_xmit
```

eBPF evita `ip_forward`, `rp_filter`, la búsqueda de ruta y FORWARD. Docker, `ufw`, `firewalld` o un agente de seguridad pueden cambiar FORWARD sin afectar este tráfico coincidente. El trabajo de pila ahorrado es pequeño frente al cifrado WireGuard; la ventaja principal es una frontera de dependencias más estrecha.

La contrapartida es la observabilidad: las herramientas basadas en netfilter no ven esta ruta.

- `nft list table ip yat_relay`: pertenece solo a la ruta del kernel. Con eBPF no existe esa tabla, lo cual es normal.
- `conntrack -E`: el reenvío eBPF no crea entradas de seguimiento de conexiones.
- La contabilidad y alertas basadas en netfilter no cuentan este tráfico.
- `tc -s filter show dev <interfaz> ingress` demuestra que el filtro se ejecuta; sin contadores por rama no prueba que un paquete concreto se haya redirigido.

El programa solo toma el tráfico que acepta. IPv6, opciones IPv4, fragmentos y destinos fuera de la red vuelven a la pila. Si realmente hay que reenviarlos, siguen usando la ruta del kernel de la parte 1. Elegir `ebpf` no significa que el host deje de necesitar `ip_forward`; significa que la ruta principal del relay ya no depende de ella.

Las estadísticas por miembro tienen otro problema: tras redirigir, el programa solo busca una clave existente y nunca crea una. En la implementación actual ningún otro código crea esas claves, así que el mapa hash por dirección de origen queda vacío y el `Forwarded` agregado por Edge no es utilizable. Para confirmar el reenvío, prueba conectividad en B y revisa `wg show wg-yat0-xxx transfer`.

## Requisitos y límites

- Requiere root más `CAP_BPF` y `CAP_NET_ADMIN`; más que la ruta del kernel, no menos.
- Kernel mínimo 5.8; `CAP_BPF` se separó de `CAP_SYS_ADMIN` en 5.8.
- Compila con `go build -tags ebpf`. Las compilaciones predeterminadas excluyen este código. Si se configura `ebpf`, devuelve "unavailable" en lugar de cambiar silenciosamente de ruta.
- Solo procesa IPv4 sin opciones. No toma fragmentos ni multicast y no genera mensajes ICMP de error.
- Las instrucciones se generan en Go con `cilium/ebpf/asm`, así que no hacen falta clang/LLVM ni un `.o` precompilado. El coste es código casi ensamblador cuyos cambios deben respetar las reglas del verificador.
- La limitación de velocidad sigue funcionando: HTB se asocia al qdisc raíz `1:` y los paquetes redirigidos atraviesan el qdisc de salida.
- Depurar es más difícil. Si el verificador rechaza la carga, solo hay un código de error. Inspecciona `bpftool prog dump xlated` o genera otra versión con contadores. Cada cambio de condiciones es una recarga, no una edición de regla.

## Cuándo usarlo

eBPF exige más privilegios. La razón para elegirlo es aislar el estado del firewall del host:

- ¿Se reescribirá FORWARD repetidamente? Docker reordena reglas al reiniciar contenedores y su daemon; también lo hacen `ufw`, `firewalld` y agentes EDR. La ruta del kernel exige que todos los firewalls relevantes permitan el flujo; eBPF no depende de FORWARD.
- ¿Importa el crecimiento de conntrack? El reenvío por kernel crea una entrada por flujo. Muchos miembros y conexiones largas llenan la tabla; una tabla llena rechaza flujos nuevos. eBPF no crea ninguna.
- ¿Cuánto vale la observabilidad? La ruta del kernel tiene contadores nft, `conntrack -E` y `tcpdump` en cada etapa. Con eBPF se puede capturar en la interfaz, pero nft y conntrack no lo ven; su comportamiento interno requiere `tc -s filter` y `bpftool`.

El valor predeterminado sigue siendo `kernel`. Reserva `ebpf` para hosts donde las dos primeras condiciones sean reales, no como "la opción más rápida".

## Verificación

```bash
# ¿Están el programa y el filtro asociados? ¿Cuántos paquetes vio?
tc -s filter show dev wg-yat0-xxx ingress

# Programas BPF registrados en el kernel
bpftool prog list | grep yat_

# ¿Llegó realmente al peer? Revisa los contadores del relay y las direcciones en B.
ip -s link show wg-yat0-xxx
wg show wg-yat0-xxx
```

La línea `bpf` en la salida de `tc`, con su nombre de programa y número de ejecuciones, es la prueba más clara de que el filtro está vivo. Cuenta invocaciones; no distingue aceptaciones, descartes, redirecciones ni paquetes recibidos por B. La confirmación final es la conectividad en el miembro y los contadores de transferencia WireGuard.

## Lecturas relacionadas

- [Redes entre sitios: por qué usamos Edge como relay de peers WireGuard](./how-relay-wg.md)
- [Reenvío de relay WireGuard, parte 1: ip_forward del kernel y la cadena forward de nftables](./how-relay-wg-kernel-forward.md)
- [Configuración WireGuard de Edge](/guide/edge/wireguard)

## Referencias

- [Cilium ebpf](https://github.com/cilium/ebpf) — cargador Go y construcción de instrucciones con `asm`
- [Helper eBPF: `bpf_redirect`](https://docs.ebpf.io/linux/helper-function/bpf_redirect/) — semántica de flags
- [LARTC: Traffic Control filters](https://lartc.org/howto/lartc.qdisc.filters.html) — relación entre qdisc, clase y filtro
