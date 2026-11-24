---
title: "Redes entre sitios: por qué usamos Edge como relay de peers WireGuard"
date: 2026-11-11
author: YAT Team
description: "En qué capa se ejecuta el relay, cuántos puertos necesita y si puede ver texto en claro; cómo definimos el relay WireGuard de YAT."
excerpt: "Dos equipos detrás de routers necesitan comunicarse. Si el hole punching falla, algo tiene que reenviar el tráfico. Elegir la capa, el modelo de puertos y la visibilidad reduce rápidamente el diseño."
tags:
  - WireGuard
  - Relay
  - Redes entre sitios
publish: true
layout: doc
sidebar: true
aside: false
pageClass: blog-post
---

Un NAS doméstico necesita acceder a una máquina de pruebas en la oficina. Ambos están detrás de routers y ninguno tiene dirección pública. YAT intenta primero la conexión directa. Si el hole punching falla, los paquetes pasan por un relay en un nodo Edge: un servidor Edge que despliega el propio usuario.

Tres decisiones determinan el diseño: en qué capa vive el relay, cuántos puertos UDP usa y si puede ver el contenido. El nuestro puede ver el tráfico reenviado. Es una compensación deliberada; la sección 4 explica por qué.

## 1. Dónde puede estar un relay

Una conexión directa WireGuard necesita dos cosas: que cada par conozca la dirección del otro y que la ruta de red funcione. NAT proporciona la asignación de direcciones; la accesibilidad depende de la topología. Un NAT simétrico puede hacer que los puertos no coincidan. Con un NAT de operador (CGNAT), puede que ninguna parte tenga una dirección alcanzable. Dos equipos detrás del mismo router dependen además del soporte de hairpin forwarding. Si no hay conexión directa, hace falta un relay.

Hay pocas opciones prácticas:

**En la capa de aplicación.** Herramientas como frp o `ssh -R` conectan un flujo TCP: "reenvía el 8080 local al NAS:5001 remoto". La configuración es precisa, pero el proxy no entiende IP. Cada servicio nuevo necesita otra regla, y UDP y otros protocolos resultan complicados. Eso es port forwarding, no una red.

**En la capa de red, con un nodo central que consulta tablas.** Es el modelo VPN tradicional: las rutas apuntan al centro; el centro descifra, consulta su tabla y reenvía. Es directo de implementar, pero todo el tráfico pasa por el centro aunque los peers puedan conectarse directamente.

**En la capa de red, sin descifrar en el relay.** El DERP de Tailscale y el relay de NetBird funcionan así: transportan bytes cifrados por WireGuard y no ven el contenido. El relay debe mantener un mapa entre conexiones y miembros, suele encapsular UDP en TCP o QUIC y procesa cada paquete en espacio de usuario. Las herramientas estándar `wg` no pueden inspeccionarlo.

**En la capa de red, con el relay como miembro.** El relay tiene una interfaz WireGuard real y los miembros lo configuran como un peer normal. Un paquete de A a B llega primero al relay; este descifra y reenvía como IP normal. B recibe un paquete cifrado con la clave de A.

Elegimos el último modelo. Su frontera de privacidad es la más débil (sección 4), pero usa un puerto, deja el cifrado y descifrado en el kernel y se puede depurar con `wg` y `tcpdump`. Dos restricciones explican la decisión.

## 2. Dos restricciones

### NAT solo acepta respuestas del mismo socket

Supongamos que A está detrás de un router doméstico y envía a `203.0.113.10:58021`. El router reescribe la fuente como `1.2.3.4:57138`, reenvía el paquete y guarda que el puerto 57138 corresponde al tráfico hacia `203.0.113.10:58021`.

La respuesta debe llegar desde `203.0.113.10:58021` para que el router la entregue al puerto 57138 de A. Si el relay responde desde otro puerto—aunque use la misma IP—el router descarta el paquete.

La regla es estricta. Un puerto de relay por miembro, o un puerto de origen distinto al reenviar, rompe el diseño aquí. El relay debe usar un puerto UDP: el mismo al que los miembros envían debe ser el que usa para responder.

### WireGuard aprende los endpoints de los peers

Aunque un peer tenga un `Endpoint` configurado, el kernel actualiza ese endpoint cada vez que recibe un paquete autenticado desde otra fuente.

Así funciona el NAT traversal, pero es peligroso para un relay. Si el reenvío abre un puerto de origen temporal, el miembro aprende ese puerto como dirección del relay. Los handshakes y datos siguientes llegan a un socket que no escucha hasta redistribuir la configuración.

La solución no es una lógica de compensación. El relay debe enviar siempre desde la dirección y el puerto esperados; volvemos al puerto UDP único.

El resultado es un relay con una interfaz WireGuard real y un puerto UDP por red. Handshakes, keepalives y datos usan ese puerto. Entregar un paquete de un miembro a otro se deja al reenvío del kernel.

## 3. Estado actual

```
   Miembro A                                   Edge (lo despliega el usuario)                    Miembro B
 10.24.0.2                              Interfaz WG wg-yat0-xxx                             10.24.0.3
                                        Red 10.24.0.0/24, puerto 58021

 A ── texto cifrado con la clave pública de Edge ──→ 58021
                                      │ El kernel descifra: src=10.24.0.2 dst=10.24.0.3
                                      │ El kernel reenvía: el destino está en esta interfaz
                                      │ WireGuard envía: AllowedIPs elige a B y cifra con su clave
 58021 ←──────────────────────────── enviado desde el mismo puerto ──────────────────────────────→ B

 B responde a 58021. El router de A reconoce la asignación de puertos y acepta el paquete.
```

