# 常見問題

> 解決使用 YAT 過程中遇到的常見問題

---

## 📋 目錄

- [安裝問題](#安裝問題)
- [登入問題](#登入問題)
- [隧道問題](#隧道問題)
- [Edge 伺服器問題](#edge-伺服器問題)
- [擴充套件問題](#擴充套件問題)
- [效能問題](#效能問題)
- [網路問題](#網路問題)
- [高階問題](#高階問題)

---

## 安裝問題

### Q: YAT 支援哪些作業系統？

**支援**：
- ✅ macOS 10.15+ (Catalina)
- ✅ Windows 10+
- ✅ Linux (Ubuntu 18.04+, CentOS 7+, Debian 9+)

**不支援**：
- ❌ macOS 10.14 及以下
- ❌ Windows 7/8
- ❌ 32 位系統

### Q: macOS 提示"無法驗證開發者"？

**原因**: macOS Gatekeeper 安全策略

**解決**:
1. 開啟 **系統設定** > **隱私與安全性**
2. 找到 **仍要開啟** 按鈕
3. 點選 **仍要開啟**
4. 確認開啟

或者使用命令列：
```bash
xattr -d com.apple.quarantine /Applications/YAT.app
```

更多方案（DMG 一鍵修復、Finder 放行、系統設定放行、本機自簽名）見 [macOS 安裝指南（未簽名 / 自簽名版本）](./macos-unsigned-install.md)。

### Q: Windows SmartScreen 阻止安裝？

**解決**:
1. 點選 **更多資訊**
2. 點選 **仍要執行**

### Q: Linux 缺少依賴？

**Ubuntu/Debian**:
```bash
sudo apt install libnss3 libatk1.0-0 libatk-bridge2.0-0 \
  libcups2 libdrm2 libxkbcommon0 libxcomposite1 \
  libxdamage1 libxrandr2 libgbm1 libpango-1.0-0 \
  libcairo2 libasound2
```

**CentOS/RHEL**:
```bash
sudo yum install nss atk at-spi2-atk cups-libs \
  libdrm libxkbcommon xorg-x11-util-macros \
  libXcomposite libXdamage libXrandr mesa-libgbm \
  pango cairo alsa-lib
```

### Q: 安裝後無法啟動？

**排查步驟**：

1. **檢查系統要求**
   - 作業系統版本
   - 記憶體（至少 2GB）
   - 磁碟空間（至少 500MB）

2. **檢視日誌**

**macOS**:
```bash
cat ~/Library/Logs/YAT/main.log
```

**Windows**:
```
%APPDATA%\YAT\logs\main.log
```

**Linux**:
```bash
cat ~/.config/yat/logs/main.log
```

3. **重新安裝**
   - 解除安裝當前版本
   - 清理配置目錄
   - 重新下載最新版本

---

## 登入問題

### Q: 無法登入 GitHub？

**可能原因**:
1. 網路問題
2. GitHub OAuth 應用配置問題
3. 瀏覽器攔截

**解決**:
1. 檢查網路連線
2. 嘗試在瀏覽器中訪問 GitHub
3. 停用廣告攔截外掛
4. 清除瀏覽器快取

### Q: 登入後立即退出？

**可能原因**:
1. Token 過期
2. 網路斷開
3. 賬戶被停用

**解決**:
1. 重新登入
2. 檢查網路
3. 聯絡支援團隊

### Q: 多裝置登入衝突？

**不會衝突**。YAT 支援多裝置同時登入。

---

## 隧道問題

### Q: 建立隧道時提示"沒有可用的 Edge"？

**原因**: 未訂閱任何 Edge 伺服器

**解決**:
1. 前往 **Edges** 頁面
2. 切換到 **市場** 標籤
3. 訂閱一個 Edge 伺服器
4. 返回建立隧道

### Q: 隧道啟動失敗？

**常見錯誤**：

#### 錯誤 1: Edge 離線

**症狀**: "Edge is offline"

**解決**:
1. 檢查 Edge 狀態
2. 重啟 Edge 伺服器
3. 等待 Edge 上線

#### 錯誤 2: 埠被佔用

**症狀**: "Port already in use"

**解決**:
```bash
# macOS/Linux
lsof -i :8080
kill -9 <PID>

# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

#### 錯誤 3: 網路超時

**症狀**: "Connection timeout"

**解決**:
1. 檢查網路連線
2. 檢查防火牆設定
3. 嘗試切換網路

#### 錯誤 4: 許可權不足

**症狀**: "Permission denied"

**解決**:
- Consumer 角色不能啟動隧道
- 聯絡 Publisher 啟動

### Q: 隧道啟動後立即停止？

**可能原因**:
1. 本地服務未啟動
2. Edge 連線斷開
3. 配置錯誤

**排查步驟**:
```
1. 確認本地服務執行
   curl http://localhost:8080

2. 檢查 Edge 狀態
   - 檢視 Edge 頁面
   - 狀態應為"線上"

3. 檢視隧道日誌
   - 詳情頁面檢視錯誤資訊
```

### Q: 遠端地址無法訪問？

**檢查清單**：

- [ ] 隧道狀態是否為"執行中"
- [ ] 本地服務是否正常
- [ ] Edge 是否線上
- [ ] 瀏覽器是否提示證書錯誤
- [ ] 防火牆是否阻止連線

**測試方法**:

```bash
# 測試本地服務
curl http://localhost:8080

# 測試遠端地址
curl https://xxx.myroxy.dev

# 測試 Edge 連線
ping edge.myroxy.dev
```

### Q: 如何停止隧道？

1. 找到隧道卡片
2. 點選 **停止** 按鈕
3. 確認停止

### Q: 隧道可以重新命名嗎？

目前**不支援**重新命名。需要：
1. 刪除舊隧道
2. 建立新隧道

---

## Edge 伺服器問題

### Q: Edge 顯示離線？

**排查步驟**：

```bash
# 1. 檢查伺服器是否執行
ssh user@edge-server
uptime

# 2. 檢查 Edge 程序
ps aux | grep yat-edge

# 3. 檢查埠
netstat -tlnp | grep 443

# 4. 檢視日誌
sudo journalctl -u yat-edge -n 100

# 5. 重啟服務
sudo systemctl restart yat-edge
```

### Q: 如何更新 Edge？

**自動更新**（推薦）:
```bash
# YAT 客戶端中點選"更新"按鈕
```

**手動更新**:
```bash
# 1. 下載新版本
curl  https://github.com/tunnel6/edge/releases/latest/download/edge-${os}-${arch} -o /usr/local/bin/edge


# 4. 啟動新版本
killall edge && edge server start
```

### Q: Edge 證書過期？

**自動續期**（預設）:
YAT 會在到期前 30 天自動續期。

**手動續期**:
```bash
# 在 Edge 伺服器上
./yat-edge certs renew --config config.yaml

# 重啟 Edge
sudo systemctl restart yat-edge
```

### Q: 如何檢視 Edge 資源使用？

```bash
# CPU 和記憶體
top -p $(pgrep yat-edge)

# 網路流量
iftop -i eth0

# 磁碟使用
du -sh /opt/yat/
```

---

## 擴充套件問題

### Q: 擴充套件安裝後沒有顯示？

**排查步驟**：

1. **檢查目錄結構**
```
extensions/my-extension/
├── index.js        # 必須
├── index.d.ts      # 可選
└── manifest.json   # 可選
```

2. **檢查入口檔案**
```javascript
// index.js 必須匯出 extension
export const extension = { ... }
```

3. **檢視控制台**
```
開啟開發者工具 > Console
檢視是否有載入錯誤
```

4. **重啟 YAT**

### Q: ARD 擴充套件連線失敗？

**常見錯誤**：

#### 錯誤 1: VNC 埠不可達

**症狀**: "Target port is unreachable: 127.0.0.1:5900"

**解決**:
1. 確認 macOS 已開啟螢幕共享
2. 檢查防火牆設定
3. 測試本地連線：
   ```bash
   nc -zv 127.0.0.1 5900
   ```

#### 錯誤 2: 角色錯誤

**症狀**: "當前裝置是客戶端，不能建立 ARD 通道"

**解決**:
- 確保 Publisher 裝置啟動隧道
- Consumer 裝置只能連線

#### 錯誤 3: VNC 客戶端未安裝

**症狀**: "未找到可用的本地 VNC 客戶端"

**解決**:
- macOS: 使用內建"螢幕共享"應用
- Windows: 安裝 RealVNC 或 TightVNC
- Linux: 安裝 Remmina 或 Vinagre

### Q: 如何解除安裝擴充套件？

1. 前往 **Apps** 頁面
2. 找到擴充套件
3. 點選 **解除安裝**
4. 確認解除安裝

> ⚠️ **注意**: 解除安裝會刪除該擴充套件的所有隧道

---

## 效能問題

### Q: 隧道延遲高？

**最佳化建議**：

1. **選擇更近的 Edge**
   - 中國使用者：香港、日本
   - 歐美使用者：法蘭克福、美西

2. **切換傳輸模式**
   - Relay → P2P（同地域）
   - Relay → WireGuard（大檔案）

3. **檢查網路質量**
   ```bash
   # 測試延遲
   ping edge.myroxy.dev
   
   # 測試頻寬
   speedtest-cli
   ```

### Q: 頻寬限制？

**限制因素**：
- Edge 伺服器頻寬
- 本地網路頻寬
- 傳輸模式

**建議**：
- 小檔案：Relay 模式
- 大檔案：P2P 或 WireGuard
- 影片流：P2P 模式

### Q: CPU 佔用高？

**最佳化建議**：

1. **減少隧道數量**
   - 關閉不用的隧道

2. **切換傳輸模式**
   - WireGuard CPU 佔用最低

3. **檢查擴充套件**
   - 某些擴充套件可能消耗較多資源

---

## 網路問題

### Q: 公司網路無法使用？

**可能原因**：
- 防火牆阻止連線
- 代理伺服器攔截
- 埠被封鎖

**解決**：

1. **使用 HTTPS（443 埠）**
   - 通常不會被封鎖

2. **配置代理**
   ```bash
   export HTTPS_PROXY=http://proxy.company.com:8080
   ```

3. **聯絡 IT 部門**
   - 申請開放 443 埠
   - 將 Edge 域名加入白名單

### Q: 行動網路不穩定？

**最佳化建議**：

1. **使用 Relay 模式**
   - P2P 在行動網路下成功率低

2. **啟用自動重連**
   - YAT 預設啟用

3. **使用 WireGuard**
   - 對行動網路最佳化好

### Q: IPv6 支援？

YAT 的 Edge 伺服器可以通過 IPv6 訪問，客戶端也會自動檢測 IPv6 連通性。

但 **WireGuard 網路當前僅支援 IPv4**：
- 網路 CIDR 分配僅支援 IPv4（如 `10.0.0.0/24`）
- LAN endpoint 採集（same-NAT 發現）僅處理 IPv4 地址
- Relay 轉發不處理 IPv6 資料包

如果需求足夠，未來版本可能會為 WireGuard 網路新增 IPv6 支援。

### Q: WireGuard relay 網路不通（peer 間無法通訊）

**現象**：Edge 已上線，WireGuard 介面已建立，但 peer 之間 ping 不通

**快速排查**：

```bash
# 1. 確認 nftables 規則已安裝
sudo nft list table ip yat_relay
# 期望看到 forward 鏈，counter 有計數

# 2. 確認 IP 轉發已啟用
cat /proc/sys/net/ipv4/ip_forward   # 應為 1

# 3. 確認 rp_filter 已關閉
cat /proc/sys/net/ipv4/conf/all/rp_filter   # 應為 0

# 4. 檢查 Docker iptables 是否干擾
sudo iptables -L DOCKER-USER -v -n   # 檢查是否有 DROP 策略
sudo iptables -V                      # 確認是 nft 還是 legacy
```

**常見原因**：
- `ip_forward` 未啟用（Edge 會自動設定，但容器許可權不足時可能失敗）
- Docker 主機的 `DOCKER-USER` 鏈 DROP 策略攔截了轉發包
- iptables-legacy 與 nftables 規則不相容（兩者使用獨立核心路徑）

::: tip 詳細排查指南
參見 [Edge WireGuard 配置 - 異常處理](edge/wireguard.md#異常處理)，包含 Docker iptables DROP 策略的完整診斷流程和解決方案。
:::

### Q: 虛擬機器 guest 與同區域網 peer 單向通訊（能發不能收）

**現象**：
執行在虛擬機器 guest（KVM、VirtualBox、VMware）中的裝置可以向同區域網 peer 傳送資料，但收不到任何回包（`0 B received, N KiB sent`）。

**原因**：VM guest 同時有 bridge 和 NAT 模式的虛擬網路卡。NAT 網路卡導致 guest 的流量被 host 做 masquerading，產生非對稱路由：

```
Peer → 發往 guest 的 LAN IP → 到達 guest ✓
Guest → 經 NAT 網絡卡回包 → 源 IP 變成 host IP → peer 不識別 → 丟包 ✗
```

**解決方案**：

#### 方案 1：確保 bridge 網路卡為預設路由（推薦）

確保 guest 的預設閘道器走 **bridge** 網路卡，而不是 NAT 網路卡：

**Linux guest**：
```bash
# 檢視當前路由
ip route

# bridge 網絡卡應該是預設路由
# 如果 NAT 網絡卡是預設路由，調整 metric：
sudo ip route change default via <bridge-gateway> dev <bridge-interface> metric 100
```

**Windows guest**：
1. 開啟**網路連線**
2. 右鍵 bridge 介面卡 → **屬性** → **IPv4** → **高階**
3. 取消勾選"自動躍點"，設定較低值（如 10）
4. 對 NAT 介面卡設定較高躍點值（如 100）

#### 方案 2：移除 NAT 模式網路卡

如果不需要 NAT 網路卡，從 VM 配置中刪除：

**KVM/libvirt**：
```bash
virsh edit <vm-name>
# 刪除 <interface type='network'> 且 <source network='default'/> 的塊
```

#### 方案 3：使用 relay 模式

如果 VM 網路無法重新配置，將 WireGuard 網路切換為 `force` relay 模式。流量將通過 Edge relay 伺服器轉發，繞過區域網路由問題。

::: tip
observed endpoint 顯示的是 **host 的 IP**（而非 guest 的 IP），這在 guest 使用 NAT 模式網路時是正常行為。host 執行 NAT masquerading，因此外部 peer 看到的是 host 的 IP。這是正常的，不是 bug。
:::

### Q: 為什麼 same-NAT（同區域網）優先使用 LAN endpoint 而不是 observed 公網 endpoint？

當兩個 peer 處於同一個 NAT 後（共享相同公網 IP），你可能會問：既然 observed 公網 endpoint 已經驗證可用，為什麼不直接用它？

**原因是 Hairpin NAT（NAT 迴環）的支援不確定。**

如果 same-NAT 的 peer 使用 observed 公網 endpoint，流量路徑會是：

```
裝置 A (192.168.1.100) → 路由器 → 公網 → 路由器 → 裝置 B (192.168.1.101)
```

這要求路由器支援 **Hairpin NAT** —— 即把來自 LAN 裝置、目標為本路由器公網 IP 的流量，迴環轉發到 LAN 內的另一臺裝置。許多家用路由器：

- ❌ 完全不支援 Hairpin NAT
- ⚠️ 實現有 bug 或不穩定
- ⚠️ 僅對特定協議支援（不一定支援 UDP）

**YAT 的方案**：當檢測到 same-NAT（兩個 peer 共享相同的 observed 公網 IP）時，優先使用各 peer 上報的 LAN endpoint，實現區域網直連，不依賴路由器的 Hairpin NAT 能力：

```
裝置 A (192.168.1.100) → 區域網直連 → 裝置 B (192.168.1.101)
```

如果 LAN endpoint 不可用或無效，YAT 會自動回退到 observed 公網 endpoint，並且 WireGuard 內建的自愈機制（PersistentKeepalive 每 25 秒）可以在數秒內恢復 endpoint 問題。

---

## 高階問題

### Q: 如何自定義 Edge 配置？

編輯 Edge 配置檔案：

```yaml
# config.yaml
server:
  port: 443
  tls:
    cert_file: certs/edge-tls.crt
    key_file: certs/edge-tls.key

captain:
  address: captain.myroxy.dev:443
  token: "your-token"

edge:
  name: "my-edge"
  data_dir: ./data
  
  # 高階配置
  max_channels: 100
  heartbeat_interval: 30
  reconnect_interval: 5
```

### Q: 如何除錯隧道？

**啟用除錯日誌**：

在客戶端中設定日誌級別為 DEBUG。

**檢視日誌**：
```bash
# macOS
tail -f ~/Library/Logs/YAT/main.log

# 過濾隧道相關日誌
grep -i tunnel ~/Library/Logs/YAT/main.log
```

### Q: 資料備份策略？

**自動備份**（開發中）

**手動備份**：
```bash
# 備份配置
tar czf yat-backup-$(date +%Y%m%d).tar.gz \
  ~/Library/Application\ Support/YAT/

# 恢復配置
tar xzf yat-backup-20241210.tar.gz \
  -C ~/Library/Application\ Support/YAT/
```

### Q: 如何貢獻程式碼？

1. Fork 倉庫
2. 建立分支
3. 提交修改
4. 提交 Pull Request

詳見 `CONTRIBUTING.md`。

---

## 💡 通用排查步驟

### 1. 檢查日誌

日誌是最有用的除錯資訊。

### 2. 重啟服務

很多問題是臨時的，重啟可以解決。

### 3. 更新版本

確保使用最新版本。

### 4. 搜尋 Issue

在 GitHub Issues 中搜索類似問題。

### 5. 提交 Issue

如果問題未解決，提交 Issue 並附帶：
- 作業系統版本
- YAT 版本
- 錯誤日誌
- 復現步驟
- 截圖

---

## 📚 相關檔案

- [快速開始](quick-start.md) - 入門指南
- [隧道管理](tunnel-management.md) - 隧道相關
- [Edge 管理](edge/management.md) - Edge 相關
- [應用與擴充套件](apps-and-extensions.md) - 擴充套件相關

---

## 💬 獲取幫助

- **GitHub Issues**: [提交問題](https://github.com/tunnel6/yat/issues)
- **Discussions**: [社群討論](https://github.com/tunnel6/yat/discussions)
- **Email**: support@tunnel6.com
---

*YAT Team - 讓內網穿透更簡單*
