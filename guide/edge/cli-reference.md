# Edge CLI Command Reference

> Complete command-line tool reference for Edge server

---

## 📋 Overview

The Edge binary (`edge`) provides a set of command-line tools for managing server lifecycle, tunnels, channels, and WireGuard networks.

### Basic Usage

```bash
edge <command> [subcommand] [flags]
```

### Global Parameters

The following parameters apply to all commands:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--data` | Platform default | Data directory path (Linux: `/var/lib/edge`, macOS: `~/.edge`) |
| `--log-level` | `info` | Log level: `debug` / `info` / `warn` / `error` |

### Command Overview

```
edge
├── version                  # View version info
├── server                   # Server management
│   ├── start                # Start server
│   ├── stop                 # Stop server
│   ├── restart              # Restart server
│   ├── status               # View running status
│   ├── online               # Register to control center (go online)
│   └── offline              # Unregister from control center (go offline)
├── tunnel                   # Tunnel management
│   ├── list                 # List tunnels
│   ├── info <id>            # View tunnel details
│   ├── remove <id>          # Delete tunnel
│   └── clean                # Clean deleted tunnels
├── channel                  # Channel management
│   ├── list                 # List active channels
│   └── info <id>            # View channel details
└── networks                 # WireGuard network management
    ├── list                 # List networks
    ├── info <id>            # View network details
    ├── members <id>         # List network members
    ├── remove <id>          # Delete network
    └── rate-limit <id> ...  # Manage peer rate limiting
```

---

## Version Info

### `edge version`

Display Edge version number, build time, Git commit, and runtime info.

```bash
edge version
```

**Example output**:

```
Version: 1.2.0
Build:   2026-09-20T10:30:00Z
Commit:  abc1234
Runtime: go1.22.0 linux/amd64
```

---

## Server Management

### `edge server start`

Start the Edge server.

```bash
edge server start [flags]
```

**Parameters**:

| Parameter | Short | Default | Description |
|-----------|-------|---------|-------------|
| `--config` | `-c` | `~/.yat/config.yml` | Config file path |
| `--daemon` | `-d` | `false` | Run in background daemon mode |
| `--pid-file` | | `~/.edge/RUNNING` | PID file path |
| `--sock-file` | | `~/.edge/.edge.sock` | IPC socket file path |

> 📖 For complete startup parameters, see [Startup Parameters Reference](./startup-params.md)

**Examples**:

```bash
# Start in foreground (dev/debug)
edge server start -c config.yaml

# Start in background (production)
sudo edge server start -d -c /etc/yat/edge.yaml

# Specify data directory
edge server start --data /var/lib/edge
```

### `edge server stop`

Stop a running Edge server.

```bash
edge server stop [flags]
```

**Parameters**:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--pid-file` | `~/.edge/RUNNING` | PID file path |

**Example**:

```bash
# Stop service
sudo edge server stop

# Specify PID file
edge server stop --pid-file ./edge.pid
```

**Behavior**:
- Sends SIGTERM to the running process
- Waits for graceful shutdown (up to 30 seconds)
- Automatically cleans up PID file

### `edge server restart`

Restart the Edge server (stop, wait 1 second, then start).

```bash
edge server restart [flags]
```

**Parameters**:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--config` | `~/.yat/config.yml` | Config file path |
| `--pid-file` | `~/.edge/RUNNING` | PID file path |

**Example**:

```bash
sudo edge server restart -c /etc/yat/edge.yaml
```

### `edge server status`

View Edge server running status.

```bash
edge server status [flags]
```

**Example output**:

```
Edge server is running
PID: 12345
PID file: /var/run/edge.pid
```

Or:

```
Edge server is not running
```

### `edge server online`

Register Edge to the control center (mark as online). **Service must be running**.

```bash
edge server online [flags]
```

**Use cases**:
- Manually go online after service startup
- Restore service after maintenance window

### `edge server offline`

Unregister Edge from the control center (mark as offline). **Service must be running**.

```bash
edge server offline [flags]
```

**Use cases**:
- Temporary downtime for maintenance
- Pre-migration decommission
- Prevent control center from assigning new connections

> 💡 `online` / `offline` only change the control center registration status, they **do not stop or restart the service**.

---

## Tunnel Management

### `edge tunnel list`

List all tunnel definitions on the current Edge.

```bash
edge tunnel list [flags]
```

**Parameters**:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--sock-file` | `~/.edge/.edge.sock` | IPC socket file path |

**Example**:

