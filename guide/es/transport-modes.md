# Modos y protocolos de transporte

> Elige el modo según el tipo de aplicación, la red y el equilibrio entre latencia, estabilidad y seguridad.

## Resumen

| Modo | Cómo funciona | Ventajas | Límites |
|------|---------------|----------|---------|
| HTTP | Reenvía solicitudes HTTP/HTTPS por dominio | Integración con dominios y certificados | Solo tráfico HTTP |
| TCP | Conexión directa por puerto remoto a puerto local | Compatible con bases de datos, SSH, RDP | Requiere exponer el puerto en Edge |
| UDP | Reenvía datagramas UDP | Sirve para juegos, DNS y multimedia | Más sensible a pérdida de paquetes |
| P2P Direct | Intenta conectar los dos extremos directamente | Menor latencia y menos carga en Edge | Depende de NAT y firewall |
| Relay Mode | Todo el tráfico pasa por Edge | Predecible y compatible con NAT complejo | Consume ancho de banda de Edge |
| WireGuard | Crea una LAN virtual cifrada | Comunicación bidireccional entre miembros | Requiere soporte de kernel o userspace |

## Cómo elegir

| Necesidad | Recomendación |
|-----------|---------------|
| Sitio web o API | HTTP |
| Base de datos, SSH, RDP | TCP |
| Juego, VoIP, DNS propio | UDP |
| Dos dispositivos en redes simples | P2P Direct |
| Red móvil o NAT estricto | Relay Mode |
| Acceso simultáneo a varios servicios privados | WireGuard |

## HTTP

HTTP es el modo más cómodo para servicios web. Cada túnel puede usar un dominio asignado por el sistema o un dominio propio. Edge termina TLS, aplica el certificado y reenvía la petición al servicio local.

Es adecuado cuando el cliente acepta HTTP y no necesitas exponer un puerto TCP arbitrario.

## TCP

TCP mantiene una conexión orientada a flujo entre el puerto público de Edge y el puerto local. Antes de usarlo, comprueba:

```bash
# Confirmar que el servicio local escucha
lsof -i :3306

# Comprobar el puerto remoto
nc -zv your-edge-domain.com 3306
```

Usa TCP para protocolos binarios o de conexión persistente.

## UDP

UDP reenvía datagramas sin gestionar reconexión. Es útil para protocolos tolerantes a pérdida, como juegos, DNS o streaming. Si el servicio local necesita controlar el orden o la retransmisión, es mejor usar TCP.

## P2P Direct

P2P intenta establecer una ruta directa después de intercambiar información de conexión. Ofrece menor latencia y reduce el uso de ancho de banda en Edge.

Funciona mejor cuando al menos un extremo tiene NAT permisiva o UPnP disponible. Si la negociación falla, cambia a Relay Mode.

## Relay Mode

En Relay Mode, Edge es el punto de entrada y salida. Es la opción más estable para redes móviles, NAT simétrico y firewalls corporativos. También simplifica la auditoría porque todo el tráfico pasa por un nodo conocido.

El coste es que el ancho de banda del Edge limita la velocidad del túnel.

## WireGuard

WireGuard crea una interfaz cifrada y permite comunicación bidireccional entre dispositivos. Es útil cuando varios servicios deben verse como si estuvieran en la misma LAN.

Temas clave:

- El Edge debe tener WireGuard habilitado.
- El kernel debe soportar reenvío de IP.
- Los permisos de firewall deben permitir la interfaz de YAT.
- En hosts con Docker, revisa las reglas de `FORWARD` y `DOCKER-USER`.

Más detalles en [Redes WireGuard](./wireguard-networking.md) y [Configuración de Edge WireGuard](./edge/wireguard.md).

> 📸 ![Transport mode selection](/guide/images/snapshot-tunnel-create-02.png) Selección de modo en el asistente de túnel

## Diagnóstico

| Síntoma | Primera comprobación |
|---------|----------------------|
| P2P nunca conecta | Cambia temporalmente a Relay Mode |
| HTTP devuelve 502 | Comprueba que el servicio local responde |
| TCP rechaza la conexión | Revisa puerto remoto y firewall de Edge |
| UDP pierde paquetes | Mide pérdida y latencia de red |
| WireGuard no reenvía | Verifica IP forwarding y reglas de firewall |

## Recursos relacionados

- [Gestión de túneles](./tunnel-management.md)
- [Aplicaciones y extensiones](./apps-and-extensions.md)
- [Preguntas frecuentes](./faq.md)

---
*Última actualización del documento: 2026-05-04*
