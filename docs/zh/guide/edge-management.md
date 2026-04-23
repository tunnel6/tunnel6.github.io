# Edge 服务器管理

> 学习如何部署、管理和订阅 Edge 服务器

---

## 📋 目录

- [什么是 Edge 服务器](#什么是-edge-服务器)
- [Edge 服务器架构](#edge-服务器架构)
- [部署 Edge 服务器](#部署-edge-服务器)
- [管理 Edge 服务器](#管理-edge-服务器)
- [订阅共享 Edge](#订阅共享-edge)
- [Edge 市场](#edge-市场)
- [域名与健康检查](#域名与健康检查)
- [常见问题](#常见问题)

---

## 什么是 Edge 服务器

### 核心作用

Edge 服务器是 YAT 网络的**核心节点**，负责：

- 🔄 **流量转发** - 中转客户端与服务器的流量
- 🔐 **mTLS 认证** - 双向 TLS 验证
- 📊 **状态同步** - 实时同步隧道状态
- 🌐 **域名管理** - 分配和管理隧道域名

### 为什么需要 Edge？

```
传统方案（需要公网 IP + 端口转发）:
  外网用户 → 路由器配置 → 内网服务

YAT 方案（无需配置）:
  外网用户 → Edge 服务器 → 内网服务
```

**优势**：
- ✅ 无需公网 IP
- ✅ 无需配置路由器
- ✅ 自动加密
- ✅ 全球部署

### Edge 类型

| 类型 | 说明 | 适用场景 |
|------|------|---------|
| **自建 Edge** | 您自己部署的 Edge | 生产环境、私有化部署 |
| **共享 Edge** | 其他人共享的 Edge | 测试、个人使用 |

---

## Edge 服务器架构

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
└── 二进制文件 (yat-edge)
```

### 启动流程

```
1. Bootstrap - 初始化配置
2. RegisterNode - 向 Captain 注册
3. Subscribe - 订阅控制流
4. Heartbeat - 心跳保活
```

---

## 部署 Edge 服务器

### 前置要求

- ✅ 公网 VPS（Ubuntu 18.04+ / CentOS 7+ Linux kernal 5.6+）
- ✅ 公网 IP 地址
- ✅ 域名（可选，用于自定义域名）

### 方式一：使用 YAT 客户端部署（推荐）

#### 步骤 1：打开部署对话框

1. 点击 **Edges** > **创建**
2. 填写 Edge 信息：
   - **Edge 名称** - 自定义名称
   - **节点类型** - 私有还是共享

> 📸 ![Edge snapshot](/images/guide/snapshot-edge-deploy.png) Edge 部署对话框

> 📸 ![Edge snapshot](/images/guide/snapshot-edge-deployscript.png) 获取部署脚本

#### 步骤 2：手动部署
1. 登陆到公网服务器
2. 执行部署脚本
> 📸 ![Edge snapshot](/images/guide/snapshot-edge-deploy-run.png) Edge 部署对话框

#### 步骤 4：验证部署

部署成功后：
- ✅ Edge 出现在"我的 Edge"列表
- ✅ 状态显示为 **在线**
- ✅ 显示公网 IP 和域名

### 方式二：手动部署

#### 步骤 1：下载 Edge

```bash
# 下载最新版本
wget https://github.com/yat/releases/latest/download/yat-edge-linux-amd64

# 添加执行权限
chmod +x yat-edge-linux-amd64
```

#### 步骤 2：获取部署脚本（同上）

#### 步骤 3：启动 Edge

```bash
# 前台启动（测试）
./yat-edge-linux-amd64 server start

# 后台启动（生产）
nohup ./yat-edge-linux-amd64 start --config config.yaml > edge.log 2>&1 &
```

#### 步骤 5：配置 systemd（可选）

```ini
# /etc/systemd/system/yat-edge.service
[Unit]
Description=YAT Edge Server
After=network.target

[Service]
Type=simple
ExecStart=/opt/yat/yat-edge-linux-amd64 server start 
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
# 启用并启动服务
sudo systemctl daemon-reload
sudo systemctl enable yat-edge
sudo systemctl start yat-edge

# 查看状态
sudo systemctl status yat-edge
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
> 
> 说明：显示详细信息、域名健康、服务状态

#### 管理配置

点击 **管理** 按钮（仅自建 Edge）：

- 修改名称
- 修改描述
- 重启 Edge
- 查看部署命令

> 📸 **[截图位置]** Edge 管理对话框
> 
> 说明：显示配置表单、操作按钮

#### 删除 Edge

点击 **删除** 按钮：

> ⚠️ **警告**：
> - 删除 Edge 会清理所有相关隧道
> - 证书会被撤销
> - 域名会被释放

### 监控 Edge 状态

#### 在线状态

- 🟢 **在线** - Edge 正常运行
- 🔴 **离线** - Edge 无法连接
- 🟡 **异常** - 部分服务异常

#### 域名健康

Edge 域名健康状态：

| 状态 | 说明 | 操作 |
|------|------|------|
| **正常** | DNS 和证书都正常 | 无需操作 |
| **DNS 异常** | DNS 记录有问题 | 检查 DNS 配置 |
| **证书异常** | 证书过期或无效 | 重新生成证书 |
| **未知** | 无法检测 | 检查 Edge 连接 |

---

## 订阅共享 Edge

### 什么是共享 Edge？

其他用户可以将自己的 Edge 共享给同一账号的其他设备使用。

### 订阅流程

#### 步骤 1：浏览 Edge 市场

1. 点击 **Edges** > **市场**
2. 查看可订阅的 Edge 列表

> 📸 ![Edge snapshot](/images/guide/snapshot-edge-market.png) Edge 市场
> 
> 说明：显示可订阅的 Edge、订阅按钮、所有者信息

#### 步骤 2：订阅 Edge

1. 选择合适的 Edge
2. 点击 **订阅** 按钮
3. 确认订阅

#### 步骤 3：使用 Edge

订阅成功后：
- ✅ Edge 出现在"我的 Edge"列表
- ✅ 可以创建隧道
- ✅ 可以查看状态

### 取消订阅

1. 在"我的 Edge"列表中找到 Edge
2. 点击 **取消订阅**
3. 确认取消

> ⚠️ **注意**：
> - 取消订阅后，该 Edge 上的隧道会停止
> - 需要重新订阅才能恢复

---

## Edge 市场

### 市场功能

Edge 市场是共享 Edge 的交易平台：

- 📦 **发布 Edge** - 将您的 Edge 共享给他人
- 🔍 **浏览 Edge** - 查找可用的 Edge
- ⭐ **评分系统** - 查看其他用户的评价（开发中）
- 📊 **统计信息** - 查看 Edge 的性能指标

### 发布 Edge（开发中）

目前 Edge 共享功能正在开发中，即将支持：

- 设置共享权限
- 配置使用限制
- 查看使用统计

---

## 域名与健康检查

### 系统分配域名

每个 Edge 会自动分配域名：

```
格式: {edge-id}.edge.myroxy.dev
示例: abc123.edge.myroxy.dev
```

### 自定义域名

您可以为 Edge 配置自定义域名：

#### 步骤 1：添加域名

在 Edge 管理中添加自定义域名：
- `edge.example.com`

#### 步骤 2：配置 DNS

添加 CNAME 记录：

```
类型: CNAME
名称: edge
值: abc123.edge.myroxy.dev
TTL: 300
```

> 📸 **[截图位置]** DNS 配置提示
> 
> 说明：显示 DNS 记录类型、名称、值、复制按钮

#### 步骤 3：验证 DNS

YAT 会自动验证 DNS 配置：

- ✅ **验证通过** - 域名可用
- ❌ **验证失败** - 检查 DNS 记录

#### 步骤 4：自动证书

验证通过后，YAT 会自动：
1. 申请 Let's Encrypt 证书
2. 配置 TLS
3. 启用 HTTPS

### 健康检查

YAT 定期检查 Edge 域名健康：

**检查项**：
- DNS 解析
- 证书有效性
- HTTPS 连接
- 响应时间

**检查频率**：每 5 分钟

---

## 常见问题

### Q: Edge 显示离线怎么办？

**检查清单**：
1. 服务器是否正常运行
2. 防火墙是否开放 443 端口
3. Edge 进程是否运行
4. 网络连接是否正常

**解决步骤**：

```bash
# 1. 检查 Edge 进程
ps aux | grep yat-edge

# 2. 检查端口
netstat -tlnp | grep 443

# 3. 查看日志
journalctl -u yat-edge -n 100

# 4. 重启服务
sudo systemctl restart yat-edge
```

### Q: 如何查看 Edge 日志？

```bash
# systemd 方式
sudo journalctl -u yat-edge -f

# 直接查看日志文件
tail -f /var/log/yat-edge.log
```

### Q: Edge 可以更换 IP 吗？

可以，但需要：
1. 更新 DNS 记录
2. 重新生成证书
3. 重启 Edge

### Q: 一个账号可以创建多少个 Edge？

目前没有限制，但建议：
- 个人用户：1-3 个 Edge
- 团队用户：5-10 个 Edge

### Q: Edge 服务器的性能要求？

**最低配置**：
- CPU: 1 核
- 内存: 512MB
- 带宽: 1Mbps
- 存储: 1GB

**推荐配置**：
- CPU: 2 核
- 内存: 1GB
- 带宽: 10Mbps
- 存储: 5GB

### Q: Edge 支持哪些操作系统？

- ✅ Ubuntu 18.04+
- ✅ CentOS 7+
- ✅ Debian 9+
- ✅ macOS（开发测试）
- ❌ Windows（暂不支持）

---

## 💡 最佳实践

### 1. 选择服务器位置

选择离您和目标用户最近的服务器：

- 中国用户：香港、日本、新加坡
- 欧美用户：法兰克福、美西
- 全球用户：多区域部署

### 2. 安全加固

```bash
# 禁用密码登录，仅使用密钥
sudo vim /etc/ssh/sshd_config
PasswordAuthentication no

# 配置防火墙
sudo ufw allow 443/tcp
sudo ufw allow 80/tcp
sudo ufw enable

# 定期更新系统
sudo apt update && sudo apt upgrade
```

### 3. 监控与告警

```bash
# 安装监控工具
sudo apt install htop iotop nethogs

# 设置日志轮转
sudo vim /etc/logrotate.d/yat-edge
/var/log/yat-edge.log {
    daily
    rotate 7
    compress
    missingok
}
```

### 4. 备份配置

```bash
# 备份证书和配置
tar czf edge-backup-$(date +%Y%m%d).tar.gz \
  config.yaml certs/ data/

# 定期备份（cron）
0 2 * * * /opt/yat/backup.sh
```

---

## 📚 相关文档

- [快速开始](./quick-start.md) - 订阅第一个 Edge
- [隧道管理](./tunnel-management.md) - 在 Edge 上创建隧道
- [自定义域名](./custom-domains.md) - 配置 Edge 域名
- [常见问题](./faq.md) - 解决 Edge 相关问题

---

*YAT Team - 让内网穿透更简单*
