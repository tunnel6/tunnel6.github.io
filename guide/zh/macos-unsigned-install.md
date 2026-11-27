# macOS 安装指南（未签名 / 自签名版本）

> YAT 的 macOS 安装包目前**未经 Apple 公证（notarization）**，首次打开可能被 Gatekeeper 安全机制拦截。本页汇总了全部可行方案：一键修复、Finder 放行、系统设置放行、终端命令以及本地自签名。

---

## 🧭 为什么会被拦截？

当前版本的 macOS 安装包没有使用付费的 Apple Developer ID 证书签名，也没有经过 Apple 公证。macOS 的 Gatekeeper 会对这类应用做默认拦截，常见提示包括：

| 系统提示 | 实际含义 |
|---------|---------|
| “无法打开，因为无法验证开发者” | 应用未经公证，属于正常拦截 |
| “YAT 已损坏，无法打开” | Gatekeeper 对未公证应用的标准提示，**文件并没有真的损坏** |
| “无法验证是否包含恶意软件” | 同上，属于未签名应用的正常现象 |

> ⚠️ 安全前提：请只从 **GitHub Releases 官方页面** 下载安装包，并使用随包发布的 `SHA256SUMS.txt` 校验文件完整性后再继续下面的步骤。

---

## ✅ 方案一：正常安装（先试这个）

1. 双击下载的 `.dmg` 文件。
2. 将 **YAT.app** 拖拽到 **Applications（应用程序）** 文件夹图标上。
3. 弹出 DMG 后，从 **启动台** 或 **应用程序** 中打开 YAT。
4. 如果被拦截，继续尝试下面的方案。

> 💡 一定要先把 YAT.app 拖到 /Applications 再打开。直接从 DMG 窗口里运行会被 macOS 以只读随机路径挂载（App Translocation），修复也无法持久生效，详见下方「App Translocation」说明。

---

## 🛠 方案二：DMG 内一键修复（推荐）

DMG 内附带了一键修复脚本 `③ fixapp.command`（即“首次打开失败请点我”）：

1. **先把 YAT.app 拖进 Applications**，再把脚本文件拖到桌面（或 Applications）。
2. 双击桌面上的脚本。
3. 脚本会自动完成：
   - 移除 `YAT.app` 上的 `com.apple.quarantine` 隔离标记（仅作用于 YAT，不改系统设置）；
   - 启动 YAT；
   - 若启动失败，自动尝试把 YAT 加入 Gatekeeper 允许名单后重试；
   - 通过弹窗告知结果。

> ❓ **双击脚本没反应？** macOS 可能也给脚本加了隔离标记。在 Finder 里按住 `Control` 点击脚本 → 选择“打开” → 弹窗中再点“打开”。或者把脚本先复制到桌面再双击（直接从只读 DMG 运行会受到 App Translocation 限制）。

---

## 🖱 方案三：Finder 一次性放行（无需命令行）

1. 打开 **应用程序** 文件夹，找到 `YAT`。
2. 按住 `Control` 键点击应用图标，选择 **打开**。
3. 在弹出的确认框中再次点击 **打开**。

此后正常双击打开即可，此操作只需一次。

> ℹ️ macOS 15（Sequoia）及以后版本收紧了该入口，如果 Control-点击菜单里没有“打开”，请使用方案四。

---

## ⚙️ 方案四：系统设置放行

1. 先按方案一正常安装，双击 YAT 触发一次拦截提示。
2. 打开 **系统设置 → 隐私与安全性**。
3. 滚动到底部，找到“已阻止使用 YAT”的提示，点击 **仍要打开**。
4. 输入管理员密码确认。

---

## ⌨️ 方案五：终端命令（等价于一键修复）

适合熟悉命令行的用户，效果与 DMG 内一键修复脚本的核心动作一致：

```bash
# 移除 YAT.app 的隔离标记（只作用于 YAT，不影响系统设置）
xattr -dr com.apple.quarantine "/Applications/YAT.app"

# 启动
open "/Applications/YAT.app"
```

如需确认隔离标记是否已清除：

```bash
xattr -l "/Applications/YAT.app" | grep quarantine
# 无输出即表示已清除
```

---

## ✍️ 方案六：本地自签名（ad-hoc codesign）

**适用场景**：

- 按方案五移除隔离标记后，仍然提示“YAT 已损坏，无法打开”（应用包内签名校验失败）；
- 企业 / 团队内部分发，希望在本地形成一致的签名状态；
- 对安装包做过本地修改（如替换资源文件）导致原签名失效。

```bash
# 使用 ad-hoc 签名对应用整体重签（无需 Apple 开发者账号）
codesign --force --deep --sign - "/Applications/YAT.app"

# 清除隔离标记并启动
xattr -dr com.apple.quarantine "/Applications/YAT.app"
open "/Applications/YAT.app"
```

验证签名状态：

```bash
codesign --verify --deep --strict "/Applications/YAT.app"
spctl --assess --verbose "/Applications/YAT.app"
```

**说明**：

- `--sign -` 表示 ad-hoc 签名：不需要任何证书，只保证应用包自身完整性，**不代表 Apple 认可的开发者身份**。
- YAT 内嵌的 WireGuard 特权 helper 与 Network Agent 守护进程本身就是 ad-hoc 签名，此操作与构建方式保持一致。
- 正式的企业批量分发建议使用 Apple Developer ID 签名 + 公证，而不是 ad-hoc。

可选：把 YAT 加入 Gatekeeper 允许名单（一键修复脚本的兜底动作）：

```bash
sudo spctl --add --label "YAT" "/Applications/YAT.app"
```

---

## 📦 App Translocation：为什么从 DMG 里直接双击无效？

当应用或脚本**直接从只读 DMG 中运行**时，macOS 会把 DMG 以只读方式挂载到随机路径（`/private/var/folders/.../AppTranslocation/<uuid>/d/`）：

- 即使移除了隔离标记，实际运行的仍然是 DMG 里的只读副本；
- 下次打开时依然会被拦截，修复不生效。

**正确做法**：

1. 把 `YAT.app` 拖到 **Applications**，从 `/Applications` 运行；
2. 一键修复脚本同样先复制到桌面或 Applications，再双击运行。

---

## ❓ 常见问题

| 问题 | 处理方式 |
|------|---------|
| 提示“YAT 已损坏，无法打开” | 这是未签名应用的标准提示，并非真的损坏，使用方案五或方案六即可解决 |
| 一键修复脚本双击没反应 | Control-点击脚本 → 打开 → 打开；或先把脚本复制到桌面再双击 |
| 修复后仍被拦截 | 确认 YAT.app 已位于 `/Applications`（而不是 DMG 内部），然后使用方案四 |
| 如何校验下载完整性 | `shasum -a 256 -c SHA256SUMS.txt` |
| 如何卸载 | 把 `/Applications/YAT.app` 拖入废纸篓；用户数据位于 `~/Library/Application Support/YAT`，可按需一并删除 |

---

## 🔒 安全说明

- 本页所有命令**只作用于 YAT.app**，不会全局关闭 macOS 的 Gatekeeper 或降低系统安全性。
- 请**不要**执行 `sudo spctl --master-disable` 之类的全局放行命令。
- 自签名（ad-hoc）不改变 Apple 的身份信任模型，仅用于本地完整性修复。
- 请只从官方 GitHub Releases 下载安装包，并通过 SHA-256 校验后再安装。

---

## 📚 相关文档

- [快速上手](./quick-start.md) - 安装后的第一步
- [常见问题](./faq.md) - 其他安装与使用问题
