---
title: "Reenvío de relay WireGuard, parte 1: ip_forward del kernel y la cadena forward de nftables"
date: 2026-11-23
author: YAT Team
description: "El salto intermedio en el nodo relay: ip_forward, rp_filter, el hook FORWARD de netfilter y por qué importa la declaración de la cadena nftables."
excerpt: "El relay descifra el paquete de A y lo cifra de nuevo para B. WireGuard en kernel hace ambas operaciones; el problema es si Linux reenviará un paquete recibido por una interfaz hacia esa misma interfaz."
tags:
  - WireGuard
  - Relay
  - Kernel de Linux
  - nftables
publish: true
layout: doc
sidebar: true
aside: false
pageClass: blog-post
---

Esta red tiene dos miembros: A (`10.24.0.2`) y B (`10.24.0.3`). Están detrás de NAT distintos y no pueden conectarse directamente, así que ambos configuran el relay (`10.24.0.1`) como peer. El paquete cifrado de A llega al puerto UDP del relay y WireGuard en kernel obtiene un paquete IPv4 normal:

```
src = 10.24.0.2    dst = 10.24.0.3    interfaz de entrada = wg-yat0-xxx
```

`10.24.0.3` también está en `wg-yat0-xxx`. La pregunta es: **¿puede Linux reenviar un paquete recibido por una interfaz y enviarlo por esa misma interfaz?**

Sí, si se cumplen tres condiciones. Las dos primeras son interruptores del kernel; la tercera es aceptación del firewall, la parte que requiere diseño. Edge no toca paquetes individuales aquí. Prepara esas condiciones al arrancar el forwarder.

El artículo asume que conoces los peers y `AllowedIPs` de WireGuard; no hace falta experiencia programando netfilter.

## Ruta de datos: un descifrado y un cifrado

Primero hay que fijar qué ocurre con el paquete. Esto no depende de la estrategia de reenvío y es el coste principal del relay.

La estructura de un paquete de datos WireGuard es:

```
Cabecera IP externa (dirección del relay ↔ dirección del miembro)
  └ Cabecera UDP externa (puerto del relay 58021 ↔ puerto NAT del miembro)
      └ Mensaje de datos WireGuard: cabecera de 16 bytes + texto cifrado + tag Poly1305(16)
            └ Paquete IPv4 en claro (sin cabecera Ethernet; la cabecera IP queda expuesta)
```

Desde su llegada hasta su salida hay tres pasos:

1. **Desencapsulación.** El kernel usa el receiver index para identificar la sesión local, descifra con esa clave de sesión, verifica el tag Poly1305 y rechaza contadores repetidos. Después entrega el paquete IP interior como si se hubiera recibido por `wg-yat0-xxx`.
2. **Decisión de reenvío.** El destino interior no es local, así que el paquete entra en el reenvío. Este paso solo cambia TTL y el checksum IPv4 asociado. `src` y `dst` no cambian.
3. **Reencapsulación.** `wg_xmit()` selecciona a B por `AllowedIPs`, cifra con su sesión independiente, añade un nuevo contador y tag, y agrega las cabeceras UDP/IP externas. El puerto de origen sigue siendo 58021; el destino es el endpoint aprendido actualmente de B.

Hay dos consecuencias directas.

Primera: **no hay sesión de cifrado extremo a extremo** entre A y B. Existen sesiones independientes de relay a A y de relay a B; el relay descifra en el paso 1 y cifra en el paso 3. Esto se deriva del diseño de WireGuard. Quien controla el relay puede ver el texto en claro entre ambas operaciones.

Segunda: el coste está en el cifrado, no en el reenvío. Un mensaje de datos WireGuard añade 32 bytes al paquete IP en claro: una cabecera de mensaje de 16 bytes más un tag Poly1305 de 16 bytes. Con 8 bytes de UDP y 20 de IPv4, la sobrecarga en el enlace es de 60 bytes. El relay ejecuta ChaCha20-Poly1305 dos veces por paquete. Ambas estrategias comparten una regla: no mover paquetes a espacio de usuario. Si el paso intermedio consulta una ruta o una tabla hash es secundario. La [parte 2](./how-relay-wg-ebpf-forward.md) redirige el mismo paquete y no altera la desencapsulación ni el cifrado.

Este artículo trata solo el paso 2.

## Ruta del kernel

