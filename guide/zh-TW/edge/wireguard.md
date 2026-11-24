# Edge WireGuard 配置指南

> 在 Edge 伺服器上啟用和配置 WireGuard 組網功能

---

## 📋 概述

Edge 伺服器支援 WireGuard 組網功能，可以作為中繼節點為網路成員提供流量轉發。啟用後，Edge 會自動建立 WireGuard 介面、管理 peer 並處理轉發。

> 📖 詳細的組網使用指南請參考 [WireGuard 組網指南](../wireguard-networking.md#自維護-edge-配置)

---

## 系統要求

| 專案 | 要求 | 說明 |
|------|------|------|
| **作業系統** | Linux | 僅 Linux 支援 WireGuard 中繼 |
| **核心版本** | 5.6+（kernel 策略）/ 5.8+（ebpf 策略，實驗性） | WireGuard 核心模組 + nftables / eBPF |
| **許可權** | root | 需要建立網路介面和設定核心引數 |

檢查核心版本：

```bash
uname -r
# 輸出示例：5.15.0-91-generic → 滿足 5.6+ 和 5.8+ 要求
```

---

## 核心配置一覽

Edge 啟動時會**自動檢測並設定**以下核心引數和模組，通常無需手動幹預：

### 核心模組

| 模組 | 用途 | 檢查方式 |
|------|------|----------|
| `wireguard` | WireGuard 介面建立（Linux 5.6+ 內建） | `lsmod \| grep wireguard` |
| `nf_tables` | nftables 防火牆規則（kernel 策略依賴） | `nft list tables` |

### Sysctl 引數

| 引數 | 值 | 用途 | 設定方式 |
|------|------|------|----------|
| `net.ipv4.ip_forward` | `1` | 啟用 IP 轉發，peer 間 relay 前提 | Edge 自動設定 |
| `net.ipv4.conf.all.rp_filter` | `0` | 停用全域性反向路徑過濾 | Edge 自動設定 |
| `net.ipv4.conf/<wg-iface>/rp_filter` | `0` | 停用 WG 介面反向路徑過濾 | Edge 自動設定 |

::: warning 注意
`rp_filter` 的實際生效值為 `max(all/rp_filter, <if>/rp_filter)`，兩者都必須為 0。Edge 已自動處理，但如果手動設定過 `all/rp_filter`，請確認已恢復為 0。
:::

### 核心功能依賴（按轉發策略）

| 功能 | kernel 策略（預設） | ebpf 策略 |
|------|---------------------|------------|
| WireGuard 模組 | ✅ 必須 | ✅ 必須 |
| nftables | ✅ 必須 | ❌ 不需要 |
| netlink (rtnetlink) | ✅ 必須 | ✅ 必須 |
| TC + BPF (cls_bpf) | ✅ 必須（peer 流量統計） | ❌ 不需要 |
| eBPF + `bpf_redirect_peer` | ❌ 不需要 | ✅ 必須（Linux 5.8+，實驗性） |
| `ip_forward` | ✅ 必須 | ❌ 不需要（繞過核心轉發） |

---

## 配置引數

### YAML 配置（config.yaml）

```yaml
proxy:
  wireguard:
    enabled: true                    # 啟用 WireGuard 功能
    relay_enabled: true              # 啟用 relay 中繼
    public_endpoint: "edge.example.com"  # Edge 公網地址（不含埠）
    listen_port_base: 58021          # WG 介面監聽埠起始值
    forwarder_strategy: "kernel"     # 轉發策略：kernel（預設）| ebpf（實驗性，需 Linux 5.8+）
```

完整的 WireGuard 配置項請參考 [配置引數參考](config-reference.md#_4-4-wireguard-proxy-wireguard)。

### 啟動引數（CLI 標誌）

| 引數 | 預設值 | 說明 |
|------|--------|------|
| `--channel.wireguard.enable` | `true` | 啟用 WireGuard 功能 |
| `--channel.wireguard.relay_enabled` | `false` | 啟用 Edge 側 relay 中繼 |
| `--channel.wireguard.public_endpoint` | 同 `--public` | WireGuard relay 公網地址 |

::: warning 注意
CLI 標誌優先順序高於 YAML 配置和快取的啟動配置。如果通過 CLI 設定了引數，會覆蓋配置檔案中的值。
:::

---

## 防火牆與埠

Edge WireGuard 需要放行以下 UDP 埠：

| 埠範圍 | 用途 | 說明 |
|----------|------|------|
| `58021+` | WG 介面監聽埠 | 每個網路佔用一個埠 |

::: tip 說明
Edge relay 使用 kernel forwarder 在同 WG 介面內轉發 peer 間流量，
無需額外的 per-peer relay 埠。只需放行 WG 介面埠即可。
:::

```bash
# UFW 方式
sudo ufw allow 58021:58100/udp   # WG 介面埠

# iptables 方式
sudo iptables -A INPUT -p udp --dport 58021:58100 -j ACCEPT
```

---

## 自動管理的核心引數與 nftables 規則

Edge kernel forwarder 啟動時會**自動**完成以下配置，無需手動幹預：

**核心引數**：
- `net.ipv4.ip_forward = 1` — 啟用 IP 轉發
- `net.ipv4.conf/<wg-iface>/rp_filter = 0` — 停用反向路徑過濾

**nftables 規則**（表名 `yat_relay`）：

```nft
table ip yat_relay {
    chain forward {
        type filter hook forward priority mangle; policy accept;
        iifname "wg-yat0-xxx" oifname "wg-yat0-xxx" ip daddr <cidr> accept  /* yat-relay:wg-yat0-xxx */
    }
}
```

::: tip 說明
nftables 規則僅包含一條 FORWARD ACCEPT 規則，優先順序為 mangle（-150），
早於 iptables-nft 的 filter 鏈（priority 0）執行，確保同介面轉發流量被接受。
每條規則帶有 `/* yat-relay:<ifName> */` 註釋，便於識別和清理。
:::

---

## 部署驗證

```bash
# 1. 檢查 Edge 日誌
journalctl -u edge -f | grep -i wireguard
# 期望看到：
# "WireGuard functionality enabled"
# "kernel forwarder started: iface=wg-yat0-xxx"

# 2. 檢查 WireGuard 介面
sudo ip link show | grep wg-yat
# 期望看到：wg-yat0-xxx: <POINTOPOINT,NOARP,UP,LOWER_UP> mtu 1420

# 3. 檢查 nftables 規則
sudo nft list table ip yat_relay
# 期望看到 forward 鏈，規則帶 /* yat-relay:wg-yat0-xxx */ 註釋

# 4. 檢查核心引數
cat /proc/sys/net/ipv4/ip_forward   # 應為 1
```

---

## 異常處理

### IP 轉發未啟用

**現象**：peer 間無法通訊，nft counter 為 0

**原因**：Edge 雖然會自動設定 `ip_forward`，但某些環境下（如容器許可權不足）寫入可能失敗

```bash
# 手動啟用 IP 轉發
sudo sysctl -w net.ipv4.ip_forward=1

# 持久化
echo 'net.ipv4.ip_forward=1' | sudo tee -a /etc/sysctl.conf
```

### Docker 主機 iptables 幹擾

**現象**：nftables 規則已安裝，nft counter 有計數，但 peer 間轉發仍然失敗

**背景**：Edge 的 nftables 規則在 FORWARD hook priority mangle (-150) 處 ACCEPT，
正常情況下會**終止整個 hook 評估**，後續 iptables-nft 的 filter 鏈（priority 0）
包括 Docker 的 `DOCKER-USER` 鏈不會執行。但如果系統使用 **iptables-legacy**
（基於 x_tables，與 nftables 是完全獨立的核心路徑），nftables ACCEPT 無法阻止
legacy 規則對包的攔截。

**排查步驟**：

```bash
# 1. 確認 iptables 後端：nft 還是 legacy
sudo iptables -V
# 輸出含 "nf_tables"  → iptables-nft（nftables ACCEPT 可生效）
# 輸出含 "legacy"      → iptables-legacy（需要額外處理）

# 2. 檢查 DOCKER-USER 鏈策略和規則
sudo iptables -L DOCKER-USER -v -n
# 關注：Policy 是否為 DROP？是否有針對 wg-yat0 的 DROP 規則？

# 3. 檢查 FORWARD 鏈中是否有 DROP 規則命中
sudo iptables -L FORWARD -v -n | grep -E 'DROP|REJECT|wg-yat'

# 4. 檢查 nftables 規則是否命中（counter 是否增長）
sudo nft list table ip yat_relay
# 如果 packets 持續增長說明 nftables 層已 ACCEPT

# 5. 如果 nft counter 增長但包仍被丟棄，說明被 iptables-legacy 攔截
#    用 pkttracker 確認：
sudo iptables -A FORWARD -i wg-yat0-xxx -o wg-yat0-xxx -d <cidr> -j LOG --log-prefix "YAT-FWD: "
# 然後 ping 測試，檢視 dmesg | grep YAT-FWD
```

**解決方案**：

```bash
# 方案 A：在 DOCKER-USER 中新增 ACCEPT（適用於 iptables-nft 和 iptables-legacy）
sudo iptables -I DOCKER-USER -i wg-yat0-xxx -o wg-yat0-xxx -d <cidr> -j ACCEPT
# 注意：DOCKER-USER 鏈在 Docker 重啟後會重建，需要持久化

# 方案 B：切換到 iptables-nft（推薦）
sudo update-alternatives --set iptables /usr/sbin/iptables-nft
sudo update-alternatives --set ip6tables /usr/sbin/ip6tables-nft
# 切換後 Docker 和 nftables 共享同一核心路徑，nftables ACCEPT 即可生效

# 方案 C：配置 Docker 不操作 iptables
# 在 /etc/docker/daemon.json 中新增：
# { "iptables": false }
# 然後重啟 Docker：sudo systemctl restart docker
# 注意：這會停用 Docker 的所有 iptables 規則管理，容器埠對映需要手動配置
```

### 核心版本不支援 WireGuard

**現象**：Edge 啟動失敗，提示 "WireGuard initialization failed"

```bash
# 檢查核心版本
uname -r

# 如果 < 5.6，升級核心
sudo apt install linux-image-generic
sudo reboot
```

---

## 🔗 相關檔案

- [Edge 伺服器管理](management.md) - 部署和管理 Edge
- [WireGuard 組網指南](../wireguard-networking.md) - 完整的 WireGuard 組網使用指南
- [配置引數參考](config-reference.md) - YAML 配置項完整參考
- [啟動引數參考](startup-params.md) - 命令列引數完整列表

---

*YAT Team - 讓內網穿透更簡單*
