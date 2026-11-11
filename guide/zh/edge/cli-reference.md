# Edge CLI 命令参考

> Edge 服务器命令行工具完整参考手册

---

## 📋 概述

Edge 二进制文件（`edge`）提供了一组命令行工具，用于管理服务器生命周期、隧道、通道和 WireGuard 网络。

### 基本用法

```bash
edge <command> [subcommand] [flags]
```

### 全局参数

以下参数适用于所有命令：

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--data` | 平台默认 | 数据目录路径（Linux: `/var/lib/edge`，macOS: `~/.edge`） |
| `--log-level` | `info` | 日志级别：`debug` / `info` / `warn` / `error` |

### 命令一览

```
edge
├── version                  # 查看版本信息
├── server                   # 服务器管理
│   ├── start                # 启动服务器
│   ├── stop                 # 停止服务器
│   ├── restart              # 重启服务器
│   ├── status               # 查看运行状态
│   ├── online               # 注册到控制中心（上线）
│   └── offline              # 从控制中心注销（下线）
├── tunnel                   # 隧道管理
│   ├── list                 # 列出隧道
│   ├── info <id>            # 查看隧道详情
│   ├── remove <id>          # 删除隧道
│   └── clean                # 清理已删除的隧道
├── channel                  # 通道管理
│   ├── list                 # 列出活跃通道
│   └── info <id>            # 查看通道详情
└── networks                 # WireGuard 网络管理
    ├── list                 # 列出网络
    ├── info <id>            # 查看网络详情
    ├── members <id>         # 列出网络成员
    ├── remove <id>          # 删除网络
    └── rate-limit <id> ...  # 管理 peer 限速
```

---

## 版本信息

### `edge version`

显示 Edge 的版本号、构建时间、Git commit 和运行时信息。

```bash
edge version
```

**输出示例**：

```
Version: 1.2.0
Build:   2026-09-20T10:30:00Z
Commit:  abc1234
Runtime: go1.22.0 linux/amd64
```

---

## 服务器管理

### `edge server start`

启动 Edge 服务器。

```bash
edge server start [flags]
```

**参数**：

| 参数 | 缩写 | 默认值 | 说明 |
|------|------|--------|------|
| `--config` | `-c` | `~/.yat/config.yml` | 配置文件路径 |
| `--daemon` | `-d` | `false` | 后台守护进程模式运行 |
| `--pid-file` | | `~/.edge/RUNNING` | PID 文件路径 |
| `--sock-file` | | `~/.edge/.edge.sock` | IPC socket 文件路径 |

> 📖 完整的启动参数列表请参考 [启动参数参考](./startup-params.md)

**示例**：

```bash
# 前台启动（开发调试）
edge server start -c config.yaml

# 后台启动（生产环境）
sudo edge server start -d -c /etc/yat/edge.yaml

# 指定数据目录
edge server start --data /var/lib/edge
```

### `edge server stop`

停止运行中的 Edge 服务器。

```bash
edge server stop [flags]
```

**参数**：

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--pid-file` | `~/.edge/RUNNING` | PID 文件路径 |

**示例**：

```bash
# 停止服务
sudo edge server stop

# 指定 PID 文件
edge server stop --pid-file ./edge.pid
```

**行为**：
- 发送 SIGTERM 信号给运行中的进程
- 等待进程优雅停止（最长 30 秒）
- 自动清理 PID 文件

### `edge server restart`

重启 Edge 服务器（先停止，等待 1 秒，再启动）。

```bash
edge server restart [flags]
```

**参数**：

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--config` | `~/.yat/config.yml` | 配置文件路径 |
| `--pid-file` | `~/.edge/RUNNING` | PID 文件路径 |

**示例**：

```bash
sudo edge server restart -c /etc/yat/edge.yaml
```

### `edge server status`

查看 Edge 服务器运行状态。

```bash
edge server status [flags]
```

**输出示例**：

```
Edge server is running
PID: 12345
PID file: /var/run/edge.pid
```

或：

```
Edge server is not running
```

### `edge server online`

将 Edge 注册到控制中心（标记为在线）。**服务必须在运行中**。

```bash
edge server online [flags]
```

**使用场景**：
- 服务启动后手动上线
- 维护窗口后恢复服务

### `edge server offline`

将 Edge 从控制中心注销（标记为离线）。**服务必须在运行中**。

```bash
edge server offline [flags]
```

**使用场景**：
- 维护窗口临时下线
- 节点迁移前下线
- 避免控制中心分配新连接

> 💡 `online` / `offline` 仅改变控制中心的注册状态，**不会停止或重启服务**。

---

## 隧道管理

### `edge tunnel list`

列出当前 Edge 上的所有隧道定义。

```bash
edge tunnel list [flags]
```

**参数**：

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--sock-file` | `~/.edge/.edge.sock` | IPC socket 文件路径 |

