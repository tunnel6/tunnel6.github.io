# YAT Desktop v1.2.1-native

## What's New

This release marks a major architectural milestone: **the networking layer of YAT Desktop has been fully rewritten in native code (Rust / Go)**, replacing the previous pure Node.js implementation. The core networking logic is now delivered as pre-built native binaries, bringing significant improvements in performance, stability, and cross-platform consistency.

### Why Native?

The prior Node.js-based networking layer faced growing challenges: platform-specific quirks (especially on Windows with WinTUN and Named Pipes), limited control over low-level network operations, and difficulty maintaining reliable WireGuard sessions across reconnects. Moving to native code gives us direct access to OS-level APIs, deterministic concurrency, and the ability to ship a tightly integrated helper + agent architecture on each platform.

### Architecture Overview

- **Network Agent (Rust)** — a lightweight, long-running native process responsible for WireGuard interface management, P2P tunnel establishment, and peer lifecycle. It runs as a separate process per platform convention (daemon on macOS/Windows, systemd service on Linux), communicating with the Electron frontend via IPC.
- **Helper Daemon** — a privileged helper on macOS and Windows that handles adapter creation and teardown, isolating elevated operations from the main application process.
- **NAPI Bridge** — a thin Node.js native addon that bridges Electron and the Agent, keeping the frontend integration surface minimal and stable.

### Key Benefits

- **Stability** — native concurrency model eliminates the async timing issues that previously caused session leaks and peer oscillation.
- **Performance** — WireGuard handshake and P2P path establishment are noticeably faster, especially on Windows.
- **Cross-platform parity** — macOS, Windows, and Linux now share the same core networking logic, reducing platform-specific bugs.
- **Maintainability** — the clear process boundary between frontend and networking makes each side easier to evolve independently.

### What's Included

- Multi-architecture native build pipeline (macOS x64/ARM64, Windows x64)
- Windows privileged helper daemon with auto-launch
- Serialized concurrent network join operations
- Agent-managed Edge connection lifecycle with lazy-connect model
- Improved TCP/UDP reconnection and recovery logic
- Extension incremental build support

---

Thank you for using YAT — happy tunneling!
