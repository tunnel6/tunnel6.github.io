# macOS 安裝指南（未簽名 / 自簽名版本）

> YAT 的 macOS 安裝套件目前**未經 Apple 公證（notarization）**，首次開啟可能被 Gatekeeper 安全機制攔截。本頁彙整了所有可行方案：一鍵修復、Finder 放行、系統設定放行、終端機命令以及本機自簽名。

---

## 🧭 為什麼會被攔截？

目前版本的 macOS 安裝套件沒有使用付費的 Apple Developer ID 憑證簽名，也未經過 Apple 公證。macOS 的 Gatekeeper 會預設攔截這類應用程式，常見提示包括：

| 系統提示 | 實際含義 |
|---------|---------|
| 「無法打開，因為無法驗證開發者」 | 應用程式未經公證，屬於正常攔截 |
| 「YAT 已損壞，無法打開」 | Gatekeeper 對未公證應用程式的標準提示，**檔案並沒有真的損壞** |
| 「無法驗證是否包含惡意軟體」 | 同上，屬於未簽名應用程式的正常現象 |

> ⚠️ 安全前提：請只從 **GitHub Releases 官方頁面** 下載安裝套件，並使用隨附的 `SHA256SUMS.txt` 校驗檔案完整性後再繼續下面的步驟。

---

## ✅ 方案一：正常安裝（先試這個）

1. 雙擊下載的 `.dmg` 檔案。
2. 將 **YAT.app** 拖拽到 **Applications（應用程式）** 資料夾圖示上。
3. 完成後可退出 DMG，從 **啟動台** 或 **應用程式** 開啟 YAT。
4. 如果被攔截，繼續嘗試下面的方案。

> 💡 務必先把 YAT.app 拖到 /Applications 再開啟。直接從 DMG 視窗執行會被 macOS 以唯讀隨機路徑掛載（App Translocation），修復也無法持久生效，詳見下方「App Translocation」說明。

---

## 🛠 方案二：DMG 內一鍵修復（推薦）

DMG 內附帶了一鍵修復腳本 `③ fixapp.command`（即「首次開啟失敗請點我」）：

1. **先把 YAT.app 拖進 Applications**，再將腳本檔案拖到桌面（或 Applications）。
2. 雙擊桌面上的腳本。
3. 腳本會自動完成：
   - 移除 `YAT.app` 上的 `com.apple.quarantine` 隔離標記（僅作用於 YAT，不會修改系統設定）；
   - 啟動 YAT；
   - 若啟動失敗，自動嘗試將 YAT 加入 Gatekeeper 允許名單後重試；
   - 透過彈窗告知結果。

> ❓ **雙擊腳本沒反應？** macOS 可能也給腳本加了隔離標記。在 Finder 裡按住 `Control` 鍵點按腳本 → 選擇「打開」→ 彈窗中再點「打開」。或者先把腳本複製到桌面再雙擊（直接從唯讀 DMG 執行會受到 App Translocation 限制）。

---

## 🖱 方案三：Finder 一次性放行（無需命令列）

1. 開啟 **應用程式** 資料夾，找到 `YAT`。
2. 按住 `Control` 鍵點按應用程式圖示，選擇 **打開**。
3. 在彈出的確認框中再次點擊 **打開**。

之後正常雙擊開啟即可，此操作只需一次。

> ℹ️ macOS 15（Sequoia）及之後版本收緊了該入口，如果 Control-點按選單裡沒有「打開」，請使用方案四。

---

## ⚙️ 方案四：系統設定放行

1. 先按方案一正常安裝，雙擊 YAT 觸發一次攔截提示。
2. 開啟 **系統設定 → 隱私與安全性**。
3. 捲動到底部，找到「已阻止使用 YAT」的提示，點擊 **仍要開啟**。
4. 輸入管理者密碼確認。

---

## ⌨️ 方案五：終端機命令（等價於一鍵修復）

適合熟悉命令列的使用者，效果與 DMG 內一鍵修復腳本的核心動作一致：