La configuración del miembro es una configuración WireGuard normal con dos tipos de peers:

```ini
[Interface]
PrivateKey = <clave privada local del miembro; nunca sale de esta máquina>
Address    = 10.24.0.2/24

# Relay: clave pública y puerto de Edge
[Peer]
PublicKey  = <clave pública de Edge>
Endpoint   = 203.0.113.10:58021
AllowedIPs = 10.24.0.1/32, 10.24.0.3/32   # Edge + miembros aún sin conexión directa
PersistentKeepalive = 25

# Un miembro con conexión directa: el tráfico no pasa por Edge
[Peer]
PublicKey  = <clave pública del miembro C>
Endpoint   = 192.168.1.30:51820
AllowedIPs = 10.24.0.4/32
PersistentKeepalive = 25
```

Hay dos detalles intencionados.

El `AllowedIPs` del peer relay lista direcciones `/32` en lugar de toda la red. Cuando dos miembros establecen una conexión directa, su dirección se mueve del peer relay al peer directo. Así, cada IP de miembro tiene una sola salida en cada momento y dos peers nunca reclaman la misma dirección. Mantener `10.24.0.1/32` de Edge permite que los paquetes originados por Edge pasen la comprobación de dirección de origen.

`PersistentKeepalive = 25` mantiene la asignación NAT. El timeout UDP varía según el router, pero 25 segundos es un valor habitual de WireGuard con margen práctico.

En Edge, cada red tiene una interfaz WireGuard, un par de claves y una subred independientes. Un bucle de observación se ejecuta cada 5 segundos y lee el endpoint aprendido y el último handshake de cada peer. Los cambios de endpoint se notifican a los clientes para seleccionar rutas. Un peer se considera fuera de línea tras 300 segundos sin handshake correcto.

La subred se elige al crear la red. Edge escanea sus interfaces y redes existentes, evita conflictos, prefiere candidatos CGNAT como `100.64.1.0/24` a `100.65.2.0/24` y después recurre a rangos privados comunes.

## 4. ¿Puede el relay ver texto en claro?

Sí.

Cada enlace está cifrado por WireGuard, así que no hay texto en claro en Internet. En Edge, sin embargo, el paquete se descifra y se vuelve a cifrar. No hay sesión extremo a extremo; hay dos sesiones independientes: miembro a Edge y Edge al otro miembro. Por eso Edge ve el contenido. Es un relay de confianza, no un relay que solo transporte texto cifrado como DERP.

Tres propiedades hacen aceptable la compensación:

- Edge se ejecuta en el servidor del usuario, no en el nuestro. Quién puede ver los datos depende de dónde despliegues el relay.
- Las claves privadas de los miembros permanecen locales. Solo cambia el peer del handshake: de otro miembro a Edge. No se introduce un sistema de claves privado.
- El relay solo transporta tráfico que no puede conectarse directamente. Cuando existe una ruta directa, se retira del relay. Lo normal es punto a punto; el relay es el respaldo.

Si tus requisitos impiden que el relay vea el contenido, elige un diseño que solo transporte texto cifrado, como DERP. Es una evolución para despliegues de mayor seguridad, pero no está implementada actualmente.

## 5. Qué comprobar al desplegar

La configuración de Edge es breve:

```yaml
proxy:
  wireguard:
    enabled: true
    relay_enabled: true                # si este Edge reenvía tráfico
    forwarder_strategy: "kernel"       # kernel (predeterminado) o ebpf
```

Tres condiciones del host suelen configurarse al arrancar Edge, pero merecen entrar en la lista de despliegue:

```bash
sysctl net.ipv4.ip_forward                 # debe ser 1; si no, el kernel no reenvía
sysctl net.ipv4.conf.all.rp_filter         # debe ser 0
sysctl net.ipv4.conf.wg-yat0-xxx.rp_filter # también debe ser 0; el kernel usa el mayor valor
```

Limitaciones conocidas: el relay solo admite Linux e IPv4. Los miembros detrás del mismo NAT prefieren una conexión directa por LAN en lugar de atravesar el relay público.

## 6. Resumen

- El relay es un miembro WireGuard normal y cada red usa un puerto UDP.
- El relay puede ver texto en claro; la frontera de confianza es el host Edge que despliegas.
- El reenvío por kernel depende de `ip_forward`, `rp_filter` y el firewall FORWARD. Los dos artículos siguientes cubren las implementaciones kernel y eBPF.

## Lecturas relacionadas

Las dos implementaciones de reenvío tienen artículos separados:

- [Reenvío de relay WireGuard, parte 1: ip_forward del kernel y la cadena forward de nftables](./how-relay-wg-kernel-forward.md)
- [Reenvío de relay WireGuard, parte 2: redirección en TC ingress con eBPF](./how-relay-wg-ebpf-forward.md)
- [Guía de redes WireGuard](/guide/wireguard-networking)
- [Configuración WireGuard de Edge](/guide/edge/wireguard)
