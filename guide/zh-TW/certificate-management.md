# 📜 證書管理指南

> 證書是保證通訊安全的關鍵。定期檢查證書有效期，確保證書及時更新，避免服務中斷。

## 🔐 YAT 證書體系概述

YAT 使用 mTLS（雙向 TLS）認證確保所有通訊安全：
- **Root CA 證書**: 用於簽發所有其他證書的根證書
- **Edge TLS 證書**: Edge 節點的 TLS 證書，用於 HTTPS 訪問
- **gRPC 證書**: 用於 gRPC 服務間的安全通訊
- **客戶端證書**: 用於客戶端身份驗證

## 📅 證書生命週期管理

### 自動證書管理
YAT 支援自動證書籤發和續期：
- **Let's Encrypt**: 自動申請免費 SSL/TLS 證書
- **自動續期**: 證書到期前 30 天自動續期
- **狀態監控**: 即時監控證書有效期

### 手動證書管理
當需要手動管理證書時：
```bash
# 檢視證書資訊
./yat-edge certs info --config config.yaml

# 手動續期證書
./yat-edge certs renew --config config.yaml

# 重新生成證書
./yat-edge certs generate --config config.yaml
```

## 🚨 常見證書問題

### 證書過期
- **現象**: 瀏覽器顯示 "您的連線不是私密連線" 或 "NET::ERR_CERT_DATE_INVALID"
- **解決方案**: 
  - 等待自動續期（通常在到期前 30 天）
  - 手動執行 `./yat-edge certs renew`
  - 檢查系統時間是否正確

### 證書不匹配
- **現象**: "NET::ERR_CERT_COMMON_NAME_INVALID"
- **解決方案**: 
  - 確認證書域名與訪問域名完全匹配
  - 檢查 CNAME 記錄是否正確指向 Edge 節點
  - 重新生成證書並指定正確的域名

## 🛠️ 證書配置最佳實踐

- **域名配置**: 確保證書包含所有需要訪問的域名（主域名 + www 子域名）
- **金鑰安全**: 私鑰檔案應設定適當的檔案許可權（600）
- **備份策略**: 定期備份證書和私鑰檔案
- **監控告警**: 設定證書到期前 7 天告警

## 📚 相關資源
- [Edge 管理](edge/management.md)
- [自定義域名](custom-domains.md)
- [FAQ - 證書相關問題](faq.md#q-edge-certificate-expired)

---
*檔案最後更新: 2026-05-04*
