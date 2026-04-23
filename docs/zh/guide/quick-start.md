# 快速开始

> 5 分钟上手 YAT，创建您的第一个隧道

---

## 📋 前置要求

- ✅ macOS 10.15+ / Windows 10+ / Linux (Ubuntu 18.04+)
- ✅ 网络连接
- ✅ YAT 账户（支持 GitHub/Google 登录）

---

## 步骤 1：安装 YAT 客户端

### macOS

1. 下载 `.dmg` 安装包
2. 双击打开，拖拽到 Applications 文件夹
3. 从 Launchpad 或 Applications 文件夹启动

> ⚠️ **首次启动提示**：如果提示"无法验证开发者"，请前往 系统设置 > 隐私与安全性 > 仍要打开

### Windows

1. 下载 `.exe` 安装包
2. 双击运行安装向导
3. 按提示完成安装

### Linux

```bash
# 下载 AppImage
chmod +x yat-*.AppImage
./yat-*.AppImage
```

### 验证安装

启动后，您应该看到 YAT 的主界面：

> 📸 ![Tunnel snapshot](/images/guide/snapshot-login.png)YAT 主界面 - 首次启动
> 
> 说明：显示欢迎页面、登录按钮、功能介绍

---

## 步骤 2：登录

### 登录方式

YAT 支持以下登录方式：

1. **GitHub 登录**（推荐）
2. **Google 登录**
3. **邮箱注册**（即将支持）

### 登录流程

1. 点击 **登录** 按钮
2. 选择登录方式
3. 授权 YAT 访问您的账户
4. 完成登录

> ![Tunnel snapshot](/images/guide/snapshot-login.png) 登录页面
> 
> 说明：显示 GitHub/Google 登录按钮

### 登录后

登录成功后，您将进入主界面，可以看到：

- 📊 **Dashboard** - 概览统计
- 🔌 **Tunnels** - 隧道管理
- 🖥️ **Edges** - Edge 服务器管理
- 🧩 **Apps** - 应用与扩展
- ⚙️ **Settings** - 设置

---

## 步骤 3：订阅 Edge 服务器

Edge 服务器是 YAT 网络的中转节点。对于新用户，我们建议先订阅共享的 Edge 服务器。

### 订阅共享 Edge

1. 点击左侧导航栏的 **Edges**
2. 切换到 **市场** 标签
3. 选择一个可用的 Edge 服务器
4. 点击 **订阅** 按钮

> 📸 ![Tunnel snapshot](/images/guide/snapshot-edge-market.png) Edge 市场页面
> 
> 说明：显示可订阅的 Edge 列表、订阅按钮

### 验证订阅

订阅成功后，Edge 会出现在 **我的** 标签中，状态显示为 **在线**。

---

## 步骤 4：创建第一个隧道

现在让我们创建一个 HTTP 隧道，将本地服务暴露到公网。

### 准备本地服务

如果您还没有本地服务，可以快速启动一个：

```bash
# 使用 Python 启动简单 HTTP 服务器
python3 -m http.server 8080

# 或使用 Node.js
npx http-server -p 8080
```

访问 `http://localhost:8080` 确认服务正常运行。

### 创建隧道

1. 点击左侧导航栏的 **Tunnels**
2. 点击 **创建隧道** 按钮
3. 选择 **HTTP 代理** 应用
4. 选择已订阅的 Edge 服务器
5. 填写配置：
   - **隧道名称**: 我的测试服务
   - **本地端口**: 8080
   - **共享设置**: 独占（推荐）
6. 点击 **创建**

> ![Tunnel snapshot](/images/guide/snapshot-tunnel-create-01.png) 创建隧道对话框
> ![Tunnel snapshot](/images/guide/snapshot-tunnel-create-02.png)
> ![Tunnel snapshot](/images/guide/snapshot-tunnel-create-03.png)
> 说明：显示应用选择、Edge 选择、配置表单

### 创建成功

创建成功后，隧道会出现在隧道列表中，状态为 **未启动**。

---

## 步骤 5：启动隧道

1. 找到刚创建的隧道卡片
2. 点击 **启动** 按钮
3. 等待状态变为 **运行中**

> ![Tunnel snapshot](/images/guide/snapshot-tunnel-status-01.png) 隧道启动过程
> 
> 说明：显示启动按钮、状态变化、加载动画

### 启动成功

启动成功后，隧道卡片会显示：

- ✅ 状态：**运行中**（绿色）
- 🌐 远程地址：`https://xxx.myroxy.dev`
- 📊 流量统计

---

## 步骤 6：访问远程服务

### 获取远程地址

在隧道卡片上，找到 **远程地址** 区域：

```
https://abc123-def456.myroxy.dev
```

### 测试访问

1. 复制远程地址
2. 在浏览器中打开
3. 您应该看到与 `http://localhost:8080` 相同的内容

> 📸 ![Tunnel snapshot](/images/guide/snapshot-tunnel-status-02.png)  浏览器访问远程地址
> 
> 说明：显示通过 YAT 隧道访问的网页

### 🎉 恭喜！

您已成功创建并启动了第一个 YAT 隧道！

---

## 🎯 5 分钟体验清单

- [x] 安装 YAT 客户端
- [x] 注册与登录
- [x] 订阅 Edge 服务器
- [x] 创建 HTTP 隧道
- [x] 启动隧道
- [x] 访问远程服务

---

## 🚀 下一步

现在您已经体验了 YAT 的基本功能，可以探索更多高级功能：

### 推荐学习路径

1. **[隧道管理](./tunnel-management.md)** - 学习创建 TCP/UDP 隧道、隧道共享等
2. **[Edge 服务器管理](./edge-management.md)** - 部署自己的 Edge 服务器
3. **[应用与扩展](./apps-and-extensions.md)** - 使用 ARD 远程桌面

### 常用操作速查

| 操作 | 位置 | 说明 |
|------|------|------|
| 创建隧道 | Tunnels > 创建隧道 | 选择应用和 Edge |
| 启动/停止 | 隧道卡片 > 按钮 | 控制隧道状态 |
| 查看详情 | 隧道卡片 > 查看详情 | 查看通道、域名等 |
| 删除隧道 | 隧道卡片 > 删除 | 永久删除隧道 |
| 订阅 Edge | Edges > 市场 > 订阅 | 订阅共享 Edge |
| 部署 Edge | Edges > 创建 | 部署自己的 Edge |

---

## 💡 常见问题

### Q: 创建隧道时提示"没有可用的 Edge"

**原因**: 您还没有订阅任何 Edge 服务器。

**解决**: 前往 Edges > 市场，订阅一个共享 Edge。

### Q: 隧道启动失败

**可能原因**:
1. Edge 服务器离线
2. 本地端口被占用
3. 网络连接问题

**解决**: 
1. 检查 Edge 状态（应为在线）
2. 确认本地端口可访问
3. 查看错误提示，或参考 [常见问题](./faq.md)

### Q: 远程地址无法访问

**检查清单**:
- [ ] 隧道状态是否为"运行中"
- [ ] 本地服务是否正常运行
- [ ] 浏览器是否提示证书错误（忽略并继续）
- [ ] Edge 服务器是否在线

---

## 📚 相关文档

- [YAT 是什么](./what-is-yat.md) - 了解 YAT 的核心功能
- [隧道管理](./tunnel-management.md) - 深入学习隧道管理
- [Edge 服务器管理](./edge-management.md) - 部署和管理 Edge
- [常见问题](./faq.md) - 解决常见问题

---

*YAT Team - 让内网穿透更简单*
