# Referencia de configuración de Edge

> `config.yaml` define identidad, conexión con Captain, puertos, TLS, límites, WireGuard y registros.

## Orden de carga

1. Valores predeterminados
2. `config.yaml`
3. Variables de entorno
4. Opciones de línea de comandos

Las opciones de línea de comandos tienen prioridad. Rutas relativas se interpretan desde el directorio de datos de Edge.

## Ejemplo

```yaml
node:
  name: my-edge
  region: sin
  public_address: edge.example.com

controller:
  address: captain.example.com:443
  insecure: false

tunnel:
  domain: edge.example.com
  http_port: 80
  https_port: 443
  tcp_ports: [10000-10100]
  udp_ports: [20000-20100]

wireguard:
  enabled: true
  listen_port: 51820
  subnet: 100.64.0.0/16

log:
  level: info
  file: /var/lib/yat-edge/log/app.log
```

## Secciones

### `node`

| Clave | Descripción |
|-------|-------------|
| `name` | Nombre del nodo |
| `region` | Región o etiqueta de ubicación |
| `public_address` | Dominio o IP pública |

### `controller`

| Clave | Descripción |
|-------|-------------|
| `address` | Endpoint de Captain |
| `insecure` | Solo para pruebas; desactiva verificación TLS |

### `tunnel`

| Clave | Descripción |
|-------|-------------|
| `domain` | Dominio base del Edge |
| `http_port` | Puerto HTTP |
| `https_port` | Puerto HTTPS |
| `tcp_ports` | Puertos o rangos TCP |
| `udp_ports` | Puertos o rangos UDP |

### `wireguard`

| Clave | Descripción |
|-------|-------------|
| `enabled` | Habilita la función |
| `listen_port` | Puerto UDP |
| `subnet` | Subred virtual |
| `mtu` | MTU, normalmente 1420 |

### `log`

| Clave | Valores | Descripción |
|-------|---------|-------------|
| `level` | `debug`, `info`, `warn`, `error` | Nivel de registro |
| `file` | ruta | Archivo de salida |

### `performance`

| Clave | Descripción |
|-------|-------------|
| `max_connections` | Conexiones simultáneas |
| `bandwidth_limit` | Límite de ancho de banda |
| `worker_threads` | Hilos de trabajo |

## Recursos relacionados

- [Parámetros de arranque](./startup-params.md)
- [CLI](./cli-reference.md)
- [Configuración de WireGuard](./wireguard.md)

---
*YAT Team*
