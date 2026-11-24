# Edge CLI 命令參考

> Edge 伺服器命令列工具完整參考手冊

---

## 📋 概述

Edge 二進位制檔案（`edge`）提供了一組命令列工具，用於管理伺服器生命週期、隧道、通道和 WireGuard 網路。

### 基本用法

```bash
edge <command> [subcommand] [flags]
```

### 全域性引數

以下引數適用於所有命令：

| 引數 | 預設值 | 說明 |
|------|--------|------|
| `--data` | 平臺預設 | 資料目錄路徑（Linux: `/var/lib/edge`，macOS: `~/.edge`） |
| `--log-level` | `info` | 日誌級別：`debug` / `info` / `warn` / `error` |

### 命令一覽

```
edge
├── version                  # 檢視版本資訊
├── server                   # 伺服器管理
│   ├── start                # 啟動伺服器
│   ├── stop                 # 停止伺服器
│   ├── restart              # 重啟伺服器
│   ├── status               # 檢視執行狀態
│   ├── online               # 註冊到控制中心（上線）
│   └── offline              # 從控制中心登出（下線）
├── tunnel                   # 隧道管理
│   ├── list                 # 列出隧道
│   ├── info <id>            # 檢視隧道詳情
│   ├── remove <id>          # 刪除隧道
│   └── clean                # 清理已刪除的隧道
├── channel                  # 通道管理
│   ├── list                 # 列出活躍通道
│   └── info <id>            # 檢視通道詳情
└── networks                 # WireGuard 網路管理
    ├── list                 # 列出網路
    ├── info <id>            # 檢視網路詳情
    ├── members <id>         # 列出網路成員
    ├── remove <id>          # 刪除網路
    └── rate-limit <id> ...  # 管理 peer 限速
```

---

## 版本資訊

### `edge version`

顯示 Edge 的版本號、構建時間、Git commit 和執行時資訊。

```bash
edge version
```

**輸出示例**：

```
Version: 1.2.0
Build:   2026-09-20T10:30:00Z
Commit:  abc1234
Runtime: go1.22.0 linux/amd64
```

---

## 伺服器管理

### `edge server start`

啟動 Edge 伺服器。

```bash
edge server start [flags]
```

**引數**：

| 引數 | 縮寫 | 預設值 | 說明 |
|------|------|--------|------|
| `--config` | `-c` | `~/.yat/config.yml` | 配置檔案路徑 |
| `--daemon` | `-d` | `false` | 後臺守護程式模式執行 |
| `--pid-file` | | `~/.edge/RUNNING` | PID 檔案路徑 |
| `--sock-file` | | `~/.edge/.edge.sock` | IPC socket 檔案路徑 |

> 📖 完整的啟動引數列表請參考 [啟動引數參考](startup-params.md)

**示例**：

```bash
# 前臺啟動（開發除錯）
edge server start -c config.yaml

# 後臺啟動（生產環境）
sudo edge server start -d -c /etc/yat/edge.yaml

# 指定資料目錄
edge server start --data /var/lib/edge
```

### `edge server stop`

停止執行中的 Edge 伺服器。

```bash
edge server stop [flags]
```

**引數**：

| 引數 | 預設值 | 說明 |
|------|--------|------|
| `--pid-file` | `~/.edge/RUNNING` | PID 檔案路徑 |

**示例**：

```bash
# 停止服務
sudo edge server stop

# 指定 PID 檔案
edge server stop --pid-file ./edge.pid
```

**行為**：
- 傳送 SIGTERM 訊號給執行中的程式
- 等待程式優雅停止（最長 30 秒）
- 自動清理 PID 檔案

### `edge server restart`

重啟 Edge 伺服器（先停止，等待 1 秒，再啟動）。

```bash
edge server restart [flags]
```

**引數**：

| 引數 | 預設值 | 說明 |
|------|--------|------|
| `--config` | `~/.yat/config.yml` | 配置檔案路徑 |
| `--pid-file` | `~/.edge/RUNNING` | PID 檔案路徑 |

**示例**：

```bash
sudo edge server restart -c /etc/yat/edge.yaml
```

### `edge server status`

檢視 Edge 伺服器執行狀態。

```bash
edge server status [flags]
```

**輸出示例**：

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

將 Edge 註冊到控制中心（標記為線上）。**服務必須在執行中**。

```bash
edge server online [flags]
```

**使用場景**：
- 服務啟動後手動上線
- 維護視窗後恢復服務

### `edge server offline`

將 Edge 從控制中心登出（標記為離線）。**服務必須在執行中**。

```bash
edge server offline [flags]
```

**使用場景**：
- 維護視窗臨時下線
- 節點遷移前下線
- 避免控制中心分配新連線

> 💡 `online` / `offline` 僅改變控制中心的註冊狀態，**不會停止或重啟服務**。

---

## 隧道管理

### `edge tunnel list`

列出當前 Edge 上的所有隧道定義。

```bash
edge tunnel list [flags]
```

**引數**：

