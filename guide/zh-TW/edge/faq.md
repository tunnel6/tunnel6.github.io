# Edge 常見問題

> Edge 伺服器部署和執行中的常見問題解答

---

## 📋 目錄

- [連線與狀態](#連線與狀態)
- [日誌與監控](#日誌與監控)
- [配置與部署](#配置與部署)
- [系統與效能](#系統與效能)

---

## 連線與狀態

### Q: Edge 顯示離線怎麼辦？

**檢查清單**：
1. 伺服器是否正常執行
2. 防火牆是否開放 443 埠
3. Edge 程式是否執行
4. 網路連線是否正常

**解決步驟**：

```bash
# 1. 檢查 Edge 程序
ps aux | grep edge

# 2. 檢查埠
netstat -tlnp | grep 443

# 3. 檢視日誌
journalctl -u edge -n 100

# 4. 重啟服務
sudo systemctl restart edge
```

### Q: Edge 可以更換 IP 嗎？

可以，但需要：
1. 更新 DNS 記錄
2. 重新生成證書
3. 重啟 Edge

---

## 日誌與監控

### Q: 如何檢視 Edge 日誌？

```bash
# systemd 方式
sudo journalctl -u edge -f

# 直接檢視日誌檔案
tail -f /var/log/edge.log
```

---

## 配置與部署

### Q: 一個賬號可以建立多少個 Edge？

目前沒有限制，但建議：
- 個人使用者：1-3 個 Edge
- 團隊使用者：5-10 個 Edge

---

## 系統與效能

### Q: Edge 伺服器的效能要求？

**最低配置**：
- CPU: 1 核
- 記憶體: 512MB
- 頻寬: 1Mbps
- 儲存: 1GB

**推薦配置**：
- CPU: 2 核
- 記憶體: 1GB
- 頻寬: 10Mbps
- 儲存: 5GB

### Q: Edge 支援哪些作業系統？

- ✅ Ubuntu 18.04+
- ✅ CentOS 7+
- ✅ Debian 9+
- ✅ macOS（開發測試）
- ❌ Windows（暫不支援）

---

## 🔗 相關檔案

- [Edge 伺服器管理](management.md) - 部署和管理 Edge
- [啟動引數參考](startup-params.md) - 完整命令列引數列表
- [配置引數參考](config-reference.md) - YAML 配置檔案完整參考
- [常見問題](faq.md) - 全域性常見問題

---

*YAT Team - 讓內網穿透更簡單*
