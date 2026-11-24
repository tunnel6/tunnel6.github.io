# YAT 桌面版 v1.2.1-native

## 更新內容

這個版本是一個重要的架構里程碑：**YAT Desktop 的網路層已完全改用原生程式碼（Rust / Go）重寫**，取代原本的純 Node.js 實作。核心網路邏輯現在以預先編譯的原生二進位檔交付，在效能、穩定性和跨平台一致性上都有明顯提升。

### 為什麼要改成原生實作？

原本的 Node.js 網路層遇到越來越多挑戰：各平台行為不一致（尤其是 Windows 上的 WinTUN 和 Named Pipe）、對底層網路操作的控制有限，也難以在重連後維持可靠的 WireGuard 連線。改用原生程式碼後，我們可以直接使用作業系統 API，取得確定性的並發模型，並在每個平台上提供緊密整合的 helper + agent 架構。

### 架構概覽

- **Network Agent（Rust）** — 輕量的常駐原生程序，負責管理 WireGuard 介面、建立 P2P 通道，以及維護 Peer 生命週期。它依平台慣例以獨立程序執行（macOS / Windows 為 daemon，Linux 為 systemd service），並透過 IPC 與 Electron 前端通訊。
- **Helper Daemon** — macOS 和 Windows 上的特權 Helper，負責建立和移除網路介面卡，讓需要提權的操作與主應用程式分離。
- **NAPI Bridge** — 輕量的 Node.js 原生附加模組，連接 Electron 與 Agent，讓前端整合範圍保持小而穩定。

### 主要效益

- **穩定性** — 原生並發模型消除了過去造成 Session 洩漏和 Peer 狀態震盪的非同步時序問題。
- **效能** — WireGuard 交握和 P2P 路徑建立更快，Windows 上的改善尤其明顯。
- **跨平台一致** — macOS、Windows 和 Linux 共用同一套核心網路邏輯，減少平台專屬問題。
- **可維護性** — 前端與網路層之間有清楚的程序邊界，兩側可以獨立演進。

### 本版本包含

- 多架構原生建置流程（macOS x64 / ARM64、Windows x64）
- Windows 特權 Helper daemon 自動啟動
- 並發加入網路操作改為序列化
- Agent 管理 Edge 連線生命週期，採用延遲連線模型
- 改進 TCP / UDP 重連與恢復邏輯
- 支援擴充功能增量編譯

---

感謝你使用 YAT，祝你連線愉快！
