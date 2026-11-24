# 多裝置與角色管理

> 瞭解 YAT 的 Actor 模型和多裝置協作機制

---

## 📋 目錄

- [Actor 模型概述](#actor-模型概述)
- [角色定義](#角色定義)
- [多裝置協作](#多裝置協作)
- [Session 管理](#session-管理)
- [裝置管理](#裝置管理)
- [常見問題](#常見問題)

---

## Actor 模型概述

### 什麼是 Actor 模型？

YAT 使用 **Actor 模型** 來管理多裝置協作。每個裝置在隧道中扮演一個**角色（Actor）**，共同完成遠端訪問任務。

### 為什麼需要 Actor 模型？

**場景示例**：

```
公司電腦 ──想要訪問──► 家裡 Mac

傳統方案：
- 無法區分誰在訪問
- 無法控制權限
- 狀態混亂

YAT Actor 模型：
- 公司電腦 = Consumer（消費者）
- 家裡 Mac = Publisher（釋出者）
- 角色清晰，許可權明確
```

### 身份標識

YAT 使用兩層身份標識：

1. **傳輸層身份**: `session_id` / `device_id`
2. **業務層身份**: `actor_role` / `actor_session_id` / `actor_device_id`

---

## 角色定義

### Publisher（釋出端）

**職責**: 提供遠端服務

**許可權**:
- ✅ 啟動隧道
- ✅ 停止隧道
- ✅ 控制通道
- ✅ 修改配置

**示例場景**:
- 家裡的 Mac 提供 VNC 服務
- 公司伺服器提供 API 服務
- 本地開發環境提供除錯服務

### Consumer（消費端）

**職責**: 使用遠端服務

**許可權**:
- ✅ 檢視隧道狀態
- ✅ 訪問遠端地址
- ✅ 檢視詳細資訊
- ❌ 不能啟動/停止隧道
- ❌ 不能修改配置

**示例場景**:
- 公司電腦訪問家裡 Mac
- 手機訪問公司伺服器
- 客戶訪問演示環境

### Controller（控制端）

**職責**: 管理隧道配置（預留角色）

**許可權**:
- ✅ 所有 Publisher 許可權
- ✅ 管理共享設定
- ✅ 管理參與者

> ⚠️ **注意**: Controller 角色目前為預留功能，尚未實現。

---

## 多裝置協作

### 典型場景

#### 場景 1：遠端辦公

```
家裡 Mac (Publisher)
  ↓ 建立隧道，共享
  ↓
公司筆記本 (Consumer)
  ↓ 訪問共享隧道
  ↓
遠端桌面連線成功
```

**配置步驟**：

1. **家裡 Mac**：
   - 建立 ARD 隧道
   - 設定為 **共享** 模式
   - 角色自動為 **Publisher**
   - 啟動隧道

2. **公司筆記本**：
   - 登入同一賬號
   - 在隧道列表看到共享隧道
   - 角色自動為 **Consumer**
   - 點選連線遠端桌面

#### 場景 2：團隊協作

```
開發者 A (Publisher)
  ↓ 建立 API 隧道
  ↓
開發者 B (Consumer)
  ↓ 訪問 API
  ↓
測試人員 C (Consumer)
  ↓ 訪問 API
```

### 角色分配規則

#### 建立時分配

- **建立裝置**: 預設 **Publisher**
- **其他裝置**: 自動 **Consumer**

#### 執行時解析

YAT 會從以下來源解析角色：

1. **Participants 列表** - 執行時參與者資訊
2. **Sessions 列表** - 會話資訊
3. **Config 配置** - tunnelRole 欄位

```typescript
// 角色解析優先順序
1. participants 中的 role
2. sessions 中的 publisherDeviceId / consumerDeviceId
3. config.tunnelRole
4. 預設 fallback
```

### 許可權矩陣

| 操作 | Publisher | Consumer | Controller |
|------|-----------|----------|------------|
| 啟動隧道 | ✅ | ❌ | ✅ |
| 停止隧道 | ✅ | ❌ | ✅ |
| 檢視狀態 | ✅ | ✅ | ✅ |
| 訪問服務 | ✅ | ✅ | ✅ |
| 修改配置 | ✅ | ❌ | ✅ |
| 刪除隧道 | ✅ | ❌ | ✅ |
| 管理參與者 | ❌ | ❌ | ✅ |

---

## Session 管理

### 什麼是 Session？

**Session（會話）** 表示一次隧道執行例項。

### Session ID 格式

```
格式: {appId}:{tunnelId}:{deviceId}:{actorRole}

示例: 
- app-ard:tunnel-123:device-abc:publisher
- app-ard:tunnel-123:device-xyz:consumer
```

### 為什麼需要角色字尾？

同一裝置可能在不同時間扮演不同角色：

```
裝置 A 上午：publisher（提供服務的角色）
裝置 A 下午：consumer（訪問其他服務的角色）

Session 區分：
- ard:tunnel-123:device-A:publisher
- ard:tunnel-456:device-A:consumer
```

### Session 生命週期

```
建立隧道
  ↓
啟動通道 → 建立 Session
  ↓
執行中 → Session 活躍
  ↓
停止通道 → Session 結束
  ↓
刪除隧道 → Session 清理
```

---

## 裝置管理

### 裝置 ID

每個裝置有唯一的裝置 ID：

```
格式: device-{random-string}
示例: device-a1b2c3d4e5f6
```

### 檢視裝置資訊

在隧道詳情的 **參與者** 區域可以看到：

- **裝置 ID**
- **角色**
- **狀態**（Online/Offline）
- **最後線上時間**


### 裝置狀態

| 狀態 | 說明 |
|------|------|
| **Online** | 裝置線上，正在參與隧道 |
| **Offline** | 裝置離線 |
| **Idle** | 裝置線上但未參與 |

### 管理裝置

#### 移除裝置（開發中）

未來版本支援：
1. 進入隧道詳情
2. 找到參與者列表
3. 點選 **移除** 按鈕
4. 確認移除

> ⚠️ **注意**: 移除 Publisher 裝置會導致隧道停止

---

## 常見問題

### Q: 如何切換角色？

目前**不支援**執行時切換角色。

**解決方法**：
1. 停止隧道
2. 刪除隧道
3. 在新裝置上重新建立

### Q: 一個裝置可以有多個角色嗎？

**可以**。同一裝置可以在不同隧道中扮演不同角色：

```
隧道 A: Publisher
隧道 B: Consumer
```

但在**同一個隧道**中，一個裝置只能有一個角色。

### Q: Publisher 離線後隧道會怎樣？

**隧道會停止**。因為 Publisher 是服務提供者，離線後服務不可用。

### Q: Consumer 可以變成 Publisher 嗎？

目前**不支援**動態轉換。

**設計原因**：
- Publisher 需要提供本地服務
- Consumer 只是訪問服務
- 角色轉換需要服務遷移

### Q: 如何檢視當前裝置 ID？

在開發者工具控制台：

```javascript
localStorage.getItem('device:id')
```

### Q: 裝置 ID 可以修改嗎？

**不建議修改**。裝置 ID 用於：
- 身份識別
- 會話管理
- 許可權控制

修改可能導致：
- 隧道狀態混亂
- 許可權丟失
- 會話失效

### Q: 多裝置同時操作會衝突嗎？

YAT 使用 **revision-based conflict resolution** 機制：

1. 每次修改遞增 revision
2. 衝突時同步最新狀態
3. 409 衝突 → 同步 → 重試

---

## 💡 最佳實踐

### 1. 明確角色分工

- **Publisher**: 穩定的伺服器裝置
- **Consumer**: 移動的客戶端裝置

### 2. 合理設定共享模式

```
個人多裝置: Shared（共享）
團隊協作: Shared（共享）
敏感服務: Exclusive（獨佔）
```

### 3. 監控裝置狀態

定期檢查參與者列表：
- Publisher 是否線上
- Consumer 數量是否合理
- 有無異常裝置

### 4. 裝置命名規範

建議在裝置上做標記：

```
MacBook-Pro (Publisher)
ThinkPad (Consumer)
iPhone (Consumer)
```

---

## 📚 相關檔案

- [隧道管理](tunnel-management.md) - 建立共享隧道
- [應用與擴充套件](apps-and-extensions.md) - ARD 多裝置使用
- [常見問題](faq.md) - 角色相關問題

---

*YAT Team - 讓內網穿透更簡單*