**示例**：

```bash
edge tunnel list
```

### `edge tunnel info`

查看指定隧道的详细信息。

```bash
edge tunnel info <tunnel-id> [flags]
```

**示例**：

```bash
edge tunnel info tun-abc123
```

### `edge tunnel remove`

软删除一个隧道定义（标记为已删除，不立即清理）。

```bash
edge tunnel remove <tunnel-id> [flags]
```

### `edge tunnel clean`

清理所有已标记删除的隧道定义（永久删除）。

```bash
edge tunnel clean [flags]
```

---

## 通道管理

### `edge channel list`

列出当前活跃的通道。

```bash
edge channel list [flags]
```

### `edge channel info`

查看指定通道的详细信息。

```bash
edge channel info <channel-id> [flags]
```

---

## WireGuard 网络管理

### `edge networks list`

列出当前 Edge 上的所有 WireGuard 网络。

```bash
edge networks list [flags]
```

**参数**：

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--db` | 空 | 数据库文件路径（默认自动检测） |
| `--sock-file` | `~/.edge/.edge.sock` | IPC socket 文件路径 |

**示例**：

```bash
edge networks list
```

### `edge networks info`

查看指定 WireGuard 网络的详细信息，包括成员和 peer session。

```bash
edge networks info <network-id> [flags]
```

**示例**：

```bash
edge networks info net-abc123
```

### `edge networks members`

列出指定网络的成员（设备）。

```bash
edge networks members <network-id> [flags]
```

**示例**：

```bash
edge networks members net-abc123
```

### `edge networks remove`

删除一个 WireGuard 网络及其成员和 session 数据。

```bash
edge networks remove <network-id> [flags]
```

::: warning 注意
此操作会永久删除网络数据，请谨慎使用。
:::

### `edge networks rate-limit`

管理 WireGuard 网络中每个 peer 的出口带宽限制。**需要 Edge 服务正在运行**。

```bash
edge networks rate-limit <network-id> <set|remove|query> [peer-ip] [rate] [ceil]
```

**操作说明**：

| 操作 | 用法 | 说明 |
|------|------|------|
| `set` | `set <peer-ip> <rate> [ceil]` | 设置 peer 限速（bytes/sec） |
| `remove` | `remove <peer-ip>` | 移除 peer 的独立限速 |
| `query` | `query [peer-ip]` | 查询限速配置 |

**示例**：

```bash
# 设置 peer 限速：1 Mbps（125000 bytes/sec）
edge networks rate-limit net-abc123 rate-limit set 10.25.0.2 125000

# 设置不对称限速：1 Mbps 保证，4 Mbps 突发上限
edge networks rate-limit net-abc123 rate-limit set 10.25.0.2 125000 500000

# 移除 peer 的独立限速（回退到默认值）
edge networks rate-limit net-abc123 rate-limit remove 10.25.0.2

# 查询所有 peer 的限速配置
edge networks rate-limit net-abc123 rate-limit query

# 查询单个 peer 的限速
edge networks rate-limit net-abc123 rate-limit query 10.25.0.2
```

> 💡 `rate` 和 `ceil` 的单位是 **bytes/sec**。换算：1 Mbps = 125,000 bytes/sec。

---

## 信号处理

Edge 服务器支持以下系统信号：

```bash
# 优雅停止
kill -TERM $(cat /var/run/edge.pid)

# 立即停止
kill -QUIT $(cat /var/run/edge.pid)

# 强制停止（Ctrl+C）
kill -INT $(cat /var/run/edge.pid)
```

---

## 常见错误

### Permission Denied

```
Error: write pid file: open /var/run/edge.pid: permission denied
```

**解决**：使用 `sudo` 运行，或指定用户可写的路径 `--pid-file ./edge.pid`。

### Server Not Running

```
Error: server is not running, please start the server first
```

**解决**：先启动服务 `edge server start`，或检查 `--pid-file` 路径是否正确。

### Already Running

```
Error: daemon already running with PID 12345
```

**解决**：先停止服务 `edge server stop`，或使用 `edge server restart`。

---

## 获取帮助

```bash
# 查看所有命令
edge --help

# 查看子命令帮助
edge server --help
edge server start --help
edge networks --help
edge networks rate-limit --help
```

---

## 🔗 相关文档

- [Edge 服务器管理](./management.md) - 部署和管理 Edge
- [启动参数参考](./startup-params.md) - 完整启动参数列表
- [配置参数参考](./config-reference.md) - YAML 配置文件参考
- [Edge WireGuard 配置](./wireguard.md) - WireGuard 系统要求与配置

---

*YAT Team - 让内网穿透更简单*
