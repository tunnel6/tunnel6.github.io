# Edge Configuration Reference

> Complete reference for Edge server `config.yaml` configuration items

---

## 📋 Overview

Edge server controls all features via YAML configuration files. The config file path is specified via `--config` parameter, defaulting to `~/.yat/config.yml`.

### Configuration Loading Order

```
Defaults → YAML file overrides → Startup config injection (Captain) → CLI parameter overrides
```

Later-loaded configuration overrides earlier values.

### Configuration File Example

For a complete configuration template, see [`config.example.yaml`](https://github.com/tunnel6/yat/blob/main/edge/config.example.yaml).

---

## 📑 Configuration Items

### 1. Node Identity (node)

Defines the Edge node's basic identity information.

| Config Key | Type | Default | Description |
|------------|------|---------|-------------|
| `node.zone` | string | `"default"` | Node zone, e.g. `cn-east-1` |
| `node.type` | string | `"private"` | Node type: `private` / `public` / `shared` |
| `node.public_address` | string | empty | Edge public address, format `IP:PORT` or `DOMAIN:PORT`. Used as AdvertiseHost for P2P hole punching |

::: tip About node.id
`node.id` doesn't need manual configuration. Edge automatically resolves it from the `EDGE_SECRET` environment variable at startup. Format: `{edge_id}.{token}`.
:::

**Example**:

```yaml
node:
  zone: "cn-east-1"
  type: "private"
  public_address: "203.0.113.1:9000"
```

---

### 2. Controller Connection (controller)

Configure Edge's connection to the Captain control plane.

| Config Key | Type | Default | Description |
|------------|------|---------|-------------|
| `controller.address` | string | `"captain.tunnel6.com:8808"` | Captain server address |
| `controller.heartbeat_interval` | duration | `30s` | Heartbeat interval |
| `controller.reconnect_interval` | duration | `5s` | Reconnect interval on disconnect |

#### 2.1 TLS Configuration (controller.tls)

| Config Key | Type | Default | Description |
|------------|------|---------|-------------|
| `controller.tls.enabled` | bool | `true` | Enable TLS (must be enabled in production) |
| `controller.tls.ca` | string | empty | CA certificate path, leave empty to use embedded CA |
| `controller.tls.cert` | string | empty | TLS certificate path |
| `controller.tls.key` | string | empty | TLS private key path |

#### 2.2 Certificate Bootstrap (controller.bootstrap)

Edge automatically obtains certificates via the Bootstrap process on first startup.

| Config Key | Type | Default | Description |
|------------|------|---------|-------------|
| `controller.bootstrap.registration_secret` | string | empty | Registration secret, uses `EDGE_SECRET` env var if empty |
| `controller.bootstrap.data` | string | Platform default | Data directory path (see table below) |
| `controller.bootstrap.client_cert_validity` | duration | `8760h` (1 year) | Client certificate validity |

**Data Directory Defaults**:

| Platform | Default Path |
|----------|-------------|
| Linux | `/var/lib/edge` |
| macOS | `~/.edge` |
| Other | `./data` |

The data directory stores:
- `edge-id` — Edge unique identifier
- `assigned-domain` — Captain-assigned domain
- `root-ca.crt` — Root CA certificate
- `edge-tls.crt` / `edge-tls.key` — Edge TLS certificate pair

**Example**:

```yaml
controller:
  address: "captain.yat.io:8808"
  heartbeat_interval: 30s
  reconnect_interval: 5s
  tls:
    enabled: true
  bootstrap:
    registration_secret: ""
    data: "/var/lib/edge"
    client_cert_validity: 8760h
```

---

### 3. Tunnel Service (tunnel)

Configure Edge's tunnel listening and session management.

| Config Key | Type | Default | Description |
|------------|------|---------|-------------|
| `tunnel.listen` | string | `"0.0.0.0:9000"` | Tunnel listen address |
| `tunnel.max_sessions` | int | `1000` | Max concurrent sessions |
| `tunnel.session_timeout` | duration | `5m` | Session timeout |

#### 3.1 Tunnel Limits (tunnel.limits)

| Config Key | Type | Default | Description |
|------------|------|---------|-------------|
| `tunnel.limits.max_per_session` | int | `0` | Max tunnels per user session, `0` = unlimited |
| `tunnel.limits.max_total` | int | `0` | Max total tunnels for this edge, `0` = unlimited |

#### 3.2 Tunnel TLS (tunnel.tls)

| Config Key | Type | Default | Description |
|------------|------|---------|-------------|
| `tunnel.tls.enabled` | bool | `true` | Enable TLS |
| `tunnel.tls.ca` | string | empty | Auto-uses `root-ca.crt` from data directory if empty |
| `tunnel.tls.cert` | string | empty | Auto-uses `edge-tls.crt` from data directory if empty |
| `tunnel.tls.key` | string | empty | Auto-uses `edge-tls.key` from data directory if empty |

**Example**:

```yaml
tunnel:
  listen: "0.0.0.0:9000"
  max_sessions: 1000
  session_timeout: 5m
  limits:
    max_per_session: 5
    max_total: 1000
  tls:
    enabled: true
```

---

### 4. Protocol Proxies (proxy)

Edge supports multiple protocol proxies, each independently configured.

#### 4.1 HTTP Proxy (proxy.http)

| Config Key | Type | Default | Description |
|------------|------|---------|-------------|
| `proxy.http.enabled` | bool | `true` | Enable HTTP proxy |
| `proxy.http.port` | int | `80` | HTTP public port |
| `proxy.http.https_port` | int | `443` | HTTPS public port |
| `proxy.http.addr` | string | empty | Listen address, empty uses `:<port>` |
| `proxy.http.timeout` | duration | `30s` | Request timeout |
| `proxy.http.buffer` | string | `"16K"` | Read buffer size, supports K/M suffix |
| `proxy.http.buffer_lock` | bool | `false` | Lock buffer to fixed size, disable dynamic window |
| `proxy.http.eager_start` | bool | `false` | Start HTTP proxy immediately on boot |

::: tip About HTTPS Certificates
`proxy.http.https_server_cert` and `proxy.http.https_server_key` are local-only fields for specifying HTTPS certificate paths, not reported to Captain. Usually left empty and managed automatically.
:::

**Example**:

```yaml
proxy:
  http:
    enabled: true
    port: 80
    https_port: 443
    timeout: 30s
    buffer: "16K"
```

#### 4.2 TCP Proxy (proxy.tcp)

| Config Key | Type | Default | Description |
|------------|------|---------|-------------|
| `proxy.tcp.enabled` | bool | `true` | Enable TCP proxy |
| `proxy.tcp.port_min` | int | `30000` | Port range start |
| `proxy.tcp.port_max` | int | `40000` | Port range end |

**Example**:

```yaml
proxy:
  tcp:
    enabled: true
    port_min: 30000
    port_max: 40000
```

#### 4.3 UDP Proxy (proxy.udp)

| Config Key | Type | Default | Description |
|------------|------|---------|-------------|
| `proxy.udp.enabled` | bool | `true` | Enable UDP proxy |
| `proxy.udp.port_min` | int | `30000` | Port range start |
| `proxy.udp.port_max` | int | `40000` | Port range end |

**Example**:

```yaml
proxy:
  udp:
    enabled: true
    port_min: 30000
    port_max: 40000
```

#### 4.4 WireGuard (proxy.wireguard)

WireGuard networking configuration. See [WireGuard Configuration Guide](./wireguard.md) for detailed setup.

| Config Key | Type | Default | Description |
|------------|------|---------|-------------|
| `proxy.wireguard.enabled` | bool | `false` | Enable WireGuard |
| `proxy.wireguard.interface` | string | `"wg0"` | WireGuard interface name |
| `proxy.wireguard.subnet` | string | `"10.0.0.1/24"` | WireGuard subnet |
| `proxy.wireguard.interface_prefix` | string | `"wg-yat0"` | Interface name prefix |
| `proxy.wireguard.listen_port_base` | int | `58021` | WG interface listen port base |
| `proxy.wireguard.key_dir` | string | empty | Key storage directory |
| `proxy.wireguard.public_endpoint` | string | empty | Edge public address (without port) |
| `proxy.wireguard.relay_enabled` | bool | `false` | Enable Edge-side relay forwarding |
| `proxy.wireguard.forwarder_strategy` | string | empty | Forwarding strategy: `kernel` (default) / `ebpf` (experimental, requires Linux 5.8+) |
| `proxy.wireguard.default_peer_rate` | int | `0` | Per-peer guaranteed bandwidth (bytes/sec), `0` = unlimited |
| `proxy.wireguard.default_peer_ceil` | int | `0` | Per-peer burst ceiling (bytes/sec), `0` = same as `default_peer_rate` |

**Example**:

```yaml
proxy:
  wireguard:
    enabled: true
    subnet: "10.0.0.1/24"
    relay_enabled: true
    forwarder_strategy: "kernel"
    default_peer_rate: 125000    # 1 Mbps
    default_peer_ceil: 500000    # 4 Mbps
```

#### 4.5 P2P / ICE (proxy.ice)

P2P direct connection uses ICE protocol for NAT traversal.

| Config Key | Type | Default | Description |
|------------|------|---------|-------------|
| `proxy.ice.enabled` | bool | `false` | Enable ICE P2P hole punching |
| `proxy.ice.udp_addr` | string | empty | P2P UDP listen address, e.g. `0.0.0.0:9000` |
| `proxy.ice.udp_addr_alt` | string | empty | Alternative UDP listen address |

::: tip Configure via channel.p2p
Recommended to configure P2P via `channel.p2p`, which automatically maps to `proxy.ice`:
- `channel.p2p.enabled` → `proxy.ice.enabled`
- `channel.p2p.udp_addr` → `proxy.ice.udp_addr` (auto-enables ICE when set)
:::

---

### 5. Channel Business (channel)

Configure channel-related business parameters.

| Config Key | Type | Default | Description |
|------------|------|---------|-------------|
| `channel.custom_domain` | string | empty | Custom domain (user's own domain) |
| `channel.alias_domain_policy` | string | `"optional"` | Alias domain policy: `disabled` / `optional` / `required` |
| `channel.max_channels_per_user` | int | `10` | Max channels per user |
| `channel.max_bandwidth_mbps` | int | `100` | Max bandwidth (Mbps) |

#### 5.1 P2P Configuration (channel.p2p)

This is the **recommended configuration entry** for P2P, which automatically maps to `proxy.ice`.

| Config Key | Type | Default | Description |
|------------|------|---------|-------------|
| `channel.p2p.enabled` | bool | empty | Enable P2P direct connection. Auto-enabled when `udp_addr` is set |
| `channel.p2p.udp_addr` | string | empty | P2P UDP listen address, e.g. `0.0.0.0:9000` |

**Example**:

```yaml
channel:
  custom_domain: ""
  max_channels_per_user: 10
  max_bandwidth_mbps: 100
  p2p:
    enabled: true
    udp_addr: "0.0.0.0:9000"
```

---

### 6. Logging (log)

| Config Key | Type | Default | Description |
|------------|------|---------|-------------|
| `log.output` | string | empty | Output mode: `console` / `file` |
| `log.file` | string | empty | Log file path (effective when `output=file`) |
| `log.level` | string | empty | Log level: `debug` / `info` / `warn` / `error` / `fatal` / `panic` |

**Example**:

```yaml
log:
  output: "file"
  file: "./certs/edge.log"
  level: "info"
```

---

### 7. Billing (billing)

| Config Key | Type | Default | Description |
|------------|------|---------|-------------|
| `billing.enabled` | bool | `true` | Enable billing |
| `billing.owner_bypass` | bool | `true` | Owner exempt from billing |
| `billing.cache_duration` | duration | `5m` | Billing cache duration |

---

## 🔧 Configuration Override Priority

When the same parameter is set by multiple sources, the following priority applies (high → low):

| Priority | Source | Description |
|----------|--------|-------------|
| 1 (highest) | CLI Parameters | `edge server start --xxx` command-line arguments |
| 2 | Startup Config Injection | Captain-delivered `--startup.config_b64` / `--startup.config_json` |
| 3 | YAML Config File | Values in `config.yaml` |
| 4 (lowest) | Defaults | Built-in default values in code |

---

## 📝 Complete Configuration Example

A typical production configuration:

```yaml
# Node identity
node:
  zone: "cn-east-1"
  type: "private"
  public_address: "203.0.113.1:9000"

# Controller connection
controller:
  address: "captain.yat.io:8808"
  heartbeat_interval: 30s
  reconnect_interval: 5s
  tls:
    enabled: true
  bootstrap:
    registration_secret: ""
    data: "/var/lib/edge"
    client_cert_validity: 8760h

# Tunnel service
tunnel:
  listen: "0.0.0.0:9000"
  max_sessions: 1000
  session_timeout: 5m
  limits:
    max_per_session: 5
    max_total: 1000
  tls:
    enabled: true

# Logging
log:
  output: "file"
  file: "/var/log/edge.log"
  level: "info"

# Protocol proxies
proxy:
  http:
    enabled: true
    port: 80
    https_port: 443
    timeout: 30s
    buffer: "16K"

  tcp:
    enabled: true
    port_min: 30000
    port_max: 40000

  udp:
    enabled: true
    port_min: 30000
    port_max: 40000

  wireguard:
    enabled: true
    subnet: "10.0.0.1/24"
    relay_enabled: true
    forwarder_strategy: "kernel"

# Channel business
channel:
  max_channels_per_user: 10
  max_bandwidth_mbps: 100
  p2p:
    enabled: true
    udp_addr: "0.0.0.0:9000"
```

---

## 🔗 Related Documentation

- [Edge Server Management](./management.md) — Deploy and manage Edge
- [WireGuard Networking](../wireguard-networking.md) — WireGuard detailed configuration
- [Transport Modes](../transport-modes.md) — Understand protocol modes
- [FAQ](./faq.md) — Configuration troubleshooting

---

*YAT Team - Making intranet penetration simpler*
