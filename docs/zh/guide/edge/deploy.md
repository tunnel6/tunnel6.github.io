# 部署 Edge 服务器

> 在公网服务器上部署 YAT Edge 节点

---

## 📋 前置要求

- ✅ 公网 VPS（Ubuntu 18.04+ / CentOS 7+ Linux kernel 5.6+）
- ✅ 公网 IP 地址
- ✅ 域名（可选，用于自定义域名）

---

## 方式一：使用 YAT 客户端部署（推荐）

### 步骤 1：打开部署对话框

1. 点击 **Edges** > **创建**
2. 填写 Edge 信息：
   - **Edge 名称** - 自定义名称
   - **节点类型** - 私有还是共享

> 📸 ![Edge snapshot](/images/guide/snapshot-edge-deploy.png) Edge 部署对话框

> 📸 ![Edge snapshot](/images/guide/snapshot-edge-deployscript.png) 获取部署脚本

### 步骤 2：手动部署

1. 登录到公网服务器
2. 执行部署脚本

> 📸 ![Edge snapshot](/images/guide/snapshot-edge-deploy-run.png) 执行部署脚本

### 步骤 3：验证部署

部署成功后：
- ✅ Edge 出现在"我的 Edge"列表
- ✅ 状态显示为 **在线**
- ✅ 显示公网 IP 和域名

---

## 方式二：手动部署

### 步骤 1：下载 Edge

```bash
# 下载最新版本
curl https://download.tunnel6.com/download/edge/releases/v1.1.0-rc3/edge-linux-amd64 -o /usr/local/bin/edge

# 添加执行权限
chmod +x /usr/local/bin/edge
```

### 步骤 2：获取部署脚本

在 YAT 客户端中创建 Edge 后，获取对应的部署脚本（包含认证 token）。

### 步骤 3：启动 Edge

```bash
# 前台启动（测试）
edge server start

# 后台启动（生产）
nohup edge server start --daemon > edge.log 2>&1 &
```

### 步骤 4：配置 systemd（可选）

```ini
# /etc/systemd/system/edge.service
[Unit]
Description=YAT Edge Server
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/edge server start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
# 启用并启动服务
sudo systemctl daemon-reload
sudo systemctl enable edge
sudo systemctl start edge

# 查看状态
sudo systemctl status edge
```

---

## 下一步

- [管理 Edge 服务器](./management.md#管理-edge-服务器) — 查看状态、配置域名
- [配置参数参考](./config-reference.md) — 自定义 Edge 配置
- [CLI 命令参考](./cli-reference.md) — 命令行工具使用
- [WireGuard 配置](./wireguard.md) — 启用 WireGuard 组网功能

---

*YAT Team - 让内网穿透更简单*
