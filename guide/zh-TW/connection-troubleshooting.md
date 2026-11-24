# 🌐 連線問題排查指南

> 如果遇到連線問題，請檢查網路狀態、防火牆設定以及 Edge 節點的執行狀態。

## 🔍 常見連線問題診斷

### Edge 節點連線失敗
- **現象**: 控制台顯示 "Edge Offline" 或 "Connection Failed"
- **可能原因**:
  - Edge 節點未啟動或已崩潰
  - 網路連線中斷
  - 防火牆阻止了必要的埠
  - DNS 解析失敗

### 隧道連線不穩定
- **現象**: 連線時斷時續，延遲高
- **可能原因**:
  - 網路頻寬不足
  - Edge 節點資源不足（CPU/記憶體）
  - 傳輸模式選擇不當（P2P vs Relay）
  - 網路 NAT 型別複雜

## 🛠️ 排查步驟

### 步驟 1: 檢查 Edge 節點狀態
```bash
# 檢查 Edge 程序
ps aux | grep yat-edge

# 檢查埠監聽
lsof -i :8080  # 或其他配置的埠

# 檢視日誌
tail -f /path/to/edge/logs/app.log
```

### 步驟 2: 測試網路連通性
```bash
# 測試到 Edge 的連通性
ping your-edge-domain.com

# 測試埠連通性
telnet your-edge-domain.com 8080
# 或使用 nc
nc -zv your-edge-domain.com 8080
```

### 步驟 3: 檢查防火牆設定
- 確保 Edge 節點的埠在防火牆中開放
- 檢查雲服務商安全組設定
- 檢查本地防火牆規則

## 📊 連線狀態監控

YAT 提供以下連線狀態指標：
- **連線狀態**: Online/Offline/Connecting
- **延遲**: RTT (Round-Trip Time)
- **丟包率**: Packet loss percentage
- **頻寬使用**: Current bandwidth usage

## 🚨 常見解決方案

### 方案 1: 切換傳輸模式
如果 P2P 連線失敗，嘗試切換到 Relay 模式：
1. 在隧道設定中選擇 "Relay Mode"
2. 儲存配置
3. 重新啟動隧道

### 方案 2: 調整 Edge 配置
最佳化 Edge 節點效能：
```yaml
# config.yaml
performance:
  max_connections: 1000
  bandwidth_limit: 100mbps
  keep_alive: 30s
```

## 📚 相關資源
- [Edge 管理](edge/management.md)
- [傳輸模式](transport-modes.md)
- [隧道管理](tunnel-management.md)

---
*檔案最後更新: 2026-05-04*
