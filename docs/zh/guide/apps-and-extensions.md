# 应用与扩展

> 了解 YAT 的应用生态和扩展系统

---

## 📋 目录

- [应用概述](#应用概述)
- [内置应用](#内置应用)
- [扩展系统](#扩展系统)
- [安装扩展](#安装扩展)
- [使用 ARD 远程桌面](#使用-ard-远程桌面)
- [开发扩展](#开发扩展)
- [常见问题](#常见问题)

---

## 应用概述

### 什么是应用（App）？

在 YAT 中，**应用（App）** 是一种特定远程访问能力的定义，包括：

- 📝 **配置表单** - 创建隧道时的配置界面
- 🎨 **UI 组件** - 隧道详情中的自定义展示
- 🔘 **操作按钮** - 启动、停止等操作的定义
- 🪝 **生命周期钩子** - 启动前、启动后的处理逻辑

### 应用 vs 扩展

| 概念 | 说明 | 关系 |
|------|------|------|
| **App** | 远程访问能力定义 | 抽象概念 |
| **Extension** | App 的载体 | 包含 App 定义 + 元数据 |

**示例**：
- ARD 扩展 包含 ARD 应用定义
- 一个扩展可以包含多个应用（未来支持）

---

## 内置应用

### HTTP 代理

**用途**：将本地 HTTP 服务暴露到公网

**特性**：
- ✅ 自动 HTTPS
- ✅ 自定义域名
- ✅ 路径重写

**配置项**：
```
- 隧道名称
- 本地端口（如 3000、8080）
- 本地主机（默认 127.0.0.1）
- 传输模式
- 共享设置
```

> 📸 ![Edge snapshot](/images/guide/snapshot-ext-http.png) HTTP 代理配置表单
> 
> 说明：显示端口输入、传输模式选择

**使用场景**：
- 本地开发服务器演示
- Webhook 测试
- API 调试

### TCP 转发

**用途**：转发任意 TCP 协议

**特性**：
- ✅ 透明传输
- ✅ 长连接支持
- ✅ 自动重连

**配置项**：
```
- 隧道名称
- 本地端口
- 远程端口（可选）
- 本地主机
```

**使用场景**：
- SSH 远程访问
- 数据库连接
- 自定义 TCP 服务

### UDP 转发

**用途**：转发 UDP 协议

**特性**：
- ✅ 低延迟
- ✅ 无连接状态
- ✅ 广播支持

**使用场景**：
- DNS 服务
- 游戏服务器
- 音视频流

---

## 扩展系统

### 扩展架构

```
┌─────────────────────────────────┐
│         YAT 客户端               │
│  ┌───────────────────────────┐  │
│  │   Extension Runtime Host  │  │
│  │  - 扩展加载器              │  │
│  │  - Host API Bridge        │  │
│  │  - 生命周期管理            │  │
│  └───────────┬───────────────┘  │
│              │                   │
│  ┌───────────▼───────────────┐  │
│  │    Extension (扩展)        │  │
│  │  - App Definition         │  │
│  │  - Vue/React Components   │  │
│  │  - Lifecycle Hooks        │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

### 扩展能力

扩展可以：

- ✅ 自定义配置表单
- ✅ 自定义详情页面
- ✅ 定义操作按钮
- ✅ 实现生命周期钩子
- ✅ 调用 Host API（启动/停止通道）
- ✅ 自定义远程地址解析

### 扩展限制

出于安全考虑，扩展**不能**：

- ❌ 直接访问文件系统
- ❌ 执行系统命令
- ❌ 访问未授权的 API
- ❌ 修改其他扩展数据

---

## 安装扩展

### 方式一：应用市场安装（开发中）

1. 点击 **Apps** > **市场**
2. 浏览可用扩展
3. 点击 **安装**
4. 等待安装完成

### 方式二：本地安装

1. 下载扩展包（`.yat` 或目录）
2. 放置到扩展目录：

**macOS**:
```
~/Library/Application Support/yat/extensions/
```

**Windows**:
```
%APPDATA%/yat/extensions/
```

**Linux**:
```
~/.config/yat/extensions/
```

3. 重启 YAT 客户端
4. 扩展自动加载

### 验证安装

1. 点击 **Apps**
2. 查看已安装的扩展列表
3. 确认扩展状态为 **已启用**

> 📸 ![Edge snapshot](/images/guide/snapshot-ext-01.png)  扩展管理页面
> 
> 说明：显示已安装扩展、启用/禁用开关、卸载按钮

### 卸载扩展

1. 找到已安装的扩展
2. 点击 **卸载**
3. 确认卸载

> ⚠️ **注意**：卸载扩展会删除该扩展创建的所有隧道

---

## 使用 ARD 远程桌面

ARD (Apple Remote Desktop) 扩展是 YAT 的第一个官方扩展，用于 macOS 远程桌面访问。

### 功能特性

- 🖥️ **VNC 远程桌面** - 标准 VNC 协议
- 🔐 **安全传输** - mTLS 加密
- 🌐 **多传输模式** - Relay / P2P / WireGuard
- 👥 **角色分离** - Publisher / Consumer
- 📸 **桌面快照** - 实时预览

### 前置要求

**Publisher（服务器端）**：
- ✅ macOS 系统
- ✅ 已开启屏幕共享或远程管理
- ✅ YAT 客户端 + ARD 扩展

**Consumer（客户端）**：
- ✅ 任意系统（macOS/Windows/Linux）
- ✅ YAT 客户端 + ARD 扩展
- ✅ VNC 客户端（如 RealVNC、TightVNC）

### 配置 Publisher

#### 步骤 1：开启 macOS 屏幕共享

1. 打开 **系统设置** > **通用** > **共享**
2. 启用 **屏幕共享** 或 **远程管理**
3. 设置访问权限

> 📸 ![Tunnel snapshot](/images/guide/snapshot-ext-ard-tunrnon.png)macOS 屏幕共享设置
> 
> 说明：显示共享开关、权限设置

#### 步骤 2：创建 ARD 隧道

1. 点击 **Tunnels** > **创建隧道**
2. 选择 **Mac Remote Desktop**
3. 填写配置：
   - **隧道名称**: 我的 Mac
   - **目标主机**: 127.0.0.1 或局域网 IP
   - **角色**: 服务器（Publisher）
4. 点击 **创建**


> 说明：显示主机名输入、角色选择、传输模式

#### 步骤 3：启动隧道

1. 找到创建的隧道
2. 点击 **连接** 按钮
3. 等待状态变为 **运行中**

**启动前检查**：
- ✅ 本地 5900 端口可达
- ✅ Edge 在线
- ✅ 角色为 Publisher

### 配置 Consumer

#### 步骤 1：查看共享隧道

在 Consumer 设备上：
1. 打开 **Tunnels** 页面
2. 看到 Publisher 创建的共享隧道
3. 角色自动识别为 **Consumer**

#### 步骤 2：连接远程桌面

**方式一：通过 YAT 客户端**

1. 点击 **连接远程桌面** 按钮
2. 自动调起 VNC 客户端
3. 输入密码（如果需要）

**方式二：手动连接**

1. 复制远程地址（如 `vnc://edge.myroxy.dev:12345`）
2. 打开 VNC 客户端
3. 粘贴地址并连接

> 📸 ![Tunnel snapshot](/images/guide/snapshot-ext-ard-vncconnect.png) VNC 客户端连接界面
> 
> 说明：显示 VNC 客户端、地址输入、连接按钮

### 角色说明

#### Publisher（服务器）

- 🔧 **权限**: 启动/停止/控制隧道
- 📡 **职责**: 提供 VNC 服务
- 💻 **设备**: 被控 Mac

#### Consumer（客户端）

- 👁️ **权限**: 查看状态、连接远程桌面
- 🖱️ **职责**: 使用远程桌面
- 💻 **设备**: 控制端设备

### 高级配置

#### 传输模式选择

| 模式 | 延迟 | 带宽 | 适用场景 |
|------|------|------|---------|
| **Relay** | 中 | 中 | 通用场景 |
| **P2P** | 低 | 高 | 同网络/低延迟 |
| **WireGuard** | 低 | 高 | 大文件传输 |

#### 自定义端口

默认使用 5900 端口，如需修改：

1. 在 macOS 中修改 VNC 监听端口
2. 创建隧道时填写自定义端口

---

## 开发扩展

### 快速开始

详细的扩展开发指南请参考：[EXTENSION_DEVELOPER_GUIDE.md](../EXTENSION_DEVELOPER_GUIDE.md)

### 开发步骤概览

#### 1. 初始化项目

```bash
mkdir my-extension
cd my-extension
npm init -y
npm install @hilow/extension-types vue typescript vite
```

#### 2. 创建入口文件

```typescript
// src/index.ts
import type { AppExtensionPackage } from '@hilow/extension-types'

export const extension: AppExtensionPackage = {
  metadata: {
    id: 'app-my-extension',
    name: 'My Extension',
    version: '1.0.0',
    description: 'My custom extension',
    author: 'Developer'
  },
  appDefinition: {
    id: 'app-my-extension',
    i18n: { /* ... */ },
    actions: [ /* ... */ ],
    hooks: { /* ... */ }
  }
}
```

#### 3. 开发组件

创建 Vue/React 组件用于配置表单和详情页面。

#### 4. 测试扩展

```bash
npm run build
# 将 dist 目录复制到扩展目录
# 重启 YAT 客户端
```

#### 5. 发布扩展

打包扩展并发布到应用市场（即将支持）。

### 示例项目

- **ARD 扩展**: `extensions/ard/`
- **React 示例**: `extensions/react-example/`
- **基础示例**: `extensions/example/`

---

## 常见问题

### Q: 扩展安装后没有显示？

**检查清单**：
1. 扩展目录结构是否正确
2. 是否包含 `index.js` 入口文件
3. 是否重启了 YAT 客户端
4. 查看开发者工具控制台是否有错误

### Q: ARD 扩展连接失败？

**可能原因**：
1. macOS 未开启屏幕共享
2. 5900 端口被占用
3. 防火墙阻止连接
4. Edge 离线

**解决步骤**：
```bash
# 检查端口
lsof -i :5900

# 检查屏幕共享状态
defaults read /var/db/launchd.db/com.apple.launchd/overrides.plist com.apple.screensharing
```

### Q: 如何开发自定义扩展？

阅读 [扩展开发指南](../EXTENSION_DEVELOPER_GUIDE.md)，包含：
- 类型系统说明
- Host API 文档
- 完整示例代码
- 打包发布流程

### Q: 扩展可以访问我的数据吗？

扩展只能访问：
- ✅ 自己创建的隧道数据
- ✅ Host API 暴露的接口
- ✅ 用户主动提供的配置

扩展**不能**访问：
- ❌ 其他扩展的数据
- ❌ 系统文件
- ❌ 未授权的网络资源

### Q: 扩展会自动更新吗？

目前不支持自动更新，需要：
1. 下载新版本
2. 替换旧版本
3. 重启 YAT

自动更新功能开发中。

---

## 💡 最佳实践

### 1. 选择合适的传输模式

- **Web 服务**: HTTP/HTTPS + Relay
- **远程桌面**: TCP/UDP + P2P
- **数据库**: TCP + WireGuard

### 2. 安全建议

- 仅在需要时启动隧道
- 使用独占模式（个人使用）
- 定期检查隧道列表
- 及时更新扩展

### 3. 性能优化

- 优先使用 P2P 模式
- 大文件传输使用 WireGuard
- 避免同时运行过多隧道

---

## 📚 相关文档

- [扩展开发指南](../EXTENSION_DEVELOPER_GUIDE.md) - 完整的扩展开发文档
- [隧道管理](./tunnel-management.md) - 创建和管理隧道
- [传输模式](./transport-modes.md) - 了解传输模式差异
- [多设备协作](./multi-device-roles.md) - Publisher/Consumer 角色

---

*YAT Team - 让内网穿透更简单*
