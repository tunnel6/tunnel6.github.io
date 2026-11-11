# YAT 桌面客户端 v1.2.1-native

## 更新内容

本版本是一个重要的架构里程碑：**YAT Desktop 的网络层已完全使用原生代码（Rust / Go）重写**，替代了此前纯 Node.js 的实现。核心网络逻辑现在以预编译的原生二进制形式交付，在性能、稳定性和跨平台一致性方面带来了显著提升。

### 为什么要做原生重构？

此前基于 Node.js 的网络层面临越来越多的挑战：平台差异问题（尤其是 Windows 上的 WinTUN 和 Named Pipe）、对底层网络操作的控制力有限，以及在断线重连场景下难以维持可靠的 WireGuard 会话。迁移到原生代码让我们能够直接访问操作系统级 API，获得确定性的并发模型，并在每个平台上构建紧密集成的 helper + agent 架构。

### 架构概览

- **Network Agent（Rust）** — 一个轻量级的长驻原生进程，负责 WireGuard 接口管理、P2P 隧道建立和 Peer 生命周期管理。它按照各平台惯例以独立进程运行（macOS/Windows 为守护进程，Linux 为 systemd service），通过 IPC 与 Electron 前端通信。
- **Helper Daemon** — macOS 和 Windows 上的特权 Helper，负责网络适配器的创建和销毁，将提权操作与主应用进程隔离。
- **NAPI Bridge** — 一个轻量的 Node.js 原生插件，作为 Electron 与 Agent 之间的桥梁，保持前端集成面最小且稳定。

### 核心收益

- **稳定性** — 原生并发模型消除了此前导致 Session 泄漏和 Peer 状态振荡的异步时序问题。
- **性能** — WireGuard 握手和 P2P 路径建立明显更快，尤其在 Windows 上。
- **跨平台一致** — macOS、Windows 和 Linux 现在共享同一套核心网络逻辑，减少平台特有 Bug。
- **可维护性** — 前端与网络层之间清晰的进程边界，使两侧可以独立演进。

### 本版本包含

- 多架构原生构建流水线（macOS x64/ARM64、Windows x64）
- Windows 特权 Helper 守护进程自动启动
- 并发加入网络操作序列化
- Agent 托管 Edge 连接生命周期，支持懒连接模型
- 改进的 TCP/UDP 重连与恢复逻辑
- 扩展增量编译支持

---

感谢使用 YAT，祝你穿越愉快！
