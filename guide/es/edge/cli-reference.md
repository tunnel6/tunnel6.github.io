# Referencia CLI de Edge

> El binario `edge` permite gestionar el servidor, túneles, canales y redes WireGuard desde línea de comandos.

## Uso

```bash
edge <grupo> <comando> [parámetros]
```

Opciones globales frecuentes:

| Opción | Función |
|--------|---------|
| `--config` | Archivo de configuración |
| `--data-dir` | Directorio de datos |
| `--log-level` | Nivel de registro |
| `--help` | Ayuda del comando |

## Información

```bash
edge version
```

## Servidor

```bash
# Primer plano
edge server start --config config.yaml

# Daemon
edge server start --daemon --config config.yaml

# Estado y control
edge server status
edge server stop
edge server restart
edge server online
edge server offline
```

## Tuneles y canales

```bash
edge tunnel list
edge tunnel info --id <tunnel-id>
edge tunnel remove --id <tunnel-id>
edge tunnel clean

edge channel list
edge channel info --id <channel-id>
```

## Redes WireGuard

```bash
edge networks list
edge networks info --id <network-id>
edge networks members --id <network-id>
edge networks remove --id <network-id>

# Límite de velocidad por miembro
edge networks rate-limit --network <id> --peer <peer-id> --rate 125000
edge networks rate-limit --network <id> --peer <peer-id> --guaranteed 125000 --burst 500000
edge networks rate-limit --network <id> --peer <peer-id> --remove
edge networks rate-limit --network <id> --query
```

## Señales

- `SIGTERM`: parada ordenada
- `SIGINT`: parada inmediata desde la terminal

## Errores frecuentes

| Error | Causa habitual |
|-------|----------------|
| `permission denied` | Falta permiso para interfaces, sockets o archivos |
| `server not running` | El proceso no está activo o el PID es incorrecto |
| `already running` | Hay otro Edge usando el mismo directorio de datos |

## Ayuda

```bash
edge --help
edge server --help
edge server start --help
```

## Recursos relacionados

- [Referencia de configuración](./config-reference.md)
- [Gestión de Edge](./management.md)

---
*YAT Team*