| 引數 | 預設值 | 說明 |
|------|--------|------|
| `--sock-file` | `~/.edge/.edge.sock` | IPC socket 檔案路徑 |

**示例**：

```bash
edge tunnel list
```

### `edge tunnel info`

檢視指定隧道的詳細資訊。

```bash
edge tunnel info <tunnel-id> [flags]
```

**示例**：

```bash
edge tunnel info tun-abc123
```

### `edge tunnel remove`

軟刪除一個隧道定義（標記為已刪除，不立即清理）。

```bash
edge tunnel remove <tunnel-id> [flags]
```

### `edge tunnel clean`

清理所有已標記刪除的隧道定義（永久刪除）。

```bash
edge tunnel clean [flags]
```

---

## 通道管理

### `edge channel list`

列出當前活躍的通道。

```bash
edge channel list [flags]
```

### `edge channel info`

檢視指定通道的詳細資訊。

```bash
edge channel info <channel-id> [flags]
```

---

## WireGuard 網路管理

### `edge networks list`

列出當前 Edge 上的所有 WireGuard 網路。

```bash
edge networks list [flags]
```

**引數**：

| 引數 | 預設值 | 說明 |
|------|--------|------|
| `--db` | 空 | 資料庫檔案路徑（預設自動檢測） |
| `--sock-file` | `~/.edge/.edge.sock` | IPC socket 檔案路徑 |

**示例**：

```bash
edge networks list
```

### `edge networks info`

檢視指定 WireGuard 網路的詳細資訊，包括成員和 peer session。

```bash
edge networks info <network-id> [flags]
```

**示例**：

```bash
edge networks info net-abc123
```

### `edge networks members`

列出指定網路的成員（裝置）。

```bash
edge networks members <network-id> [flags]
```

**示例**：

```bash
edge networks members net-abc123
```

### `edge networks remove`

刪除一個 WireGuard 網路及其成員和 session 資料。

```bash
edge networks remove <network-id> [flags]
```

::: warning 注意
此操作會永久刪除網路資料，請謹慎使用。
:::

### `edge networks rate-limit`

管理 WireGuard 網路中每個 peer 的出口頻寬限制。**需要 Edge 服務正在執行**。

```bash
edge networks rate-limit <network-id> <set|remove|query> [peer-ip] [rate] [ceil]
```

**操作說明**：

| 操作 | 用法 | 說明 |
|------|------|------|
| `set` | `set <peer-ip> <rate> [ceil]` | 設定 peer 限速（bytes/sec） |
| `remove` | `remove <peer-ip>` | 移除 peer 的獨立限速 |
| `query` | `query [peer-ip]` | 查詢限速配置 |

**示例**：

```bash
# 設定 peer 限速：1 Mbps（125000 bytes/sec）
edge networks rate-limit net-abc123 rate-limit set 10.25.0.2 125000

# 設定不對稱限速：1 Mbps 保證，4 Mbps 突發上限
edge networks rate-limit net-abc123 rate-limit set 10.25.0.2 125000 500000

# 移除 peer 的獨立限速（回退到預設值）
edge networks rate-limit net-abc123 rate-limit remove 10.25.0.2

# 查詢所有 peer 的限速配置
edge networks rate-limit net-abc123 rate-limit query

# 查詢單個 peer 的限速
edge networks rate-limit net-abc123 rate-limit query 10.25.0.2
```

> 💡 `rate` 和 `ceil` 的單位是 **bytes/sec**。換算：1 Mbps = 125,000 bytes/sec。

---

## 訊號處理

Edge 伺服器支援以下系統訊號：

```bash
# 優雅停止
kill -TERM $(cat /var/run/edge.pid)

# 立即停止
kill -QUIT $(cat /var/run/edge.pid)

# 強制停止（Ctrl+C）
kill -INT $(cat /var/run/edge.pid)
```

---

## 常見錯誤

### Permission Denied

```
Error: write pid file: open /var/run/edge.pid: permission denied
```

**解決**：使用 `sudo` 執行，或指定使用者可寫的路徑 `--pid-file ./edge.pid`。

### Server Not Running

```
Error: server is not running, please start the server first
```

**解決**：先啟動服務 `edge server start`，或檢查 `--pid-file` 路徑是否正確。

### Already Running

```
Error: daemon already running with PID 12345
```

**解決**：先停止服務 `edge server stop`，或使用 `edge server restart`。

---

## 獲取幫助

```bash
# 檢視所有命令
edge --help

# 檢視子命令幫助
edge server --help
edge server start --help
edge networks --help
edge networks rate-limit --help
```

---

## 🔗 相關檔案

- [Edge 伺服器管理](management.md) - 部署和管理 Edge
- [啟動引數參考](startup-params.md) - 完整啟動引數列表
- [配置引數參考](config-reference.md) - YAML 配置檔案參考
- [Edge WireGuard 配置](wireguard.md) - WireGuard 系統要求與配置

---

*YAT Team - 讓內網穿透更簡單*
