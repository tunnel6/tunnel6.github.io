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
- [启用 WireGuard 功能](#启用-wireguard-功能)
- [启动参数参考](#启动参数参考)
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
curl https://download.tunnel6.com/download/edge/releases/v1.1.0-rc3/edge-linux-amd64 -o /usr/local/bin/edge

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

## 启用 WireGuard 功能

Edge 服务器支持 WireGuard 组网功能，可以作为中继节点为网络成员提供流量转发。启用后，Edge 会自动创建 WireGuard 接口、管理 peer 并处理转发。

> 📖 详细的组网使用指南请参考 [WireGuard 组网指南](./wireguard-networking.md#自维护-edge-配置)

### 系统要求

| 项目 | 要求 | 说明 |
|------|------|------|
| **操作系统** | Linux | 仅 Linux 支持 WireGuard 中继 |
| **内核版本** | 5.6+（kernel 策略）/ 5.8+（ebpf 策略，实验性） | WireGuard 内核模块 + nftables / eBPF |
| **权限** | root | 需要创建网络接口和设置内核参数 |

检查内核版本：

```bash
uname -r
# 输出示例：5.15.0-91-generic → 满足 5.6+ 和 5.8+ 要求
```

### 内核配置一览

Edge 启动时会**自动检测并设置**以下内核参数和模块，通常无需手动干预：

#### 内核模块

| 模块 | 用途 | 检查方式 |
|------|------|----------|
| `wireguard` | WireGuard 接口创建（Linux 5.6+ 内置） | `lsmod \| grep wireguard` |
| `nf_tables` | nftables 防火墙规则（kernel 策略依赖） | `nft list tables` |

#### Sysctl 参数

| 参数 | 值 | 用途 | 设置方式 |
|------|------|------|----------|
| `net.ipv4.ip_forward` | `1` | 启用 IP 转发，peer 间 relay 前提 | Edge 自动设置 |
| `net.ipv4.conf.all.rp_filter` | `0` | 禁用全局反向路径过滤 | Edge 自动设置 |
| `net.ipv4.conf/<wg-iface>/rp_filter` | `0` | 禁用 WG 接口反向路径过滤 | Edge 自动设置 |

::: warning 注意
`rp_filter` 的实际生效值为 `max(all/rp_filter, <if>/rp_filter)`，两者都必须为 0。Edge 已自动处理，但如果手动设置过 `all/rp_filter`，请确认已恢复为 0。
:::

#### 内核功能依赖（按转发策略）

| 功能 | kernel 策略（默认） | ebpf 策略 |
|------|---------------------|------------|
| WireGuard 模块 | ✅ 必须 | ✅ 必须 |
| nftables | ✅ 必须 | ❌ 不需要 |
| netlink (rtnetlink) | ✅ 必须 | ✅ 必须 |
| TC + BPF (cls_bpf) | ✅ 必须（peer 流量统计） | ❌ 不需要 |
| eBPF + `bpf_redirect_peer` | ❌ 不需要 | ✅ 必须（Linux 5.8+，实验性） |
| `ip_forward` | ✅ 必须 | ❌ 不需要（绕过内核转发） |

### 配置参数

#### YAML 配置（config.yaml）

```yaml
proxy:
  wireguard:
    enabled: true                    # 启用 WireGuard 功能
    relay_enabled: true              # 启用 relay 中继
    public_endpoint: "edge.example.com"  # Edge 公网地址（不含端口）
    listen_port_base: 58021          # WG 接口监听端口起始值
    forwarder_strategy: "kernel"     # 转发策略：kernel（默认）| ebpf（实验性，需 Linux 5.8+）
```

#### 启动参数（CLI 标志）

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--channel.wireguard.enable` | `true` | 启用 WireGuard 功能 |
| `--channel.wireguard.relay_enabled` | `false` | 启用 Edge 侧 relay 中继 |
| `--channel.wireguard.public_endpoint` | 同 `--public` | WireGuard relay 公网地址 |

::: warning 注意
CLI 标志优先级高于 YAML 配置和缓存的启动配置。如果通过 CLI 设置了参数，会覆盖配置文件中的值。
:::

### 防火墙与端口

Edge WireGuard 需要放行以下 UDP 端口：

| 端口范围 | 用途 | 说明 |
|----------|------|------|
| `58021+` | WG 接口监听端口 | 每个网络占用一个端口 |

::: tip 说明
Edge relay 使用 kernel forwarder 在同 WG 接口内转发 peer 间流量，
无需额外的 per-peer relay 端口。只需放行 WG 接口端口即可。
:::

```bash
# UFW 方式
sudo ufw allow 58021:58100/udp   # WG 接口端口

# iptables 方式
sudo iptables -A INPUT -p udp --dport 58021:58100 -j ACCEPT
```

### 自动管理的内核参数与 nftables 规则

Edge kernel forwarder 启动时会**自动**完成以下配置，无需手动干预：

**内核参数**：
- `net.ipv4.ip_forward = 1` — 启用 IP 转发
- `net.ipv4.conf/<wg-iface>/rp_filter = 0` — 禁用反向路径过滤

**nftables 规则**（表名 `yat_relay`）：

```nft
table ip yat_relay {
    chain forward {
        type filter hook forward priority mangle; policy accept;
        iifname "wg-yat0-xxx" oifname "wg-yat0-xxx" ip daddr <cidr> accept  /* yat-relay:wg-yat0-xxx */
    }
}
```

::: tip 说明
nftables 规则仅包含一条 FORWARD ACCEPT 规则，优先级为 mangle（-150），
早于 iptables-nft 的 filter 链（priority 0）执行，确保同接口转发流量被接受。
每条规则带有 `/* yat-relay:<ifName> */` 注释，便于识别和清理。
:::

### 部署验证

```bash
# 1. 检查 Edge 日志
journalctl -u yat-edge -f | grep -i wireguard
# 期望看到：
# "WireGuard functionality enabled"
# "kernel forwarder started: iface=wg-yat0-xxx"

# 2. 检查 WireGuard 接口
sudo ip link show | grep wg-yat
# 期望看到：wg-yat0-xxx: <POINTOPOINT,NOARP,UP,LOWER_UP> mtu 1420

# 3. 检查 nftables 规则
sudo nft list table ip yat_relay
# 期望看到 forward 链，规则带 /* yat-relay:wg-yat0-xxx */ 注释

# 4. 检查内核参数
cat /proc/sys/net/ipv4/ip_forward   # 应为 1
```

### 异常处理

#### IP 转发未启用

**现象**：peer 间无法通信，nft counter 为 0

**原因**：Edge 虽然会自动设置 `ip_forward`，但某些环境下（如容器权限不足）写入可能失败

```bash
# 手动启用 IP 转发
sudo sysctl -w net.ipv4.ip_forward=1

# 持久化
echo 'net.ipv4.ip_forward=1' | sudo tee -a /etc/sysctl.conf
```

#### Docker 主机 iptables 干扰

**现象**：nftables 规则已安装，nft counter 有计数，但 peer 间转发仍然失败

**背景**：Edge 的 nftables 规则在 FORWARD hook priority mangle (-150) 处 ACCEPT，
正常情况下会**终止整个 hook 评估**，后续 iptables-nft 的 filter 链（priority 0）
包括 Docker 的 `DOCKER-USER` 链不会执行。但如果系统使用 **iptables-legacy**
（基于 x_tables，与 nftables 是完全独立的内核路径），nftables ACCEPT 无法阻止
legacy 规则对包的拦截。

**排查步骤**：

```bash
# 1. 确认 iptables 后端：nft 还是 legacy
sudo iptables -V
# 输出含 "nf_tables"  → iptables-nft（nftables ACCEPT 可生效）
# 输出含 "legacy"      → iptables-legacy（需要额外处理）

# 2. 检查 DOCKER-USER 链策略和规则
sudo iptables -L DOCKER-USER -v -n
# 关注：Policy 是否为 DROP？是否有针对 wg-yat0 的 DROP 规则？

# 3. 检查 FORWARD 链中是否有 DROP 规则命中
sudo iptables -L FORWARD -v -n | grep -E 'DROP|REJECT|wg-yat'

# 4. 检查 nftables 规则是否命中（counter 是否增长）
sudo nft list table ip yat_relay
# 如果 packets 持续增长说明 nftables 层已 ACCEPT

# 5. 如果 nft counter 增长但包仍被丢弃，说明被 iptables-legacy 拦截
#    用 pkttracker 确认：
sudo iptables -A FORWARD -i wg-yat0-xxx -o wg-yat0-xxx -d <cidr> -j LOG --log-prefix "YAT-FWD: "
# 然后 ping 测试，查看 dmesg | grep YAT-FWD
```

**解决方案**：

```bash
# 方案 A：在 DOCKER-USER 中添加 ACCEPT（适用于 iptables-nft 和 iptables-legacy）
sudo iptables -I DOCKER-USER -i wg-yat0-xxx -o wg-yat0-xxx -d <cidr> -j ACCEPT
# 注意：DOCKER-USER 链在 Docker 重启后会重建，需要持久化

# 方案 B：切换到 iptables-nft（推荐）
sudo update-alternatives --set iptables /usr/sbin/iptables-nft
sudo update-alternatives --set ip6tables /usr/sbin/ip6tables-nft
# 切换后 Docker 和 nftables 共享同一内核路径，nftables ACCEPT 即可生效

# 方案 C：配置 Docker 不操作 iptables
# 在 /etc/docker/daemon.json 中添加：
# { "iptables": false }
# 然后重启 Docker：sudo systemctl restart docker
# 注意：这会禁用 Docker 的所有 iptables 规则管理，容器端口映射需要手动配置
```

#### 内核版本不支持 WireGuard

**现象**：Edge 启动失败，提示 "WireGuard initialization failed"

```bash
# 检查内核版本
uname -r

# 如果 < 5.6，升级内核
sudo apt install linux-image-generic
sudo reboot
```

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

## 启动参数参考

`edge server start` 完整参数列表。标注“部署覆盖”的参数会覆盖 YAML 配置和缓存的启动配置。

### 进程与路径

| 参数 | 缩写 | 默认值 | 说明 |
|------|------|--------|------|
| `--config` | `-c` | `~/.yat/config.yml` | 配置文件路径 |
| `--daemon` | `-d` | `false` | 后台守护进程模式运行 |
| `--pid-file` | | `~/.edge/RUNNING` | PID 文件路径 |
| `--sock-file` | | `~/.edge/.edge.sock` | IPC socket 文件路径 |

### 核心网络

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--public` | 空 | 公网 IP 或域名（不含端口） |
| `--domain` | 空 | 自定义域名（用于 HTTP 通道） |
| `--controller.address` | 空 | Controller 服务器地址 |
| `--channel.alias_domain_policy` | 空 | 别名域名策略：`disabled` \| `optional` \| `required` |
| `--tunnel.listen` | 空 | 隧道监听地址 |
| `--tunnel.max_sessions` | `0` | 最大会话数（0=无限制） |

### TLS 证书

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--tunnel.tls.ca` | 空 | TLS CA 证书路径 |
| `--tunnel.tls.cert` | 空 | TLS 服务端证书路径 |
| `--tunnel.tls.key` | 空 | TLS 服务端私钥路径 |

### HTTP 通道

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--channel.http.enable` | `true` | 启用 HTTP 通道/代理 |
| `--channel.http.port` | `0` | HTTP 代理端口 |
| `--channel.https.port` | `0` | HTTPS 代理端口 |
| `--channel.http.addr` | 空 | HTTP 代理监听地址 |
| `--channel.http.timeout` | `0` | HTTP 代理请求超时 |
| `--channel.http.buffer` | 空 | HTTP 通道读缓冲区大小（支持 K/M 后缀） |
| `--channel.http.buffer.lock` | `false` | 锁定缓冲区为固定大小，禁用动态窗口 |
| `--channel.http.eager_start` | `false` | 启动时立即启动 HTTP 代理 |

### TCP / UDP 通道

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--channel.tcp.enable` | `true` | 启用 TCP 通道 |
| `--channel.tcp.port_min` | `0` | TCP 端口范围起始 |
| `--channel.tcp.port_max` | `0` | TCP 端口范围结束 |
| `--channel.udp.enable` | `true` | 启用 UDP 通道 |
| `--channel.udp.port_min` | `0` | UDP 端口范围起始 |
| `--channel.udp.port_max` | `0` | UDP 端口范围结束 |

### WireGuard

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--channel.wireguard.enable` | `true` | 启用 WireGuard 功能 |
| `--channel.wireguard.relay_enabled` | `false` | 启用 Edge 侧 relay 中继 |
| `--channel.wireguard.public_endpoint` | 同 `--public` | WireGuard relay 公网地址（不含端口） |

### P2P

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--server.capabilities.auto_enable` | `true` | 根据客户端能力自动启用服务 |
| `--server.capabilities.p2p` | `true` | 启用 P2P 能力 |
| `--channel.p2p.udp_addr` | 空 | P2P UDP 监听地址，如 `0.0.0.0:9000` |

### 隧道限制

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--tunnel.limits.max_per_session` | `0` | 每个用户会话最大隧道数（0=无限制） |
| `--tunnel.limits.max_total` | `0` | Edge 最大隧道总数（0=无限制） |

### CSR 证书转发

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--csr.forwarder.enable` | `true` | 启用 CSR 转发器 |
| `--csr.forwarder.subca_serial` | 空 | CSR 转发子 CA 序列号 |

### 日志

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--log.output` | `console` | 日志输出模式：`console` \| `file` |
| `--log.file` | 空 | 日志文件路径（`log.output=file` 时生效） |
| `--log.level` | 空 | 日志级别：`debug` \| `info` \| `warn` \| `error` \| `fatal` \| `panic` |

### 启动配置注入

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--startup.config_b64` | 空 | 启动配置（Base64 编码 JSON），由 Captain 下发 |
| `--startup.config_json` | 空 | 启动配置（原始 JSON） |

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
- [WireGuard 组网](./wireguard-networking.md) - 使用 WireGuard 构建虚拟局域网
- [自定义域名](./custom-domains.md) - 配置 Edge 域名
- [常见问题](./faq.md) - 解决 Edge 相关问题

---

*YAT Team - 让内网穿透更简单*