```
UDP 58021 recibe el texto cifrado
  └─ Desencapsulación (paso 1) → el texto en claro entra en la capa IP como recibido por enlace
       ip_rcv()
         └─ ip_rcv_finish()
              ├─ ip_route_input()
              │    ├─ Búsqueda de ruta para el destino
              │    └─ fib_validate_source() ← rp_filter actúa aquí
              ├─ Destino local → entregar a un socket local
              └─ Destino no local → ip_forward()
                   ├─ TTL > 1; reducirlo y actualizar el checksum
                   ├─ NF_INET_FORWARD ← el firewall actúa aquí
                   └─ ip_output() → dev_queue_xmit()
                        └─ Qdisc de salida → wg_xmit() ← recifrado: AllowedIPs elige a B
```

Las tres condiciones corresponden a tres puntos: el kernel debe reenviar (`ip_forward`), no debe rechazar la fuente en la validación de ruta inversa (`rp_filter`) y el firewall debe aceptar el paquete (cadena FORWARD).

## Condición 1: ip_forward activado

Cuando `net.ipv4.ip_forward` es 0, los paquetes no locales se descartan tras `ip_rcv`, así que el reenvío nunca comienza. La mayoría de imágenes cloud lo desactivan.

[Edge](/guide/edge/#what-is-edge) escribe `1` al arrancar el forwarder y falla si no puede escribirlo. No tiene sentido instalar el resto si el paquete nunca entrará en el reenvío.

```bash
sysctl net.ipv4.ip_forward          # esperado: 1
```

Este comando es útil al diagnosticar:

```bash
nstat -az | grep -E '^Ip(InReceives|ForwDatagrams)'
```

Si `IpInReceives` aumenta y `IpForwDatagrams` no, el paquete no llega a la ruta de reenvío. El problema está antes de FORWARD—normalmente `ip_forward` o el enrutamiento—no en el firewall.

## Condición 2: rp_filter desactivado

El filtrado de ruta inversa es una comprobación antisuplantación. El kernel consulta la ruta usando la **dirección de origen**. Si la mejor ruta hacia esa fuente no es la interfaz de entrada, considera el paquete falsificado y lo descarta.

Dos claves participan y el kernel usa el valor mayor:

```
net.ipv4.conf.all.rp_filter
net.ipv4.conf.wg-yat0-xxx.rp_filter
```

Cambiar solo una no basta. Los valores son `0` desactivado, `1` estricto (la mejor ruta debe ser la interfaz de entrada) y `2` flexible (basta cualquier ruta).

El tráfico de relay la activa fácilmente porque la subred de un miembro puede alcanzarse por varias vías: otro túnel reclama el mismo rango, el host tiene varias interfaces o un miembro conectado directamente es alcanzable por otra ruta. El modo estricto descarta esos paquetes. El modo flexible suele funcionar, pero diagnosticar exige razonar qué ruta sigue realmente A. Edge pone ambos valores en 0. Si la escritura falla, registra una advertencia sin abortar.

`accept_local` es otra comprobación para paquetes cuya fuente pertenece al propio conjunto de direcciones del host. Activarla no sustituye a desactivar `rp_filter`.

## Condición 3: la cadena FORWARD

Las dos primeras condiciones son del kernel. La tercera es el firewall. Linux tiene dos interfaces de usuario para netfilter: el antiguo `iptables` y el más nuevo `nftables`. Hay tres conceptos de nftables importantes.

Netfilter expone hooks fijos. El hook de reenvío es `NF_INET_FORWARD`. Varias cadenas pueden asociarse al mismo hook y se ejecutan en orden creciente de prioridad. En nftables:

- **table**: un espacio de nombres que también selecciona la familia (`ip`, `ip6`, `inet`, `bridge`). Borrar una tabla elimina todo su contenido.
- **chain**: declara su `type`, `hook`, `priority` y `policy` predeterminada cuando ninguna regla coincide.
- **rule**: expresiones de coincidencia más un veredicto (`accept`, `drop`, `continue`, etc.).

[Edge](/guide/edge/#what-is-edge) instala una cadena así:

```nft
table ip yat_relay {
  chain forward {
    type filter hook forward priority mangle; policy accept;
    iifname "wg-yat0-xxx" oifname "wg-yat0-xxx" ip daddr 10.24.0.0/24 accept
  }
}
```

Desglose:

`type filter hook forward` registra la cadena en el hook `NF_INET_FORWARD` mostrado arriba.

`priority mangle` (`-150`) la sitúa después de `conntrack` (`-200`) y antes de una cadena filter habitual (`0`). Pero `accept` en nftables solo termina la evaluación de la base chain actual; no impide que cadenas posteriores del mismo hook vean el paquete. Solo `drop` se detiene de inmediato. Esta cadena no sobrescribe Docker, `ufw`, `firewalld` ni otro producto que instale reglas posteriores. Acepta el tráfico del relay en su propia cadena, pero reglas FORWARD posteriores pueden rechazarlo.

El `DOCKER-USER` de Docker suele estar en una cadena `FORWARD` de iptables. Insertar la misma coincidencia con `iptables -I FORWARD ...` la coloca antes de las reglas de esa cadena, así que Docker no la intercepta dentro de ella. Si una tabla nftables independiente la descarta después, sigue descartándose. Consulta la [documentación de Netfilter](https://wiki.nftables.org/wiki-nftables/index.php/Netfilter_hooks) para más hooks y prioridades.
![netfilter](/blog/images/nf-hooks.png)

`conntrack` (`-200`) se ejecuta antes, así que el tráfico reenviado por kernel sigue registrándose. `conntrack -E` y las reglas stateful pueden ver el flujo. Es lo contrario de la [parte 2](./how-relay-wg-ebpf-forward.md) y una diferencia sustancial entre ambas rutas.

`policy accept`: sin regla coincidente, esta cadena devuelve accept. No evalúa a propósito el reenvío ajeno; las base chains posteriores siguen procesando el paquete.

`iifname "wg-yat0-xxx" oifname "wg-yat0-xxx"` exige que entrada y salida sean la misma interfaz relay. Juntas expresan con precisión "reenvío por la misma interfaz".

`ip daddr 10.24.0.0/24` limita la aceptación a destinos de esta red. El relay no decide el reenvío de otros rangos.

Varias redes en un Edge producen varias reglas en la misma tabla. Edge guarda el handle y lo elimina primero. Si el handle está obsoleto, recorre la cadena buscando interfaz, red y veredicto. La regla también lleva `UserData` interno (`yat-relay:<interfaz>`); no es un comentario normal mostrado por `nft list` y el borrado actual no depende de él.

## iptables

`iptables` opera sobre el mismo firewall del kernel. El mismo efecto puede expresarse así:

```bash
# Instalar (equivalente a la regla nft anterior)
iptables -I FORWARD -i wg-yat0-xxx -o wg-yat0-xxx -d 10.24.0.0/24 -j ACCEPT

# Eliminar
iptables -D FORWARD -i wg-yat0-xxx -o wg-yat0-xxx -d 10.24.0.0/24 -j ACCEPT
```

Notas:

- **Usa `-I`, no `-A`.** Docker suele colocar el salto `DOCKER-USER` al principio de `FORWARD`; una regla añadida al final puede no ejecutarse nunca. El orden dentro de la cadena es el control que tiene iptables.
- **Comprueba primero el backend.** Los paréntesis de `iptables -V` indican `nf_tables` o `legacy`. El backend `nf_tables` coloca la regla en la capa de compatibilidad de iptables; insertarla antes de las reglas existentes de `FORWARD` la hace ejecutarse antes que las reglas Docker de esa cadena. El backend `legacy` usa la ruta independiente `x_tables` y no aparece en `nft list ruleset`; en esos hosts el fallback de iptables es necesario para aceptar este tráfico. Edge lo instala siempre y registra advertencia, sin abortar, si falla.
- **Para borrar hay que repetir la regla.** `-D` elimina una sola coincidencia por llamada. Reinicios repetidos pueden dejar duplicados, así que Edge repite `-D` hasta recibir el error de que ya no existe.

## Lecturas relacionadas

- [Redes entre sitios: por qué usamos Edge como relay de peers WireGuard](./how-relay-wg.md)
- [Reenvío de relay WireGuard, parte 2: redirección en TC ingress con eBPF](./how-relay-wg-ebpf-forward.md)
- [Configuración WireGuard de Edge](/guide/edge/wireguard)

## Referencias

- [nftables Wiki: Netfilter hooks](https://wiki.nftables.org/wiki-nftables/index.php/Netfilter_hooks) — lista autorizada de hooks y prioridades
- [Documentación del kernel Linux: ip-sysctl](https://www.kernel.org/doc/Documentation/networking/ip-sysctl.txt) — definiciones de `ip_forward`, `rp_filter` y `accept_local`
- [WireGuard: Whitelisting](https://www.wireguard.com/whitelisting/) — semántica de enrutamiento de AllowedIPs
