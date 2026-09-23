# Edge 启动参数参考

> `edge server start` 完整命令行参数列表

---

## 📋 概述

Edge 服务器通过命令行参数启动和配置。命令行参数的**优先级最高**，会覆盖 YAML 配置文件和 Captain 下发的启动配置中的同名参数。

### 配置覆盖优先级

```
CLI 参数（最高） > 启动配置注入 > YAML 配置文件 > 默认值（最低）
```

### 基本用法

```bash
# 前台启动
./edge server start --config config.yaml

# 后台守护进程模式
./edge server start --config config.yaml --daemon

# 指定公网地址
./edge server start --config config.yaml --public 203.0.113.1
```

---

## 参数列表

### 进程与路径

| 参数 | 缩写 | 默认值 | 说明 |
|------|------|--------|------|
| `--config` | `-c` | `~/.yat/config.yml` | 配置文件路径 |
| `--daemon` | `-d` | `false` | 后台守护进程模式运行 |
| `--pid-file` | | `~/.edge/RUNNING` | PID 文件路径 |
| `--sock-file` | | `~/.edge/.edge.sock` | IPC socket 文件路径 |

### 核心网络

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--public` | 空 | 公网 IP 或域名（不含端口） |
| `--domain` | 空 | 自定义域名（用于 HTTP 通道） |
| `--controller.address` | 空 | Controller 服务器地址 |
| `--channel.alias_domain_policy` | 空 | 别名域名策略：`disabled` \| `optional` \| `required` |
| `--tunnel.listen` | 空 | 隧道监听地址 |
| `--tunnel.max_sessions` | `0` | 最大会话数（0=无限制） |

### TLS 证书

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--tunnel.tls.ca` | 空 | TLS CA 证书路径 |
| `--tunnel.tls.cert` | 空 | TLS 服务端证书路径 |
| `--tunnel.tls.key` | 空 | TLS 服务端私钥路径 |

### HTTP 通道

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--channel.http.enable` | `true` | 启用 HTTP 通道/代理 |
| `--channel.http.port` | `0` | HTTP 代理端口 |
| `--channel.https.port` | `0` | HTTPS 代理端口 |
| `--channel.http.addr` | 空 | HTTP 代理监听地址 |
| `--channel.http.timeout` | `0` | HTTP 代理请求超时 |
| `--channel.http.buffer` | 空 | HTTP 通道读缓冲区大小（支持 K/M 后缀） |
| `--channel.http.buffer.lock` | `false` | 锁定缓冲区为固定大小，禁用动态窗口 |
| `--channel.http.eager_start` | `false` | 启动时立即启动 HTTP 代理 |

### TCP / UDP 通道

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--channel.tcp.enable` | `true` | 启用 TCP 通道 |
| `--channel.tcp.port_min` | `0` | TCP 端口范围起始 |
| `--channel.tcp.port_max` | `0` | TCP 端口范围结束 |
| `--channel.udp.enable` | `true` | 启用 UDP 通道 |
| `--channel.udp.port_min` | `0` | UDP 端口范围起始 |
| `--channel.udp.port_max` | `0` | UDP 端口范围结束 |

### WireGuard

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--channel.wireguard.enable` | `true` | 启用 WireGuard 功能 |
| `--channel.wireguard.relay_enabled` | `false` | 启用 Edge 侧 relay 中继 |
| `--channel.wireguard.public_endpoint` | 同 `--public` | WireGuard relay 公网地址（不含端口） |

### P2P

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--server.capabilities.auto_enable` | `true` | 根据客户端能力自动启用服务 |
| `--server.capabilities.p2p` | `true` | 启用 P2P 能力 |
| `--channel.p2p.udp_addr` | 空 | P2P UDP 监听地址，如 `0.0.0.0:9000` |

### 隧道限制

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--tunnel.limits.max_per_session` | `0` | 每个用户会话最大隧道数（0=无限制） |
| `--tunnel.limits.max_total` | `0` | Edge 最大隧道总数（0=无限制） |

### CSR 证书转发

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--csr.forwarder.enable` | `true` | 启用 CSR 转发器 |
| `--csr.forwarder.subca_serial` | 空 | CSR 转发子 CA 序列号 |

### 日志

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--log.output` | `console` | 日志输出模式：`console` \| `file` |
| `--log.file` | 空 | 日志文件路径（`log.output=file` 时生效） |
| `--log.level` | 空 | 日志级别：`debug` \| `info` \| `warn` \| `error` \| `fatal` \| `panic` |

### 启动配置注入

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--startup.config_b64` | 空 | 启动配置（Base64 编码 JSON），由 Captain 下发 |
| `--startup.config_json` | 空 | 启动配置（原始 JSON） |

---

## 🔗 相关文档

- [Edge 服务器管理](./management.md) - 部署和管理 Edge
- [配置参数参考](./config-reference.md) - YAML 配置文件完整参考
- [WireGuard 组网](./wireguard-networking.md) - WireGuard 详细配置

---

*YAT Team - 让内网穿透更简单*
