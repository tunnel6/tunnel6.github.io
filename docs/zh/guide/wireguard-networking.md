# WireGuard 组网指南

> 使用 WireGuard 构建虚拟局域网，实现设备间安全互联

---

## 📋 目录

- [什么是 WireGuard 组网](#什么是-wireguard-组网)
- [快速开始](#快速开始)
- [进阶优化](#进阶优化)
- [自维护 Edge 配置](#自维护-edge-配置)
- [常见问题排查](#常见问题排查)
- [平台特定指南](#平台特定指南)

---

## 什么是 WireGuard 组网

### 核心概念

WireGuard 组网是 YAT 的高级网络功能，使用 WireGuard 协议在多台设备间建立虚拟局域网（VPN）。与传统的隧道模式不同，WireGuard 组网提供：

- 🌐 **虚拟局域网** - 所有成员共享同一 IP 网段
- 🔐 **端到端加密** - WireGuard 内核级加密
- 🚀 **高性能** - 接近原生的网络性能
- 🔄 **智能路由** - 自动选择直连或中继路径

### 工作原理

```
┌─────────────────────────────────────────────────────┐
│                  WireGuard 网络                      │
│                                                     │
│  ┌──────────┐         ┌──────────┐                 │
│  │ 设备 A   │◄───────►│ 设备 B   │                 │
│  │ 10.0.0.2 │  直连   │ 10.0.0.3 │                 │
│  └──────────┘  或中继  └──────────┘                 │
│       │                        │                    │
│       │                        │                    │
│       ▼                        ▼                    │
│  ┌──────────┐         ┌──────────┐                 │
│  │ 设备 C   │◄───────►│ 设备 D   │                 │
│  │ 10.0.0.4 │         │ 10.0.0.5 │                 │
│  └──────────┘         └──────────┘                 │
│                                                     │
│  Edge 服务器：协调 + 中继（可选）                    │
└─────────────────────────────────────────────────────┘
```

### 与隧道模式的区别

| 特性 | 隧道模式 | WireGuard 组网 |
|------|---------|---------------|
| **连接方式** | 点对点隧道 | 虚拟局域网 |
| **IP 分配** | 无 | 自动分配网段 IP |
| **多设备互联** | 需要多个隧道 | 原生支持 |
| **性能** | 中等 | 接近原生 |
| **适用场景** | 单服务暴露 | 多设备互联、远程管理 |

---

## 快速开始

### 前置要求

- ✅ YAT 客户端已安装并登录
- ✅ 已订阅支持 WireGuard 的 Edge 服务器
- ✅ Edge 服务器已启用 WireGuard 功能（参见 [Edge WireGuard 配置指南](./edge/wireguard.md)）

### 步骤 1：创建 WireGuard 网络

1. 打开 YAT 客户端，进入 **Networks** 页面
2. 点击 **创建网络** 按钮
3. 填写网络配置：
   - **网络名称**：自定义名称（如 "我的办公室网络"）
   - **CIDR 网段**：建议使用 `10.0.0.0/24`（支持 254 个设备）
   - **中继模式**：选择 `optional`（推荐）或 `force`

> ![Networking snapshot](/images/guide/snapshot-networking-create-zh.png) 创建 WireGuard 网络对话框
> 
> 说明：显示网络名称、CIDR 输入框、中继模式选择

4. 点击 **创建** 完成

### 步骤 2：加入本地设备

创建网络后，需要将当前设备加入网络：

1. 在网络卡片上点击 **加入本地设备** 按钮
2. 等待系统分配 IP 地址
3. 设备状态变为 **在线**

>  ![Networking snapshot](/images/guide/snapshot-networkinfo-members-zh.png) 网络详情页面 - 加入本地设备按钮
> 
> 说明：显示网络卡片、加入按钮、成员列表

::: tip 提示
每台设备都需要单独点击"加入本地设备"才能参与组网。这是安全设计，确保只有明确授权的设备才能加入网络。
:::

### 步骤 3：邀请其他设备

其他设备加入网络的步骤：

1. 在其他设备上打开 YAT 客户端
2. 进入 **Networks** 页面
3. 找到目标网络（同一 Edge 下的网络会自动同步）
4. 点击 **加入网络**
5. 等待 IP 分配完成

### 步骤 4：验证连接

加入网络后，验证设备间是否可以互通：

```bash
# 在设备 A 上 ping 设备 B 的内网 IP
ping 10.0.0.3

# 应该看到正常的 ICMP 响应
64 bytes from 10.0.0.3: icmp_seq=1 ttl=64 time=2.5ms
```

> ![Networking snapshot](/images/guide/snapshot-networkinfo-members-zh.png)网络成员列表 - 显示在线状态和 IP
> 
> 说明：显示成员列表、IP 地址、在线状态、连接质量

### 步骤 5：查看连接详情

点击成员可以查看连接详情：

- **连接路径**：直连（direct）或中继（relay）
- **延迟**：当前连接延迟
- **Endpoint**：对端的实际 UDP 地址
- **握手时间**：最后一次 WireGuard 握手时间

> ![Networking snapshot](/images/guide/snapshot-networkinfo-links-zh.png)成员详情对话框 - 显示连接信息
> 
> 说明：显示成员详情、连接路径、延迟、endpoint

---

## 进阶优化

### 中继模式选择

YAT 支持三种中继模式，影响设备间的连接策略：

#### 1. `optional` 模式（推荐）

```
设备 A ──尝试直连──► 设备 B
          │
          ├─ 成功 → 使用直连（低延迟）
          │
          └─ 失败 → 自动切换到 Edge 中继
```

**特点**：
- ✅ 优先尝试直连，性能最佳
- ✅ 直连失败自动回退到中继
- ✅ 适合大多数场景

**适用场景**：
- 混合网络环境（部分设备在同一局域网）
- 跨地域但有直连可能的设备
- 需要最佳性能的场景

#### 2. `force` 模式

```
设备 A ──强制中继──► Edge 服务器 ──中继──► 设备 B
```

**特点**：
- ✅ 连接稳定，不受 NAT 类型影响
- ⚠️ 延迟较高（经过 Edge 中转）
- ⚠️ 带宽受 Edge 限制

**适用场景**：
- 对称 NAT 环境（直连几乎不可能）
- 需要稳定连接，不关心延迟
- 调试和测试

#### 3. `disabled` 模式

```
设备 A ──仅直连──► 设备 B
          │
          └─ 失败 → 无法连接
```

**特点**：
- ✅ 最高性能（纯直连）
- ❌ 直连失败则无法通信
- ❌ 对 NAT 类型要求高

**适用场景**：
- 所有设备在同一局域网
- 所有设备都有公网 IP
- 极致性能要求

### 切换中继模式

1. 进入网络详情页
2. 点击 **设置** 或 **编辑** 按钮
3. 修改 **中继模式**
4. 保存后，所有成员会自动同步新配置

> ![Networking snapshot](/images/guide/snapshot-networkinfo-settting-relay-zh.png)网络设置对话框 - 中继模式选择
> 
> 说明：显示三种中继模式选项

### 理解连接路径

YAT 会智能选择最优路径：

#### Endpoint 选择流程图

下图展示了 YAT 如何为每个 peer 确定使用哪个 endpoint：

```
                    ┌──────────────────────────────────┐
                    │  Edge 从 WireGuard 握手中观察到    │
                    │  peer 的 UDP 源地址               │
                    │  → "observed endpoint"            │
                    │    (如 1.2.3.4:57681)    │
                    └──────────────┬───────────────────┘
                                   │
                    ┌──────────────▼───────────────────┐
                    │  两个 peer 是否共享相同的          │
                    │  observed 公网 IP？               │
                    │  (same-NAT / 同局域网检测)        │
                    └──────┬───────────────┬───────────┘
                           │               │
                     ┌─YES─┘               └──NO──┐
                     ▼                             ▼
          ┌─────────────────────┐    ┌────────────────────────┐
          │  Edge 向两个 peer    │    │  使用 observed endpoint │
          │  推送 gather 请求    │    │  作为 peer endpoint     │
          └──────────┬──────────┘    │  (公网直连路径)          │
                     │               └────────────────────────┘
          ┌──────────▼──────────┐
          │  客户端上报其         │
          │  LAN IP + WG 端口    │
          │  (如 192.168.1.5:   │
          │   51820)             │
          └──────────┬──────────┘
                     │
          ┌──────────▼──────────┐
          │  LAN endpoint 有效？  │
          │  (非 WG TUN IP,     │
          │   非过期)            │
          └──────┬─────────┬───┘
                 │         │
           ┌─YES─┘         └──NO──┐
           ▼                      ▼
  ┌──────────────────┐  ┌────────────────────────┐
  │ 使用 LAN endpoint │  │ 回退到 observed endpoint│
  │ (局域网直连路径)   │  │ (公网直连路径)          │
  └────────┬─────────┘  └──────────┬─────────────┘
           │                       │
           └───────────┬───────────┘
                       │
          ┌────────────▼────────────┐
          │  WireGuard 内核发送      │
          │  PersistentKeepalive    │
          │  (每 25 秒)              │
          └────────────┬────────────┘
                       │
          ┌────────────▼────────────┐
          │  通信正常？              │
          └──────┬────────────┬─────┘
                 │            │
           ┌─YES─┘            └──NO──┐
           ▼                         ▼
  ┌──────────────────┐    ┌──────────────────────────┐
  │ ✅ 连接成功！      │    │  WG 内核自动修正 endpoint │
  │  低延迟 LAN 路径   │    │  为 observed IP           │
  │  或公网路径        │    │  (自愈，≤25秒)            │
  └──────────────────┘    └────────────┬─────────────┘
                                       │
                          ┌────────────▼────────────┐
                          │  仍然不通？              │
                          │  Relay 模式回退：         │
                          │  optional → relay peer   │
                          │  force → 始终走 relay    │
                          │  disabled → 无回退        │
                          └─────────────────────────┘
```

#### Endpoint 类型

| 类型 | 来源 | 可靠性 | 示例 |
|------|------|--------|------|
| **Observed** | Edge 从 WG 握手中观察到的 peer UDP 源地址 | ✅ 已验证可用 | `1.2.3.4:57681` |
| **LAN** | 客户端通过 same-NAT gather 自报 | ⚠️ 未验证 | `192.168.1.100:51820` |
| **Relay** | Edge relay 服务器配置 | ✅ 始终可用 | `edge.example.com:58021` |

#### 自愈机制

当 LAN endpoint 不通时，WireGuard 内置机制会自动恢复：

1. Peer 从 **observed** 公网 IP 发送 `PersistentKeepalive`（每 25 秒）
2. 本地 WG 内核收到 keepalive → 自动更新 peer endpoint
3. 通信恢复到 observed（公网）路径

**恢复时间**：最长 25 秒（一个 keepalive 周期）+ 网络延迟

#### 直连路径（Direct）

```
设备 A (192.168.1.100:51820) ──UDP──► 设备 B (192.168.1.101:51820)
```

**判断标准**：
- WireGuard 握手成功
- 收到认证 payload（不仅是握手）
- 75 秒内有新数据

**优势**：
- 延迟最低
- 带宽最高
- 不经过 Edge

#### 中继路径（Relay）

```
设备 A ──UDP──► Edge (公网IP:WG端口) ──Kernel Forward──► 设备 B
```

**触发条件**：
- 直连握手超时（30 秒）
- 直连无数据（75 秒）
- 强制中继模式

**Edge 中继机制**：
- 所有 peer 连接至同一 WG 接口端口
- Edge 通过 kernel forwarder（nftables + ip_forward）在同接口内转发加密报文
- 无需额外 per-peer relay 端口

### P2P 会话状态与健康指示器

网络详情页顶部的健康状态 pill 反映了所有 P2P 会话的聚合状态。理解这些状态有助于排查连接问题。

#### 会话生命周期

两台设备之间的直连协商经历以下阶段：

```
创建 → 信息收集(gathering) → 打洞(punching) → 建立中(establishing) → 已连接(connected)
                                                          ↘ 失败(failed)
```

| 阶段 | 超时 | 说明 |
|------|------|------|
| **信息收集** | 30 秒 | 双方交换 endpoint 信息（公网 IP、LAN 地址、NAT 类型） |
| **打洞** | 60 秒 | 向对端 endpoint 发送 WireGuard 握手尝试 |
| **建立中** | 30 秒 | 等待对端确认打洞结果 |
| **已连接** | - | 协商成功，直连路径可用 |
| **失败** | - | 协商超时或打洞失败 |

#### 健康状态含义

| 状态 | 颜色 | 含义 |
|------|------|------|
| **Healthy** | 🟢 绿色 | 所有会话已连接 |
| **Partial** | 🟠 橙色 | 部分会话失败，但有中继回退或其余连通 |
| **Error** | 🔴 红色 | 所有会话失败且无中继回退 |
| **Offline** | ⚪ 灰色 | 无在线成员 |

#### 会话失败但实际连通

在某些场景下，UI 显示会话 "失败" 但实际网络是连通的：

- **原因**：P2P 信令协商（endpoint 发现与打洞）和 WireGuard 实际加密握手是两个独立的过程。信令超时不代表隧道不通。
- **自动恢复**：Edge 的观测循环（每 5 秒）会检测 WireGuard 实际握手状态。当检测到隧道已连通时，会自动将 "失败" 的会话恢复为 "已连接"。
- **恢复延迟**：最多 5-10 秒。

::: tip 提示
如果你看到 "失败" 状态但 `ping` 测试正常，说明 WireGuard 隧道实际已建立。等待几秒后 UI 会自动更新。如果持续不恢复，尝试点击 **刷新** 按钮。
:::

#### 排查 Health Banner

展开健康 Banner 可以查看每个失败/待连接会话的详情：

- **会话端点**：`{发起方} → {目标方}`，显示设备名称
- **状态标签**：显示当前协商阶段
- **错误信息**：显示失败原因（如 `timeout`、`direct punch failed`）

常见错误信息：

| 错误 | 含义 | 建议 |
|------|------|------|
| `timeout` | 协商阶段超时 | 检查 NAT 类型，考虑切换到 `force` 模式 |
| `direct punch failed, relay disabled` | 打洞失败且无中继 | 切换到 `optional` 模式启用中继回退 |
| `direct punch failed, relay fallback remains active` | 打洞失败但中继可用 | 正常，流量正通过中继转发 |

### 优化建议

#### 1. 同一局域网设备

如果多台设备在同一局域网：

- ✅ 使用 `optional` 或 `disabled` 模式
- ✅ Edge 会自动检测 Same-NAT 设备
- ✅ 设备间会优先使用 LAN 地址直连

> [Networking snapshot](/images/guide/snapshot-networkinfo-links-zh.png)Same-NAT 检测提示
> 
> 说明：显示检测到同一 NAT 后的设备对

#### 2. 跨地域设备

如果设备分布在不同地域：

- ✅ 使用 `optional` 模式
- ✅ 允许自动回退到中继
- ✅ 考虑部署地理位置居中的 Edge

#### 3. 对称 NAT 环境

如果设备在对称 NAT 后：

- ✅ 使用 `force` 模式
- ✅ 所有流量通过 Edge 中继
- ✅ 连接稳定但延迟较高

#### 4. 性能敏感场景

如果需要最佳性能：

- ✅ 确保设备间可以直连
- ✅ 使用 `optional` 或 `disabled` 模式
- ✅ 检查防火墙是否放行 UDP 流量

---

## 自维护 Edge 配置

### Edge WireGuard 功能要求

自维护 Edge 需要启用 WireGuard 功能：

```yaml
# Edge 配置文件 (config.yaml)
proxy:
  wireguard:
    enabled: true              # 启用 WireGuard 功能
    relay:
      enabled: true            # 启用业务 relay
      interface_prefix: "wg-yat0"
      listen_port_base: 58021  # WG 接口端口起始
      key_dir: "/var/lib/yat/wg-keys"
      public_endpoint: "edge.example.com"  # Edge 公网地址
```

### 关键配置说明

#### 1. `enabled: true`

启用 WireGuard 功能。Edge 启动后会：
- 创建 WireGuard observation interface
- 初始化 relay manager
- 开始 endpoint 观测循环

#### 2. `relay.enabled`

控制业务 relay 是否启用：

- `true`：启用 kernel forwarder 中继转发（nftables + ip_forward）
- `false`：仅保留 observation interface，不支持 relay

::: tip 提示
即使 `relay.enabled=false`，Edge 仍然可以观测 endpoint。只是客户端无法使用中继路径。
:::

#### 3. `listen_port_base: 58021`

WireGuard 接口端口起始值。每个网络占用一个端口：
- 网络 1: 58021
- 网络 2: 58022
- ...

**防火墙要求**：
```bash
# 放行 WG 接口端口
sudo ufw allow 58021:58100/udp
```

#### 4. `public_endpoint`

Edge 的公网地址。客户端使用此地址连接 relay：

```
客户端 A ──UDP──► edge.example.com:58021 ──Kernel Forward──► 客户端 B
```

**格式要求**：
- ✅ `edge.example.com`
- ✅ `1.2.3.4`
- ✅ `1.2.3.4:8000`（如果 Edge 在非标准端口）
- ❌ `http://edge.example.com`（不要带协议）

### 部署验证

部署 Edge 后，验证 WireGuard 功能：

```bash
# 1. 检查 Edge 日志
journalctl -u yat-edge -f | grep -i wireguard

# 应该看到：
# "WireGuard functionality enabled"
# "Relay manager initialized"
# "Observation loop started"

# 2. 检查 WireGuard 接口
sudo ip link show | grep wg-yat

# 应该看到类似：
# wg-yat0-abc123: <POINTOPOINT,NOARP,UP,LOWER_UP> mtu 1420

# 3. 检查监听端口
sudo ss -ulnp | grep yat-edge

# 应该看到：
# udp  0  0  0.0.0.0:58021  0.0.0.0:*  users:(("yat-edge",pid=1234))
```

::: tip 说明
Edge relay 使用 kernel forwarder 在同 WG 接口内转发 peer 间流量，
无需额外的 per-peer relay 端口。只需放行 WG 接口端口即可。
:::

### 常见配置问题

#### Q: Edge 启动失败，提示 "WireGuard initialization failed"

**原因**：
- 内核不支持 WireGuard（需要 Linux 5.6+）
- 缺少权限创建网络接口

**解决**：
```bash
# 检查内核版本
uname -r

# 如果 < 5.6，升级内核
sudo apt install linux-image-generic

# 确保以 root 运行 Edge
sudo systemctl start yat-edge
```

#### Q: 客户端无法连接 relay

**原因**：
- 防火墙未放行端口
- `public_endpoint` 配置错误
- Edge 未启用 relay

**解决**：
```bash
# 1. 检查防火墙
sudo ufw status
sudo ufw allow 58021:60999/udp

# 2. 验证 public_endpoint
curl -I http://edge.example.com

# 3. 检查 Edge 配置
grep -A 10 "wireguard:" /etc/yat/config.yaml
```

#### Q: 中继模式切换后不生效

**原因**：
- 配置未同步到所有成员
- 客户端未刷新运行态

**解决**：
1. 在 Edge 上修改中继模式
2. 所有客户端点击 **同步本地 Adapter** 按钮
3. 等待 5-10 秒让配置生效

---

## 常见问题排查

### 问题 1：需要手动点击"加入本地设备"才能参与组网

**现象**：
创建网络后，当前设备没有自动加入网络，需要手动点击"加入本地设备"。

**原因**：
这是安全设计。YAT 不会自动将设备加入网络，需要用户明确授权。

**解决**：
1. 在网络卡片上找到 **加入本地设备** 按钮
2. 点击并等待 IP 分配完成
3. 设备状态变为 **在线** 即表示加入成功

> > [Networking snapshot](/images/guide/snapshot-netwokinfo-join-zh.png)加入本地设备按钮
> 
> 说明：显示网络卡片上的加入按钮

### 问题 2：组网不成功，尝试"同步本地 Adapter"

**现象**：
设备已加入网络，但无法 ping 通其他成员。

**原因**：
- 本地 WireGuard 配置未同步
- Helper daemon 未正确 apply 配置
- 运行态与配置不一致

**解决**：
1. 进入网络详情页
2. 找到 **同步本地 Adapter** 按钮（通常在配置面板或操作菜单中）
3. 点击并等待同步完成
4. 检查是否出现 WireGuard 接口

**macOS**：
```bash
# 检查 WireGuard 接口
ifconfig | grep -A 5 utun

# 应该看到类似：
# utun3: flags=8051<UP,POINTOPOINT,RUNNING,MULTICAST> mtu 1420
#     inet 10.0.0.2 --> 10.0.0.1 netmask 0xffffffff
```

**Windows**：
```powershell
# 检查网络适配器
Get-NetAdapter | Where-Object {$_.InterfaceDescription -like "*WireGuard*"}

# 应该看到类似：
# Name  InterfaceDescription                  Status
# ----  --------------------                  ------
# YAT   WireGuard Tunnel: yat-network1        Up
```

### 问题 3：macOS WireGuard 调试

**现象**：
macOS 上 WireGuard 接口未创建或无法通信。

**调试步骤**：

#### 1. 检查 Helper Daemon

```bash
# 检查 yat-wg-helperd 是否运行
ps aux | grep yat-wg-helper

# 应该看到：
# root  1234  0.0  0.1  /var/run/yat-wg-helperd

# 如果未运行，手动启动
sudo /Library/Application\ Support/yat/yat-wg-helperd
```

#### 2. 检查 Unix Socket

```bash
# 检查 socket 文件
ls -l /var/run/yat-wg-helper.sock

# 应该看到：
# srw-r--r--  1 root  wheel  0  9 18 10:00 /var/run/yat-wg-helper.sock
```

#### 3. 查看 Helper 日志

```bash
# 查看 helper daemon 日志
log show --predicate 'process == "yat-wg-helperd"' --last 5m

# 或在 YAT 客户端中查看：
# 设置 > 系统 > WireGuard Helper > 查看日志
```

#### 4. 查看 Helper 日志确认启动成功

```bash
# macOS：通过 unified log 查看
log show --predicate 'process == "yat-wg-helperd"' --last 5m

# macOS：直接查看日志文件
tail -f /Library/Logs/YAT/yat-wg-helperd.log

# Windows：查看日志文件
type %ProgramData%\YAT\helper\wireguard\yat-wg-helperd.log

# 或在 YAT 客户端中查看：
# 设置 > 系统 > WireGuard Helper > 查看日志
```

::: tip 提示
`yat-wg-helperd` 内嵌了 boringtun 引擎，不存在独立的 boringtun 进程。
确认日志中出现 `started` 或 `apply` 成功信息即表示 helper daemon 正常运行。
:::

#### 6. 强制重新 Apply

```bash
# 删除所有 WireGuard 接口
sudo ifconfig utun3 down
sudo ifconfig utun3 destroy

# 在 YAT 客户端中点击"同步本地 Adapter"
# 或重启 YAT 客户端
```

### 问题 4：Windows 检查网络适配器是否组建

**现象**：
Windows 上 WireGuard 网络未正常工作。

**检查步骤**：

#### 1. 检查网络适配器

```powershell
# 方法 1：PowerShell
Get-NetAdapter | Where-Object {$_.InterfaceDescription -like "*WireGuard*"}

# 方法 2：命令行
netsh interface show interface

# 方法 3：设备管理器
# 打开设备管理器 > 网络适配器 > 查找 "WireGuard" 相关设备
```

**期望结果**：
```
Name       InterfaceDescription         Status
----       --------------------         ------
YAT-NET1   WireGuard Tunnel: yat-net1   Up
```

#### 2. 检查 IP 配置

```powershell
# 查看 WireGuard 适配器的 IP 配置
Get-NetIPAddress -InterfaceAlias "YAT-NET1"

# 应该看到分配的内网 IP
# IPAddress      : 10.0.0.2
# PrefixLength   : 24
# AddressFamily  : IPv4
```

#### 3. 检查路由表

```powershell
# 查看路由表
Get-NetRoute -InterfaceAlias "YAT-NET1"

# 应该看到网络网段的路由
# DestinationPrefix  NextHop  RouteMetric
# 10.0.0.0/24        0.0.0.0  256
```

#### 4. 测试连通性

```powershell
# Ping 其他成员
Test-Connection -ComputerName 10.0.0.3 -Count 4

# 如果失败，检查防火墙
# Windows Defender 防火墙可能阻止 ICMP
New-NetFirewallRule -DisplayName "Allow ICMP" -Direction Inbound -Protocol ICMPv4 -Action Allow
```

#### 5. 检查 Wintun 驱动

```powershell
# 检查 Wintun 驱动（安装程序已自动包含，无需手动安装）
Get-WindowsDriver -Online | Where-Object {$_.ProviderName -like "*Wintun*"}

# 正常情况下安装 YAT 客户端后驱动已就绪
# 如确实缺失，可重新运行 YAT 安装程序修复
```

#### 6. 重启 WireGuard 服务

```powershell
# 停止 YAT 客户端
Stop-Process -Name "YAT"

# 删除 WireGuard 适配器
Remove-NetAdapter -Name "YAT-NET1" -Confirm:$false

# 重新启动 YAT 客户端
Start-Process "C:\Program Files\YAT\YAT.exe"

# 等待 10 秒，检查适配器是否重新创建
Get-NetAdapter | Where-Object {$_.InterfaceDescription -like "*WireGuard*"}
```

### 问题 5：Same-NAT LAN 是否组网成功观察

**现象**：
两台设备在同一局域网（Same-NAT），但不确定是否成功使用 LAN 地址直连。

**观察方法**：

#### 1. 查看成员详情

在 YAT 客户端中：
1. 进入网络详情页
2. 点击目标成员
3. 查看 **连接信息**

**期望看到**：
```
连接路径：direct
Endpoint：192.168.1.101:51820  （LAN 地址）
延迟：< 5ms
```

如果 Endpoint 是公网 IP，说明未使用 LAN 地址。

> [Networking snapshot](/images/guide/snapshot-netwokinfo-join-zh.png)成员详情 - 显示 LAN endpoint
> 
> 说明：显示连接路径为 direct，endpoint 为 LAN 地址

#### 2. 检查 Edge 日志

```bash
# 在 Edge 上查看日志
journalctl -u yat-edge -f | grep -i "same-nat"

# 应该看到：
# "Detected same-NAT peers: peerA=1.2.3.4, peerB=1.2.3.4"
# "Triggering LAN endpoint gathering"
```

#### 3. 验证 LAN 连通性

```bash
# 在设备 A 上
ping 192.168.1.101  # 设备 B 的 LAN 地址

# 应该成功
64 bytes from 192.168.1.101: icmp_seq=1 ttl=64 time=0.5ms
```

#### 4. 检查 WireGuard 接口

**macOS**：
```bash
# 查看 WireGuard peer 的 endpoint
sudo wg show all

# 应该看到：
# interface: wg-yat0-abc123
# peer: <peer-B-public-key>
#   endpoint: 192.168.1.101:51820  （LAN 地址）
```

**Windows**：
```powershell
# 使用 WireGuard CLI（如果安装）
& "C:\Program Files\WireGuard\wireguard.exe" /showall

# 或在 YAT 配置面板中查看
```

#### 5. 强制 LAN 发现

如果未检测到 Same-NAT：

1. 确保两台设备都已加入网络
2. 等待 30 秒让 Edge 完成 endpoint 观测
3. 在两台设备上分别点击 **同步本地 Adapter**
4. 检查 Edge 日志是否触发 LAN gathering

### 问题 6：Endpoint 未被观测到

**现象**：
成员的 endpoint 显示为空或 "未观测到"。

**原因**：
- 客户端未发送 WireGuard 握手
- Edge observation interface 未正常工作
- 防火墙阻止 UDP 流量

**解决**：

#### 1. 检查客户端 WireGuard 状态

```bash
# macOS
sudo wg show all

# 应该看到 peer 和 endpoint
# peer: <public-key>
#   endpoint: 1.2.3.4:51820

# Windows
# 查看 YAT 配置面板中的 WireGuard 状态
```

#### 2. 检查 Edge 观测接口

```bash
# 在 Edge 上
sudo wg show wg-yat0-abc123

# 应该看到所有 peer
# peer: <peer-A-key>
#   endpoint: 1.2.3.4:51820
# peer: <peer-B-key>
#   endpoint: 5.6.7.8:51820
```

#### 3. 检查防火墙

```bash
# Edge 防火墙
sudo ufw status
sudo ufw allow 58021:60999/udp

# 客户端防火墙
# macOS: 系统设置 > 网络 > 防火墙 > 允许传入连接
# Windows: Windows Defender 防火墙 > 允许应用通过防火墙
```

#### 4. 强制刷新

1. 在客户端点击 **同步本地 Adapter**
2. 等待 5-10 秒
3. 在 Edge 上检查日志：`journalctl -u yat-edge -f | grep observation`
4. 应该看到 endpoint 更新

### 问题 7：中继转发失败

**现象**：
使用 `force` 模式，但无法通过 Edge 中继通信。

**原因**：
- Edge relay listener 未启动
- 目标 endpoint 未被观测到
- 严格 NAT 阻止 relay 流量

**解决**：

#### 1. 检查 Edge relay 状态

```bash
# 检查 relay listener 是否监听
sudo ss -ulnp | grep yat-edge

# 应该看到：
# udp  0  0  0.0.0.0:58021  0.0.0.0:*  users:(("yat-edge",pid=1234))
```

::: tip 说明
Edge relay 使用 kernel forwarder 在同 WG 接口内转发，所有 peer 共享同一 WG 端口。
无需检查额外的 per-peer relay 端口。
:::

#### 2. 检查目标 endpoint

```bash
# 在 Edge 上查看目标 peer 的 endpoint
sudo wg show wg-yat0-abc123 | grep -A 2 "peer: <target-key>"

# 应该看到：
# endpoint: 1.2.3.4:51820
```

如果 endpoint 为空，relay 无法转发。

#### 3. 检查 relay 日志

```bash
# 查看 relay 转发日志
journalctl -u yat-edge -f | grep -i relay

# 应该看到 nft counter 增长：
# yat_relay  chain forward  accept
```

::: tip 说明
Edge relay 使用 kernel forwarder 在同 WG 接口内转发，所有 peer 共享同一 WG 端口。
无需检查额外的 per-peer relay 端口。
:::

#### 4. 理解当前限制

::: warning 重要提示
Kernel forwarder 依赖 `ip_forward` 在同 WG 接口内转发流量，
源 IP 保持不变。但在严格 endpoint-dependent NAT 环境下，
peer 直连可能仍然受限。建议优先使用 `optional` 模式。
:::

**临时解决方案**：
- 使用 `optional` 模式，优先尝试直连
- 部署地理位置居中的 Edge，减少 NAT 层级
- 确保目标设备的 endpoint 已被观测到

---

## 平台特定指南

### macOS

#### 前提条件

- 已加入至少一个 WireGuard 网络
- Helper daemon 需要管理员权限（首次加入网络时 YAT 会自动请求提权）

#### 调试信息

| 项目 | 路径 |
|------|------|
| Helper 日志 | `/Library/Logs/YAT/yat-wg-helperd.log` |
| WG 配置文件 | `~/Library/Application Support/yat/wireguard/networks/<networkId>/wg.conf` |

#### 查看 WireGuard 状态

```bash
# 安装 WireGuard 官方 macOS 客户端后可用
# https://apps.apple.com/app/wireguard/id1451685025
sudo wg show all
```

### Windows

#### 前提条件

- 已加入至少一个 WireGuard 网络
- Helper daemon 需要管理员权限（YAT 安装程序已自动配置）

#### 调试信息

| 项目 | 路径 |
|------|------|
| Helper 日志 | `%ProgramData%\YAT\helper\wireguard\yat-wg-helperd.log` |
| WG 配置文件 | `%APPDATA%\yat\wireguard\networks\<networkId>\wg.conf` |

#### 查看 WireGuard 状态

```powershell
# 通过 Wintun 虚拟网络适配器查看发包情况
Get-NetAdapter | Where-Object {$_.InterfaceDescription -like "*WireGuard*"}

# 在 Windows 设备管理器 > 网络适配器 中也可看到 Wintun 适配器
```

### Linux

#### 前提条件

- Linux 5.6+（内核原生支持 WireGuard）
- Edge 进程需要 root 权限

```bash
# 查看 WireGuard 接口状态
sudo wg show all

# 查看接口详情
sudo ip link show type wireguard
```

---

## 💡 最佳实践

### 1. 网络规划

- ✅ 使用 `/24` 网段（支持 254 个设备）
- ✅ 避免与现有网段冲突（如 `192.168.1.0/24`）
- ✅ 为不同用途创建不同网络（办公、测试、生产）

### 2. 安全建议

- ✅ 定期审查网络成员
- ✅ 及时移除不活跃设备
- ✅ 使用强密码保护 YAT 账户
- ✅ 启用两步验证（如果支持）

### 3. 性能优化

- ✅ 优先使用直连路径
- ✅ 选择地理位置居中的 Edge
- ✅ 避免在对称 NAT 环境下使用直连
- ✅ 定期监控连接质量

### 4. 故障预防

- ✅ 保持 YAT 客户端更新
- ✅ 定期检查 Edge 健康状态
- ✅ 备份重要配置
- ✅ 记录网络拓扑和 IP 分配

---

## 📚 相关文档

- [传输模式](./transport-modes.md) - 了解 Relay/P2P/WireGuard 的区别
- [Edge 管理](./edge/management.md) - 部署和管理 Edge 服务器
- [多设备与角色](./multi-device-roles.md) - 多设备协作和权限管理
- [常见问题](./faq.md) - 解决其他常见问题

---

*最后更新：2026-09-18*
*YAT Team - 让内网穿透更简单*
