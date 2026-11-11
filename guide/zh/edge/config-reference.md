# Edge 配置参数参考

> Edge 服务器 `config.yaml` 配置项完整参考手册

---

## 📋 概述

Edge 服务器通过 YAML 配置文件控制所有功能。配置文件路径通过 `--config` 参数指定，默认为 `~/.yat/config.yml`。

### 配置加载顺序

```
默认值 → YAML 文件覆盖 → 启动配置注入（Captain 下发） → CLI 参数覆盖
```

后加载的配置会覆盖先加载的值。

### 配置文件示例

完整的配置模板请参考 [`config.example.yaml`](https://github.com/tunnel6/yat/blob/main/edge/config.example.yaml)。

---

## 📑 配置项一览

### 1. 节点身份（node）

定义 Edge 节点的基本身份信息。

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `node.zone` | 字符串 | `"default"` | 节点所在区域，如 `cn-east-1` |
| `node.type` | 字符串 | `"private"` | 节点类型：`private`（私有）/ `public`（公共）/ `shared`（共享） |
| `node.public_address` | 字符串 | 空 | Edge 的公网地址，格式 `IP:PORT` 或 `DOMAIN:PORT`。用于 P2P 打洞的 AdvertiseHost |

::: tip 关于 node.id
`node.id` 无需手动配置，Edge 启动时会自动从 `EDGE_SECRET` 环境变量中解析。格式为 `{edge_id}.{token}`。
:::

**示例**：

```yaml
node:
  zone: "cn-east-1"
  type: "private"
  public_address: "203.0.113.1:9000"
```

---

### 2. 控制器连接（controller）

配置 Edge 与 Captain 控制平面的连接参数。

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `controller.address` | 字符串 | `"captain.tunnel6.com:8808"` | Captain 服务器地址 |
| `controller.heartbeat_interval` | 时长 | `30s` | 心跳间隔 |
| `controller.reconnect_interval` | 时长 | `5s` | 断线重连间隔 |

#### 2.1 TLS 配置（controller.tls）

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `controller.tls.enabled` | 布尔 | `true` | 是否启用 TLS（生产环境必须启用） |
| `controller.tls.ca` | 字符串 | 空 | CA 证书路径，留空使用嵌入的 CA |
| `controller.tls.cert` | 字符串 | 空 | TLS 证书路径 |
| `controller.tls.key` | 字符串 | 空 | TLS 私钥路径 |

#### 2.2 证书引导（controller.bootstrap）

Edge 首次启动时通过 Bootstrap 流程自动获取证书。

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `controller.bootstrap.registration_secret` | 字符串 | 空 | 注册密钥，留空时使用 `EDGE_SECRET` 环境变量 |
| `controller.bootstrap.data` | 字符串 | 平台默认 | 数据目录路径（见下表） |
| `controller.bootstrap.client_cert_validity` | 时长 | `8760h`（1 年） | 客户端证书有效期 |

**数据目录默认值**：

| 平台 | 默认路径 |
|------|---------|
| Linux | `/var/lib/edge` |
| macOS | `~/.edge` |
| 其他 | `./data` |

数据目录中存储以下文件：
- `edge-id` — Edge 唯一标识
- `assigned-domain` — Captain 分配的域名
- `root-ca.crt` — Root CA 证书
- `edge-tls.crt` / `edge-tls.key` — Edge TLS 证书对

**示例**：

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

### 3. 隧道服务（tunnel）

配置 Edge 的隧道监听和会话管理。

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `tunnel.listen` | 字符串 | `"0.0.0.0:9000"` | 隧道监听地址 |
| `tunnel.max_sessions` | 整数 | `1000` | 最大并发会话数 |
| `tunnel.session_timeout` | 时长 | `5m` | 会话超时时间 |

#### 3.1 隧道限制（tunnel.limits）

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `tunnel.limits.max_per_session` | 整数 | `0` | 单用户最大隧道数，`0` = 不限制 |
| `tunnel.limits.max_total` | 整数 | `0` | Edge 最大隧道总数，`0` = 不限制 |

#### 3.2 隧道 TLS（tunnel.tls）

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `tunnel.tls.enabled` | 布尔 | `true` | 是否启用 TLS |
| `tunnel.tls.ca` | 字符串 | 空 | 留空自动使用数据目录下的 `root-ca.crt` |
| `tunnel.tls.cert` | 字符串 | 空 | 留空自动使用数据目录下的 `edge-tls.crt` |
| `tunnel.tls.key` | 字符串 | 空 | 留空自动使用数据目录下的 `edge-tls.key` |

**示例**：

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

### 4. 协议代理（proxy）

Edge 支持多种协议代理，每种协议独立配置。

#### 4.1 HTTP 代理（proxy.http）

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `proxy.http.enabled` | 布尔 | `true` | 是否启用 HTTP 代理 |
| `proxy.http.port` | 整数 | `80` | HTTP 公开端口 |
| `proxy.http.https_port` | 整数 | `443` | HTTPS 公开端口 |
| `proxy.http.addr` | 字符串 | 空 | 监听地址，留空使用 `:<port>` |
| `proxy.http.timeout` | 时长 | `30s` | 请求超时时间 |
| `proxy.http.buffer` | 字符串 | `"16K"` | 读缓冲区大小，支持 K/M 后缀 |
| `proxy.http.buffer_lock` | 布尔 | `false` | 锁定缓冲区为固定大小，禁用动态窗口 |
| `proxy.http.eager_start` | 布尔 | `false` | 启动时立即启动 HTTP 代理 |

::: tip 关于 HTTPS 证书
`proxy.http.https_server_cert` 和 `proxy.http.https_server_key` 为本地专用字段，用于指定 HTTPS 证书路径，不会上报给 Captain。通常留空，由系统自动管理。
:::

**示例**：

```yaml
proxy:
  http:
    enabled: true
    port: 80
    https_port: 443
    timeout: 30s
    buffer: "16K"
```

#### 4.2 TCP 代理（proxy.tcp）

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `proxy.tcp.enabled` | 布尔 | `true` | 是否启用 TCP 代理 |
| `proxy.tcp.port_min` | 整数 | `30000` | 端口范围起始值 |
| `proxy.tcp.port_max` | 整数 | `40000` | 端口范围结束值 |

**示例**：

```yaml
proxy:
  tcp:
    enabled: true
    port_min: 30000
    port_max: 40000
```

#### 4.3 UDP 代理（proxy.udp）

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `proxy.udp.enabled` | 布尔 | `true` | 是否启用 UDP 代理 |
| `proxy.udp.port_min` | 整数 | `30000` | 端口范围起始值 |
| `proxy.udp.port_max` | 整数 | `40000` | 端口范围结束值 |

**示例**：

```yaml
proxy:
  udp:
    enabled: true
    port_min: 30000
    port_max: 40000
```

#### 4.4 WireGuard（proxy.wireguard）

WireGuard 组网功能配置。详细指南请参考 [启用 WireGuard 功能](./management.md#启用-wireguard-功能)。

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `proxy.wireguard.enabled` | 布尔 | `false` | 是否启用 WireGuard 功能 |
| `proxy.wireguard.interface` | 字符串 | `"wg0"` | WireGuard 接口名称 |
| `proxy.wireguard.subnet` | 字符串 | `"10.0.0.1/24"` | WireGuard 子网地址 |
| `proxy.wireguard.interface_prefix` | 字符串 | `"wg-yat0"` | 接口名称前缀 |
| `proxy.wireguard.listen_port_base` | 整数 | `58021` | WG 接口监听端口起始值 |
| `proxy.wireguard.key_dir` | 字符串 | 空 | 密钥存储目录 |
| `proxy.wireguard.public_endpoint` | 字符串 | 空 | Edge 公网地址（不含端口） |
| `proxy.wireguard.relay_enabled` | 布尔 | `false` | 是否启用 Edge 侧 relay 中继 |
| `proxy.wireguard.forwarder_strategy` | 字符串 | 空 | 转发策略：`kernel`（默认）/ `ebpf`（实验性，需 Linux 5.8+） |
| `proxy.wireguard.default_peer_rate` | 整数 | `0` | 每 peer 保证带宽（bytes/sec），`0` = 不限速 |
| `proxy.wireguard.default_peer_ceil` | 整数 | `0` | 每 peer 突发上限（bytes/sec），`0` = 同 `default_peer_rate` |

**示例**：

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

#### 4.5 P2P / ICE（proxy.ice）

P2P 直连使用 ICE 协议进行 NAT 穿透。

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `proxy.ice.enabled` | 布尔 | `false` | 是否启用 ICE P2P 打洞 |
| `proxy.ice.udp_addr` | 字符串 | 空 | P2P UDP 监听地址，如 `0.0.0.0:9000` |
| `proxy.ice.udp_addr_alt` | 字符串 | 空 | 备用 UDP 监听地址 |

::: tip 通过 channel.p2p 配置
推荐通过 `channel.p2p` 配置 P2P 功能，系统会自动映射到 `proxy.ice`：
- `channel.p2p.enabled` → `proxy.ice.enabled`
- `channel.p2p.udp_addr` → `proxy.ice.udp_addr`（设置后自动启用 ICE）
:::

---

### 5. 通道业务（channel）

配置通道相关的业务参数。

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `channel.custom_domain` | 字符串 | 空 | 自定义域名（用户自己的域名） |
| `channel.alias_domain_policy` | 字符串 | `"optional"` | 别名域名策略：`disabled` / `optional` / `required` |
| `channel.max_channels_per_user` | 整数 | `10` | 每用户最大通道数 |
| `channel.max_bandwidth_mbps` | 整数 | `100` | 最大带宽（Mbps） |

#### 5.1 P2P 配置（channel.p2p）

这是 P2P 功能的**推荐配置入口**，会自动映射到 `proxy.ice`。

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `channel.p2p.enabled` | 布尔 | 空 | 启用 P2P 直连。设置 `udp_addr` 时自动启用 |
| `channel.p2p.udp_addr` | 字符串 | 空 | P2P UDP 监听地址，如 `0.0.0.0:9000` |

**示例**：

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

### 6. 日志（log）

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `log.output` | 字符串 | 空 | 输出模式：`console`（控制台）/ `file`（文件） |
| `log.file` | 字符串 | 空 | 日志文件路径（`output=file` 时生效） |
| `log.level` | 字符串 | 空 | 日志级别：`debug` / `info` / `warn` / `error` / `fatal` / `panic` |

**示例**：

```yaml
log:
  output: "file"
  file: "./certs/edge.log"
  level: "info"
```

---

### 7. 计费（billing）

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `billing.enabled` | 布尔 | `true` | 是否启用计费功能 |
| `billing.owner_bypass` | 布尔 | `true` | 所有者是否免计费 |
| `billing.cache_duration` | 时长 | `5m` | 计费缓存时间 |

---

## 🔧 配置覆盖优先级

当多个来源设置了同一参数时，按以下优先级生效（高 → 低）：

| 优先级 | 来源 | 说明 |
|--------|------|------|
| 1（最高） | CLI 参数 | `edge server start --xxx` 命令行参数 |
| 2 | 启动配置注入 | Captain 下发的 `--startup.config_b64` / `--startup.config_json` |
| 3 | YAML 配置文件 | `config.yaml` 中的值 |
| 4（最低） | 默认值 | 代码中的内置默认值 |

---

## 📝 完整配置示例

以下是一份典型的生产环境配置：

```yaml
# 节点身份
node:
  zone: "cn-east-1"
  type: "private"
  public_address: "203.0.113.1:9000"

# 控制器连接
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

# 隧道服务
tunnel:
  listen: "0.0.0.0:9000"
  max_sessions: 1000
  session_timeout: 5m
  limits:
    max_per_session: 5
    max_total: 1000
  tls:
    enabled: true

# 日志
log:
  output: "file"
  file: "/var/log/edge.log"
  level: "info"

# 协议代理
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

# 通道业务
channel:
  max_channels_per_user: 10
  max_bandwidth_mbps: 100
  p2p:
    enabled: true
    udp_addr: "0.0.0.0:9000"
```

---

## 🔗 相关文档

- [Edge 服务器管理](./management.md) - 部署和管理 Edge
- [WireGuard 组网](./wireguard-networking.md) - WireGuard 详细配置
- [传输模式与协议](./transport-modes.md) - 了解各协议模式
- [常见问题](./faq.md) - 配置相关问题排查

---

*YAT Team - 让内网穿透更简单*