```bash
edge tunnel list
```

### `edge tunnel info`

View detailed information for a specific tunnel.

```bash
edge tunnel info <tunnel-id> [flags]
```

**Example**:

```bash
edge tunnel info tun-abc123
```

### `edge tunnel remove`

Soft-delete a tunnel definition (marked as deleted, not immediately cleaned up).

```bash
edge tunnel remove <tunnel-id> [flags]
```

### `edge tunnel clean`

Clean up all tunnel definitions marked for deletion (permanent delete).

```bash
edge tunnel clean [flags]
```

---

## Channel Management

### `edge channel list`

List currently active channels.

```bash
edge channel list [flags]
```

### `edge channel info`

View detailed information for a specific channel.

```bash
edge channel info <channel-id> [flags]
```

---

## WireGuard Network Management

### `edge networks list`

List all WireGuard networks on the current Edge.

```bash
edge networks list [flags]
```

**Parameters**:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--db` | empty | Database file path (auto-detected by default) |
| `--sock-file` | `~/.edge/.edge.sock` | IPC socket file path |

**Example**:

```bash
edge networks list
```

### `edge networks info`

View detailed information for a specific WireGuard network, including members and peer sessions.

```bash
edge networks info <network-id> [flags]
```

**Example**:

```bash
edge networks info net-abc123
```

### `edge networks members`

List members (devices) of a specific network.

```bash
edge networks members <network-id> [flags]
```

**Example**:

```bash
edge networks members net-abc123
```

### `edge networks remove`

Delete a WireGuard network and its member and session data.

```bash
edge networks remove <network-id> [flags]
```

::: warning
This operation permanently deletes network data. Use with caution.
:::

### `edge networks rate-limit`

Manage per-peer egress bandwidth limits in a WireGuard network. **Requires Edge service running**.

```bash
edge networks rate-limit <network-id> <set|remove|query> [peer-ip] [rate] [ceil]
```

**Operations**:

| Operation | Usage | Description |
|-----------|-------|-------------|
| `set` | `set <peer-ip> <rate> [ceil]` | Set peer rate limit (bytes/sec) |
| `remove` | `remove <peer-ip>` | Remove peer's individual rate limit |
| `query` | `query [peer-ip]` | Query rate limit configuration |

**Examples**:

```bash
# Set peer rate limit: 1 Mbps (125000 bytes/sec)
edge networks rate-limit net-abc123 rate-limit set 10.25.0.2 125000

# Set asymmetric rate limit: 1 Mbps guaranteed, 4 Mbps burst ceiling
edge networks rate-limit net-abc123 rate-limit set 10.25.0.2 125000 500000

# Remove peer's individual rate limit (fallback to default)
edge networks rate-limit net-abc123 rate-limit remove 10.25.0.2

# Query all peers' rate limit configuration
edge networks rate-limit net-abc123 rate-limit query

# Query single peer's rate limit
edge networks rate-limit net-abc123 rate-limit query 10.25.0.2
```

> 💡 `rate` and `ceil` units are **bytes/sec**. Conversion: 1 Mbps = 125,000 bytes/sec.

---

## Signal Handling

Edge server supports the following system signals:

```bash
# Graceful stop
kill -TERM $(cat /var/run/edge.pid)

# Immediate stop
kill -QUIT $(cat /var/run/edge.pid)

# Force stop (Ctrl+C)
kill -INT $(cat /var/run/edge.pid)
```

---

## Common Errors

### Permission Denied

```
Error: write pid file: open /var/run/edge.pid: permission denied
```

**Solution**: Run with `sudo`, or specify a writable path `--pid-file ./edge.pid`.

### Server Not Running

```
Error: server is not running, please start the server first
```

**Solution**: Start the service first with `edge server start`, or check if `--pid-file` path is correct.

### Already Running

```
Error: daemon already running with PID 12345
```

**Solution**: Stop the service first with `edge server stop`, or use `edge server restart`.

---

## Getting Help

```bash
# View all commands
edge --help

# View subcommand help
edge server --help
edge server start --help
edge networks --help
edge networks rate-limit --help
```

---

## 🔗 Related Documentation

- [Edge Server Management](./management.md) — Deploy and manage Edge
- [Startup Parameters](./startup-params.md) — Complete startup parameter list
- [Config Reference](./config-reference.md) — YAML configuration reference
- [WireGuard Configuration](./wireguard.md) — WireGuard system requirements and configuration

---

*YAT Team - Making intranet penetration simpler*
