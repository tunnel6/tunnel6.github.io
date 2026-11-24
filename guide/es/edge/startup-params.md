# Parámetros de arranque de Edge

> Los parámetros de `edge server start` sobrescriben `config.yaml` y son útiles en contenedores o scripts temporales.

## Uso

```bash
edge server start --config /etc/yat-edge/config.yaml
edge server start --daemon
edge server start --public-address edge.example.com
```

## Procesos y rutas

| Parámetro | Descripción |
|-----------|-------------|
| `--config` | Archivo de configuración |
| `--data-dir` | Directorio de datos |
| `--pid-file` | Archivo PID |
| `--daemon` | Ejecuta en segundo plano |

## Red

| Parámetro | Descripción |
|-----------|-------------|
| `--public-address` | Dominio o IP pública |
| `--controller-address` | Endpoint de Captain |
| `--http-port` | Puerto HTTP |
| `--https-port` | Puerto HTTPS |

## TLS

| Parámetro | Descripción |
|-----------|-------------|
| `--cert-file` | Certificado TLS |
| `--key-file` | Clave privada |
| `--ca-file` | CA de confianza |

## TCP / UDP

| Parámetro | Descripción |
|-----------|-------------|
| `--tcp-ports` | Puertos o rangos TCP |
| `--udp-ports` | Puertos o rangos UDP |

## WireGuard

| Parámetro | Descripción |
|-----------|-------------|
| `--wireguard-enabled` | Habilita WireGuard |
| `--wireguard-listen-port` | Puerto UDP |
| `--wireguard-subnet` | Subred virtual |
| `--wireguard-mtu` | MTU |

## Registros

| Parámetro | Valores |
|-----------|---------|
| `--log-level` | `debug`, `info`, `warn`, `error` |
| `--log-file` | Ruta de archivo |

## Prioridad

La prioridad es: valores predeterminados, `config.yaml`, variables de entorno y parámetros CLI. En producción, guarda la configuración permanente en `config.yaml` y usa CLI solo para pruebas o orquestación.

## Recursos relacionados

- [Referencia de configuración](./config-reference.md)
- [CLI](./cli-reference.md)
- [Configuración de WireGuard](./wireguard.md)

---
*YAT Team*