```bash
# 移除 YAT.app 的隔離標記（只作用於 YAT，不影響系統設定）
xattr -dr com.apple.quarantine "/Applications/YAT.app"

# 啟動
open "/Applications/YAT.app"
```

如需確認隔離標記是否已清除：

```bash
xattr -l "/Applications/YAT.app" | grep quarantine
# 沒有輸出即表示已清除
```

---

## ✍️ 方案六：本機自簽名（ad-hoc codesign）

**適用情境**：

- 按方案五移除隔離標記後，仍然提示「YAT 已損壞，無法打開」（應用程式套件內簽名校驗失敗）；
- 企業 / 團隊內部分發，希望在本機形成一致的簽名狀態；
- 對安裝套件做過本機修改（如替換資源檔案）導致原簽名失效。

```bash
# 使用 ad-hoc 簽名對應用程式整體重簽（無需 Apple 開發者帳號）
codesign --force --deep --sign - "/Applications/YAT.app"

# 清除隔離標記並啟動
xattr -dr com.apple.quarantine "/Applications/YAT.app"
open "/Applications/YAT.app"
```

驗證簽名狀態：

```bash
codesign --verify --deep --strict "/Applications/YAT.app"
spctl --assess --verbose "/Applications/YAT.app"
```

**說明**：

- `--sign -` 表示 ad-hoc 簽名：不需要任何憑證，只保證應用程式套件自身完整性，**不代表 Apple 認可的開發者身份**。
- YAT 內嵌的 WireGuard 特權 helper 與 Network Agent 常駐程式本身就是 ad-hoc 簽名，此操作與建置方式保持一致。
- 正式的企業批次分發建議使用 Apple Developer ID 簽名 + 公證，而不是 ad-hoc。

可選：將 YAT 加入 Gatekeeper 允許名單（一鍵修復腳本的兜底動作）：

```bash
sudo spctl --add --label "YAT" "/Applications/YAT.app"
```

---

## 📦 App Translocation：為什麼從 DMG 裡直接雙擊無效？

當應用程式或腳本**直接從唯讀 DMG 中執行**時，macOS 會把 DMG 以唯讀方式掛載到隨機路徑（`/private/var/folders/.../AppTranslocation/<uuid>/d/`）：

- 即使移除了隔離標記，實際執行的仍然是 DMG 裡的唯讀副本；
- 下次開啟時依然會被攔截，修復不生效。

**正確做法**：

1. 把 `YAT.app` 拖到 **Applications**，從 `/Applications` 執行；
2. 一鍵修復腳本同樣先複製到桌面或 Applications，再雙擊執行。

---

## ❓ 常見問題

| 問題 | 處理方式 |
|------|---------|
| 提示「YAT 已損壞，無法打開」 | 這是未簽名應用程式的標準提示，並非真的損壞，使用方案五或方案六即可解決 |
| 一鍵修復腳本雙擊沒反應 | Control-點按腳本 → 打開 → 打開；或先把腳本複製到桌面再雙擊 |
| 修復後仍被攔截 | 確認 YAT.app 已位於 `/Applications`（而不是 DMG 內部），然後使用方案四 |
| 如何校驗下載完整性 | `shasum -a 256 -c SHA256SUMS.txt` |
| 如何解除安裝 | 把 `/Applications/YAT.app` 拖入廢紙筒；使用者資料位於 `~/Library/Application Support/YAT`，可視需要一併刪除 |

---

## 🔒 安全說明

- 本頁所有命令**只作用於 YAT.app**，不會全域關閉 macOS 的 Gatekeeper 或降低系統安全性。
- 請**不要**執行 `sudo spctl --master-disable` 之類的全域放行命令。
- 自簽名（ad-hoc）不會改變 Apple 的身份信任模型，僅用於本機完整性修復。
- 請只從官方 GitHub Releases 下載安裝套件，並透過 SHA-256 校驗後再安裝。

---

## 📚 相關文件

- [快速上手](./quick-start.md) - 安裝後的第一步
- [常見問題](./faq.md) - 其他安裝與使用問題
