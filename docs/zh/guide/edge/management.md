# Edge 服务器管理

> 了解 Edge 服务器的概念、架构和日常管理

---

## 什么是 Edge 服务器

Edge 服务器是 YAT 网络的**核心节点**，负责：

- 🔄 **流量转发** — 中转客户端与服务器的流量
- 🔐 **mTLS 认证** — 双向 TLS 验证
- 📊 **状态同步** — 实时同步隧道状态
- 🌐 **域名管理** — 分配和管理隧道域名

### 为什么需要 Edge？

```
传统方案（需要公网 IP + 端口转发）:
  外网用户 → 路由器配置 → 内网服务

YAT 方案（无需配置）:
  外网用户 → Edge 服务器 → 内网服务
```

**优势**：无需公网 IP、无需配置路由器、自动加密、全球部署

### Edge 类型

| 类型 | 说明 | 适用场景 |
|------|------|---------|
| **自建 Edge** | 您自己部署的 Edge | 生产环境、私有化部署 |
| **共享 Edge** | 其他人共享的 Edge | 测试、个人使用 |

---

## 架构与启动流程

### 组件结构

```
Edge 服务器
├── 配置文件 (config.yaml)
├── 证书目录 (certs/)
│   ├── root-ca.crt         # 根证书
│   ├── edge-sub-ca.crt     # Edge 子 CA
│   ├── edge-tls.crt        # TLS 证书
│   └── edge-tls.key        # TLS 私钥
├── 数据库
│   ├── channels.db         # 通道状态
│   └── wireguard.db        # WireGuard 配置
└── 二进制文件 (edge)
```

### 启动流程

```
1. Bootstrap - 初始化配置
2. RegisterNode - 向 Captain 注册
3. Subscribe - 订阅控制流
4. Heartbeat - 心跳保活
```

---

## 管理 Edge 服务器

### 查看 Edge 列表

点击 **Edges**，切换到 **我的** 标签：

> 📸 ![Edge snapshot](/images/guide/snapshot-edge-manage.png) Edge 列表页面
> 
> 说明：显示 Edge 卡片、状态、操作按钮

### Edge 卡片信息

每个 Edge 卡片显示：

- **名称** - Edge 名称
- **状态** - 在线/离线（带图标）
- **公网 IP** - Edge 的公网地址
- **域名** - 系统分配的域名
- **隧道数量** - 该 Edge 上的隧道数
- **服务状态** - 各项服务运行状态

### Edge 操作

#### 查看详情

点击 **详情** 按钮，查看：

- 基本信息
- 网络信息（IP、域名）
- 域名健康状态
- 服务运行状态
- 隧道列表

> 📸 ![Edge snapshot](/images/guide/snapshot-edge-manage.png) Edge 详情页面

#### 管理配置

点击 **管理** 按钮（仅自建 Edge）：

- 修改名称
- 修改描述
- 重启 Edge
- 查看部署命令

#### 删除 Edge

点击 **删除** 按钮：

> ⚠️ **警告**：
> - 删除 Edge 会清理所有相关隧道
> - 证书会被撤销
> - 域名会被释放

### 监控 Edge 状态

- 🟢 **在线** - Edge 正常运行
- 🔴 **离线** - Edge 无法连接
- 🟡 **异常** - 部分服务异常

---

## 域名与健康检查

### 系统分配域名

每个 Edge 自动分配域名：

```
格式: {edge-id}.edge.myroxy.dev
示例: abc123.edge.myroxy.dev
```

### 自定义域名

您可以为 Edge 配置自定义域名：

1. 在 Edge 管理中添加自定义域名（如 `edge.example.com`）
2. 添加 CNAME 记录指向系统分配域名
3. YAT 自动验证 DNS 配置
4. 验证通过后自动申请 Let's Encrypt 证书

### 健康检查

YAT 每 5 分钟定期检查 Edge 域名健康：

| 状态 | 说明 | 操作 |
|------|------|------|
| **正常** | DNS 和证书都正常 | 无需操作 |
| **DNS 异常** | DNS 记录有问题 | 检查 DNS 配置 |
| **证书异常** | 证书过期或无效 | 重新生成证书 |
| **未知** | 无法检测 | 检查 Edge 连接 |

---

## 📚 相关文档

- [部署 Edge 服务器](./deploy.md) — 快速部署 Edge 节点
- [WireGuard 配置](./wireguard.md) — 启用 WireGuard 组网功能
- [配置参数参考](./config-reference.md) — config.yaml 完整配置项
- [CLI 命令参考](./cli-reference.md) — 命令行工具参考
- [常见问题](./faq.md) — Edge 部署和运行常见问题
- [自定义域名](./custom-domains.md) — 域名配置详解
- [WireGuard 组网](./wireguard-networking.md) — 构建虚拟局域网

---

*YAT Team - 让内网穿透更简单*
