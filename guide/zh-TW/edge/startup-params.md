# Edge 啟動引數參考

> `edge server start` 完整命令列引數列表

---

## 📋 概述

Edge 伺服器通過命令列引數啟動和配置。命令列引數的**優先順序最高**，會覆蓋 YAML 配置檔案和 Captain 下發的啟動配置中的同名引數。

### 配置覆蓋優先順序

```
CLI 引數（最高） > 啟動配置注入 > YAML 配置檔案 > 預設值（最低）
```

### 基本用法

```bash
# 前臺啟動
./edge server start --config config.yaml

# 後臺守護程序模式
./edge server start --config config.yaml --daemon

# 指定公網地址
./edge server start --config config.yaml --public 203.0.113.1
```

---

## 引數列表

### 程式與路徑

| 引數 | 縮寫 | 預設值 | 說明 |
|------|------|--------|------|
| `--config` | `-c` | `~/.yat/config.yml` | 配置檔案路徑 |
| `--daemon` | `-d` | `false` | 後臺守護程式模式執行 |
| `--pid-file` | | `~/.edge/RUNNING` | PID 檔案路徑 |
| `--sock-file` | | `~/.edge/.edge.sock` | IPC socket 檔案路徑 |

### 核心網路

| 引數 | 預設值 | 說明 |
|------|--------|------|
| `--public` | 空 | 公網 IP 或域名（不含埠） |
| `--domain` | 空 | 自定義域名（用於 HTTP 通道） |
| `--controller.address` | 空 | Controller 伺服器地址 |
| `--channel.alias_domain_policy` | 空 | 別名域名策略：`disabled` \| `optional` \| `required` |
| `--tunnel.listen` | 空 | 隧道監聽地址 |
| `--tunnel.max_sessions` | `0` | 最大會話數（0=無限制） |

### TLS 證書

| 引數 | 預設值 | 說明 |
|------|--------|------|
| `--tunnel.tls.ca` | 空 | TLS CA 證書路徑 |
| `--tunnel.tls.cert` | 空 | TLS 服務端證書路徑 |
| `--tunnel.tls.key` | 空 | TLS 服務端私鑰路徑 |

### HTTP 通道

| 引數 | 預設值 | 說明 |
|------|--------|------|
| `--channel.http.enable` | `true` | 啟用 HTTP 通道/代理 |
| `--channel.http.port` | `0` | HTTP 代理埠 |
| `--channel.https.port` | `0` | HTTPS 代理埠 |
| `--channel.http.addr` | 空 | HTTP 代理監聽地址 |
| `--channel.http.timeout` | `0` | HTTP 代理請求超時 |
| `--channel.http.buffer` | 空 | HTTP 通道讀緩衝區大小（支援 K/M 字尾） |
| `--channel.http.buffer.lock` | `false` | 鎖定緩衝區為固定大小，停用動態視窗 |
| `--channel.http.eager_start` | `false` | 啟動時立即啟動 HTTP 代理 |

### TCP / UDP 通道

| 引數 | 預設值 | 說明 |
|------|--------|------|
| `--channel.tcp.enable` | `true` | 啟用 TCP 通道 |
| `--channel.tcp.port_min` | `0` | TCP 埠範圍起始 |
| `--channel.tcp.port_max` | `0` | TCP 埠範圍結束 |
| `--channel.udp.enable` | `true` | 啟用 UDP 通道 |
| `--channel.udp.port_min` | `0` | UDP 埠範圍起始 |
| `--channel.udp.port_max` | `0` | UDP 埠範圍結束 |

### WireGuard

| 引數 | 預設值 | 說明 |
|------|--------|------|
| `--channel.wireguard.enable` | `true` | 啟用 WireGuard 功能 |
| `--channel.wireguard.relay_enabled` | `false` | 啟用 Edge 側 relay 中繼 |
| `--channel.wireguard.public_endpoint` | 同 `--public` | WireGuard relay 公網地址（不含埠） |

### P2P

| 引數 | 預設值 | 說明 |
|------|--------|------|
| `--server.capabilities.auto_enable` | `true` | 根據客戶端能力自動啟用服務 |
| `--server.capabilities.p2p` | `true` | 啟用 P2P 能力 |
| `--channel.p2p.udp_addr` | 空 | P2P UDP 監聽地址，如 `0.0.0.0:9000` |

### 隧道限制

| 引數 | 預設值 | 說明 |
|------|--------|------|
| `--tunnel.limits.max_per_session` | `0` | 每個使用者會話最大隧道數（0=無限制） |
| `--tunnel.limits.max_total` | `0` | Edge 最大隧道總數（0=無限制） |

### CSR 證書轉發

| 引數 | 預設值 | 說明 |
|------|--------|------|
| `--csr.forwarder.enable` | `true` | 啟用 CSR 轉發器 |
| `--csr.forwarder.subca_serial` | 空 | CSR 轉發子 CA 序列號 |

### 日誌

| 引數 | 預設值 | 說明 |
|------|--------|------|
| `--log.output` | `console` | 日誌輸出模式：`console` \| `file` |
| `--log.file` | 空 | 日誌檔案路徑（`log.output=file` 時生效） |
| `--log.level` | 空 | 日誌級別：`debug` \| `info` \| `warn` \| `error` \| `fatal` \| `panic` |

### 啟動配置注入

| 引數 | 預設值 | 說明 |
|------|--------|------|
| `--startup.config_b64` | 空 | 啟動配置（Base64 編碼 JSON），由 Captain 下發 |
| `--startup.config_json` | 空 | 啟動配置（原始 JSON） |

---

## 🔗 相關檔案

- [Edge 伺服器管理](management.md) - 部署和管理 Edge
- [配置引數參考](config-reference.md) - YAML 配置檔案完整參考
- [WireGuard 組網](../wireguard-networking.md) - WireGuard 詳細配置

---

*YAT Team - 讓內網穿透更簡單*
