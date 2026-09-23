# Edge Startup Parameters Reference

> Complete command-line parameter list for `edge server start`

---

## 📋 Overview

Edge server is started and configured via command-line parameters. CLI parameters have the **highest priority**, overriding YAML config files and Captain-injected startup config.

### Configuration Priority

```
CLI Parameters (highest) > Startup Config Injection > YAML Config File > Defaults (lowest)
```

### Basic Usage

```bash
# Start in foreground
./edge server start --config config.yaml

# Start in daemon mode
./edge server start --config config.yaml --daemon

# Specify public address
./edge server start --config config.yaml --public 203.0.113.1
```

---

## Parameter List

### Process & Paths

| Parameter | Short | Default | Description |
|-----------|-------|---------|-------------|
| `--config` | `-c` | `~/.yat/config.yml` | Config file path |
| `--daemon` | `-d` | `false` | Run in daemon mode |
| `--pid-file` | | `~/.edge/RUNNING` | PID file path |
| `--sock-file` | | `~/.edge/.edge.sock` | IPC socket file path |

### Core Network

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--public` | empty | Public IP or domain (without port) |
| `--domain` | empty | Custom domain for HTTP channels |
| `--controller.address` | empty | Controller server address |
| `--channel.alias_domain_policy` | empty | Alias domain policy: `disabled` \| `optional` \| `required` |
| `--tunnel.listen` | empty | Tunnel listen address |
| `--tunnel.max_sessions` | `0` | Max sessions (0=unlimited) |

### TLS Certificates

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--tunnel.tls.ca` | empty | TLS CA certificate path |
| `--tunnel.tls.cert` | empty | TLS server certificate path |
| `--tunnel.tls.key` | empty | TLS server private key path |

### HTTP Channels

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--channel.http.enable` | `true` | Enable HTTP channels/proxy |
| `--channel.http.port` | `0` | HTTP proxy port |
| `--channel.https.port` | `0` | HTTPS proxy port |
| `--channel.http.addr` | empty | HTTP proxy listen address |
| `--channel.http.timeout` | `0` | HTTP proxy request timeout |
| `--channel.http.buffer` | empty | HTTP channel read buffer size (supports K/M suffix) |
| `--channel.http.buffer.lock` | `false` | Lock buffer to fixed size, disable dynamic window |
| `--channel.http.eager_start` | `false` | Start HTTP proxy on boot |

### TCP / UDP Channels

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--channel.tcp.enable` | `true` | Enable TCP channels |
| `--channel.tcp.port_min` | `0` | TCP port range start |
| `--channel.tcp.port_max` | `0` | TCP port range end |
| `--channel.udp.enable` | `true` | Enable UDP channels |
| `--channel.udp.port_min` | `0` | UDP port range start |
| `--channel.udp.port_max` | `0` | UDP port range end |

### WireGuard

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--channel.wireguard.enable` | `true` | Enable WireGuard functionality |
| `--channel.wireguard.relay_enabled` | `false` | Enable Edge-side relay forwarding |
| `--channel.wireguard.public_endpoint` | Same as `--public` | WireGuard relay public address (without port) |

### P2P

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--server.capabilities.auto_enable` | `true` | Auto-enable services based on client capabilities |
| `--server.capabilities.p2p` | `true` | Enable P2P capability |
| `--channel.p2p.udp_addr` | empty | P2P UDP listen address, e.g. `0.0.0.0:9000` |

### Tunnel Limits

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--tunnel.limits.max_per_session` | `0` | Max tunnels per user session (0=unlimited) |
| `--tunnel.limits.max_total` | `0` | Max total tunnels for this edge (0=unlimited) |

### CSR Forwarder

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--csr.forwarder.enable` | `true` | Enable CSR forwarder |
| `--csr.forwarder.subca_serial` | empty | CSR forwarder sub-CA serial number |

### Logging

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--log.output` | `console` | Log output mode: `console` \| `file` |
| `--log.file` | empty | Log file path (effective when `log.output=file`) |
| `--log.level` | empty | Log level: `debug` \| `info` \| `warn` \| `error` \| `fatal` \| `panic` |

### Startup Config Injection

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--startup.config_b64` | empty | Startup config (Base64 encoded JSON), delivered by Captain |
| `--startup.config_json` | empty | Startup config (raw JSON) |

---

## 🔗 Related Documentation

- [Edge Server Management](./management.md) — Deploy and manage Edge
- [Config Reference](./config-reference.md) — YAML configuration reference
- [WireGuard Networking](../wireguard-networking.md) — WireGuard detailed configuration

---

*YAT Team - Making intranet penetration simpler*
