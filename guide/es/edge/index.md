---
title: Nodo Edge
description: Qué es un Edge, qué funciones tiene y en qué orden leer las guías de Edge
---

# Nodo Edge

> Edge es el servidor que YAT coloca en internet para retransmitir tráfico. Esta página explica su función y el orden recomendado para leer las guías.

---

## Índice de documentación

| Documento | Contenido | Cuándo leerlo |
|-----------|-----------|----------------|
| [Gestión del servidor Edge](./management.md) | Conceptos, componentes, arranque, operación diaria y comprobaciones de dominio | La primera vez que trabajas con Edge |
| [Desplegar un servidor Edge](./deploy.md) | Script generado por el cliente, despliegue manual y verificación | Cuando vas a ejecutar Edge en un servidor nuevo |
| [Mercado y uso compartido de Edge](./market.md) | Suscripción y compartición de nodos Edge | Cuando quieres usar un Edge compartido |
| [Configuración de WireGuard](./wireguard.md) | Habilitar redes WireGuard, dependencias de reenvío y requisitos del kernel | Si Edge será el relé de una LAN virtual |
| [Referencia de configuración](./config-reference.md) | Todas las opciones de `config.yaml` y sus valores por defecto | Para cambiar el comportamiento de Edge |
| [Parámetros de arranque](./startup-params.md) | Opciones de línea de comandos de `edge server start` | Para escribir un script o una unidad systemd |
| [Referencia de CLI](./cli-reference.md) | Manual completo de la línea de comandos | Operaciones rutinarias y trabajos por lotes |
| [Preguntas frecuentes](./faq.md) | Errores de despliegue y ejecución, y cómo rastrearlos | Cuando algo falla |

::: tip Solo quiero que funcione
Ve directamente a [Desplegar un servidor Edge](./deploy.md). El script generado por el cliente ya incluye el secreto de registro: cópialo en una máquina con IP pública y ejecútalo.
:::

---

## Qué es Edge

Tu NAS, tu base de datos y el servidor de desarrollo del portátil están en una red privada y no son accesibles desde internet. Edge cubre ese hueco: se ejecuta en una máquina con dirección pública y mantiene una conexión persistente con tu cliente YAT local, autenticada en ambas direcciones con mTLS. La petición externa llega primero a Edge y luego se entrega a tu servicio por esa conexión. No necesitas abrir puertos en la máquina interna ni cambiar el router.

```
Sin Edge:   visitante ✗ -- el router no reenvía el puerto, la petición no entra
Con Edge:   visitante → Edge (entrada pública) → conexión autenticada → servicio interno
```

## Qué hace Edge

| Responsabilidad | Detalle |
|-----------------|---------|
| **Entrada pública** | Escucha en puertos HTTP/HTTPS, TCP, UDP y WireGuard |
| **Retransmisión** | Envía cada petición al túnel correcto por dominio o puerto; la respuesta vuelve por la misma conexión |
| **Identidad y cifrado** | Autenticación mutua con Captain y con los clientes; la confianza se basa en identidad, no en ubicación de red |
| **Asignación de dominios** | Cada túnel recibe un nombre como `abc123.edge.myroxy.dev`, o puedes usar el tuyo |
| **Estado** | Informa de disponibilidad, túneles y estadísticas de tráfico para las comprobaciones de salud |

## De dónde viene un Edge

| Origen | Detalle | Encaja con |
|--------|---------|-------------|
| **Nodos oficiales** | Operados por YAT en varias regiones y disponibles al crear la cuenta | La mayoría de usuarios y equipos |
| **Edge propio** | Instalado en tu VPS, con ancho de banda, puertos y certificados exclusivos | Producción o necesidad de controlar la salida |
| **Edge compartido** | Un Edge compartido por otros dispositivos o terceros, al que te suscribes | Pruebas o uso esporádico |

Los nodos propios y compartidos se administran en la página **Edges** del cliente; los pasos están en [Desplegar un servidor Edge](./deploy.md) y [Mercado y uso compartido de Edge](./market.md).

---

## Documentación relacionada

- [Qué es YAT](../what-is-yat.md) — dónde encaja Edge en la plataforma
- [Gestión de túneles](../tunnel-management.md) — cómo se vincula un túnel a un Edge
- [Redes WireGuard](../wireguard-networking.md) — lado del cliente de una LAN virtual
- [Modos y protocolos de transporte](../transport-modes.md) — diferencias entre HTTP, TCP, UDP y WireGuard
- [Dominios personalizados](../custom-domains.md) — cómo usar tu dominio en Edge o en un túnel

---

*YAT Team - Hacer más simple el acceso a redes privadas*
