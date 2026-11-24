# Edge 配置引數參考

> Edge 伺服器 `config.yaml` 配置項完整參考手冊

---

## 📋 概述

Edge 伺服器通過 YAML 配置檔案控制所有功能。配置檔案路徑通過 `--config` 引數指定，預設為 `~/.yat/config.yml`。

### 配置載入順序

```
預設值 → YAML 檔案覆蓋 → 啟動配置注入（Captain 下發） → CLI 引數覆蓋
```

後載入的配置會覆蓋先載入的值。

### 配置檔案示例

完整的配置模板請參考 [`config.example.yaml`](https://github.com/tunnel6/yat/blob/main/edge/config.example.yaml)。

---

## 📑 配置項一覽

### 1. 節點身份（node）

定義 Edge 節點的基本身份資訊。

| 配置項 | 型別 | 預設值 | 說明 |
|--------|------|--------|------|
| `node.zone` | 字串 | `"default"` | 節點所在區域，如 `cn-east-1` |
| `node.type` | 字串 | `"private"` | 節點型別：`private`（私有）/ `public`（公共）/ `shared`（共享） |
| `node.public_address` | 字串 | 空 | Edge 的公網地址，格式 `IP:PORT` 或 `DOMAIN:PORT`。用於 P2P 打洞的 AdvertiseHost |

::: tip 關於 node.id
`node.id` 無需手動配置，Edge 啟動時會自動從 `EDGE_SECRET` 環境變數中解析。格式為 `{edge_id}.{token}`。
:::

**示例**：

```yaml
node:
  zone: "cn-east-1"
  type: "private"
  public_address: "203.0.113.1:9000"
```

---

### 2. 控制器連線（controller）

配置 Edge 與 Captain 控制平面的連線引數。

| 配置項 | 型別 | 預設值 | 說明 |
|--------|------|--------|------|
| `controller.address` | 字串 | `"captain.tunnel6.com:8808"` | Captain 伺服器地址 |
| `controller.heartbeat_interval` | 時長 | `30s` | 心跳間隔 |
| `controller.reconnect_interval` | 時長 | `5s` | 斷線重連間隔 |

#### 2.1 TLS 配置（controller.tls）

| 配置項 | 型別 | 預設值 | 說明 |
|--------|------|--------|------|
| `controller.tls.enabled` | 布林 | `true` | 是否啟用 TLS（生產環境必須啟用） |
| `controller.tls.ca` | 字串 | 空 | CA 證書路徑，留空使用嵌入的 CA |
| `controller.tls.cert` | 字串 | 空 | TLS 證書路徑 |
| `controller.tls.key` | 字串 | 空 | TLS 私鑰路徑 |

#### 2.2 證書引導（controller.bootstrap）

Edge 首次啟動時通過 Bootstrap 流程自動獲取證書。

| 配置項 | 型別 | 預設值 | 說明 |
|--------|------|--------|------|
| `controller.bootstrap.registration_secret` | 字串 | 空 | 註冊金鑰，留空時使用 `EDGE_SECRET` 環境變數 |
| `controller.bootstrap.data` | 字串 | 平臺預設 | 資料目錄路徑（見下表） |
| `controller.bootstrap.client_cert_validity` | 時長 | `8760h`（1 年） | 客戶端證書有效期 |

**資料目錄預設值**：

| 平臺 | 預設路徑 |
|------|---------|
| Linux | `/var/lib/edge` |
| macOS | `~/.edge` |
| 其他 | `./data` |

資料目錄中儲存以下檔案：
- `edge-id` — Edge 唯一標識
- `assigned-domain` — Captain 分配的域名
- `root-ca.crt` — Root CA 證書
- `edge-tls.crt` / `edge-tls.key` — Edge TLS 證書對

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

### 3. 隧道服務（tunnel）

配置 Edge 的隧道監聽和會話管理。

| 配置項 | 型別 | 預設值 | 說明 |
|--------|------|--------|------|
| `tunnel.listen` | 字串 | `"0.0.0.0:9000"` | 隧道監聽地址 |
| `tunnel.max_sessions` | 整數 | `1000` | 最大併發會話數 |
| `tunnel.session_timeout` | 時長 | `5m` | 會話超時時間 |

#### 3.1 隧道限制（tunnel.limits）

| 配置項 | 型別 | 預設值 | 說明 |
|--------|------|--------|------|
| `tunnel.limits.max_per_session` | 整數 | `0` | 單使用者最大隧道數，`0` = 不限制 |
| `tunnel.limits.max_total` | 整數 | `0` | Edge 最大隧道總數，`0` = 不限制 |

#### 3.2 隧道 TLS（tunnel.tls）

| 配置項 | 型別 | 預設值 | 說明 |
|--------|------|--------|------|
| `tunnel.tls.enabled` | 布林 | `true` | 是否啟用 TLS |
| `tunnel.tls.ca` | 字串 | 空 | 留空自動使用資料目錄下的 `root-ca.crt` |
| `tunnel.tls.cert` | 字串 | 空 | 留空自動使用資料目錄下的 `edge-tls.crt` |
| `tunnel.tls.key` | 字串 | 空 | 留空自動使用資料目錄下的 `edge-tls.key` |

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

### 4. 協議代理（proxy）

Edge 支援多種協議代理，每種協議獨立配置。

#### 4.1 HTTP 代理（proxy.http）

| 配置項 | 型別 | 預設值 | 說明 |
|--------|------|--------|------|
| `proxy.http.enabled` | 布林 | `true` | 是否啟用 HTTP 代理 |
| `proxy.http.port` | 整數 | `80` | HTTP 公開埠 |
| `proxy.http.https_port` | 整數 | `443` | HTTPS 公開埠 |
| `proxy.http.addr` | 字串 | 空 | 監聽地址，留空使用 `:<port>` |
| `proxy.http.timeout` | 時長 | `30s` | 請求超時時間 |
| `proxy.http.buffer` | 字串 | `"16K"` | 讀緩衝區大小，支援 K/M 字尾 |
| `proxy.http.buffer_lock` | 布林 | `false` | 鎖定緩衝區為固定大小，停用動態視窗 |
| `proxy.http.eager_start` | 布林 | `false` | 啟動時立即啟動 HTTP 代理 |

::: tip 關於 HTTPS 證書
`proxy.http.https_server_cert` 和 `proxy.http.https_server_key` 為本地專用欄位，用於指定 HTTPS 證書路徑，不會上報給 Captain。通常留空，由系統自動管理。
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

| 配置項 | 型別 | 預設值 | 說明 |
|--------|------|--------|------|
| `proxy.tcp.enabled` | 布林 | `true` | 是否啟用 TCP 代理 |
| `proxy.tcp.port_min` | 整數 | `30000` | 埠範圍起始值 |
| `proxy.tcp.port_max` | 整數 | `40000` | 埠範圍結束值 |

**示例**：

```yaml
proxy:
  tcp:
    enabled: true
    port_min: 30000
    port_max: 40000
```

#### 4.3 UDP 代理（proxy.udp）

| 配置項 | 型別 | 預設值 | 說明 |
|--------|------|--------|------|
| `proxy.udp.enabled` | 布林 | `true` | 是否啟用 UDP 代理 |
| `proxy.udp.port_min` | 整數 | `30000` | 埠範圍起始值 |
| `proxy.udp.port_max` | 整數 | `40000` | 埠範圍結束值 |

**示例**：

```yaml
proxy:
  udp:
    enabled: true
    port_min: 30000
    port_max: 40000
```

#### 4.4 WireGuard（proxy.wireguard）

WireGuard 組網功能配置。詳細指南請參考 [啟用 WireGuard 功能](management.md#啟用-wireguard-功能)。

| 配置項 | 型別 | 預設值 | 說明 |
|--------|------|--------|------|
| `proxy.wireguard.enabled` | 布林 | `false` | 是否啟用 WireGuard 功能 |
| `proxy.wireguard.interface` | 字串 | `"wg0"` | WireGuard 介面名稱 |
| `proxy.wireguard.subnet` | 字串 | `"10.0.0.1/24"` | WireGuard 子網地址 |
| `proxy.wireguard.interface_prefix` | 字串 | `"wg-yat0"` | 介面名稱字首 |
| `proxy.wireguard.listen_port_base` | 整數 | `58021` | WG 介面監聽埠起始值 |
| `proxy.wireguard.key_dir` | 字串 | 空 | 金鑰儲存目錄 |
| `proxy.wireguard.public_endpoint` | 字串 | 空 | Edge 公網地址（不含埠） |
| `proxy.wireguard.relay_enabled` | 布林 | `false` | 是否啟用 Edge 側 relay 中繼 |
| `proxy.wireguard.forwarder_strategy` | 字串 | 空 | 轉發策略：`kernel`（預設）/ `ebpf`（實驗性，需 Linux 5.8+） |
| `proxy.wireguard.default_peer_rate` | 整數 | `0` | 每 peer 保證頻寬（bytes/sec），`0` = 不限速 |
| `proxy.wireguard.default_peer_ceil` | 整數 | `0` | 每 peer 突發上限（bytes/sec），`0` = 同 `default_peer_rate` |

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

P2P 直連使用 ICE 協議進行 NAT 穿透。

| 配置項 | 型別 | 預設值 | 說明 |
|--------|------|--------|------|
| `proxy.ice.enabled` | 布林 | `false` | 是否啟用 ICE P2P 打洞 |
| `proxy.ice.udp_addr` | 字串 | 空 | P2P UDP 監聽地址，如 `0.0.0.0:9000` |
| `proxy.ice.udp_addr_alt` | 字串 | 空 | 備用 UDP 監聽地址 |

::: tip 通過 channel.p2p 配置
推薦通過 `channel.p2p` 配置 P2P 功能，系統會自動對映到 `proxy.ice`：
- `channel.p2p.enabled` → `proxy.ice.enabled`
- `channel.p2p.udp_addr` → `proxy.ice.udp_addr`（設定後自動啟用 ICE）
:::

---

### 5. 通道業務（channel）

配置通道相關的業務引數。

| 配置項 | 型別 | 預設值 | 說明 |
|--------|------|--------|------|
| `channel.custom_domain` | 字串 | 空 | 自定義域名（使用者自己的域名） |
| `channel.alias_domain_policy` | 字串 | `"optional"` | 別名域名策略：`disabled` / `optional` / `required` |
| `channel.max_channels_per_user` | 整數 | `10` | 每使用者最大通道數 |
| `channel.max_bandwidth_mbps` | 整數 | `100` | 最大頻寬（Mbps） |

#### 5.1 P2P 配置（channel.p2p）

這是 P2P 功能的**推薦配置入口**，會自動對映到 `proxy.ice`。

| 配置項 | 型別 | 預設值 | 說明 |
|--------|------|--------|------|
| `channel.p2p.enabled` | 布林 | 空 | 啟用 P2P 直連。設定 `udp_addr` 時自動啟用 |
| `channel.p2p.udp_addr` | 字串 | 空 | P2P UDP 監聽地址，如 `0.0.0.0:9000` |

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

### 6. 日誌（log）

| 配置項 | 型別 | 預設值 | 說明 |
|--------|------|--------|------|
| `log.output` | 字串 | 空 | 輸出模式：`console`（控制台）/ `file`（檔案） |
| `log.file` | 字串 | 空 | 日誌檔案路徑（`output=file` 時生效） |
| `log.level` | 字串 | 空 | 日誌級別：`debug` / `info` / `warn` / `error` / `fatal` / `panic` |

**示例**：

```yaml
log:
  output: "file"
  file: "./certs/edge.log"
  level: "info"
```

---

### 7. 計費（billing）

| 配置項 | 型別 | 預設值 | 說明 |
|--------|------|--------|------|
| `billing.enabled` | 布林 | `true` | 是否啟用計費功能 |
| `billing.owner_bypass` | 布林 | `true` | 所有者是否免計費 |
| `billing.cache_duration` | 時長 | `5m` | 計費快取時間 |

---

## 🔧 配置覆蓋優先順序

當多個來源設定了同一引數時，按以下優先順序生效（高 → 低）：

| 優先順序 | 來源 | 說明 |
|--------|------|------|
| 1（最高） | CLI 引數 | `edge server start --xxx` 命令列引數 |
| 2 | 啟動配置注入 | Captain 下發的 `--startup.config_b64` / `--startup.config_json` |
| 3 | YAML 配置檔案 | `config.yaml` 中的值 |
| 4（最低） | 預設值 | 程式碼中的內建預設值 |

---

## 📝 完整配置示例

以下是一份典型的生產環境配置：

```yaml
# 節點身份
node:
  zone: "cn-east-1"
  type: "private"
  public_address: "203.0.113.1:9000"

# 控制器連線
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

# 隧道服務
tunnel:
  listen: "0.0.0.0:9000"
  max_sessions: 1000
  session_timeout: 5m
  limits:
    max_per_session: 5
    max_total: 1000
  tls:
    enabled: true

# 日誌
log:
  output: "file"
  file: "/var/log/edge.log"
  level: "info"

# 協議代理
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

# 通道業務
channel:
  max_channels_per_user: 10
  max_bandwidth_mbps: 100
  p2p:
    enabled: true
    udp_addr: "0.0.0.0:9000"
```

---

## 🔗 相關檔案

- [Edge 伺服器管理](management.md) - 部署和管理 Edge
- [WireGuard 組網](../wireguard-networking.md) - WireGuard 詳細配置
- [傳輸模式與協議](../transport-modes.md) - 瞭解各協議模式
- [常見問題](faq.md) - 配置相關問題排查

---

*YAT Team - 讓內網穿透更簡單*
