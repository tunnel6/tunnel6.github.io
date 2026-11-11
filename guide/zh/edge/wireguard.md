# Edge WireGuard 配置指南

> 在 Edge 服务器上启用和配置 WireGuard 组网功能

---

## 📋 概述

Edge 服务器支持 WireGuard 组网功能，可以作为中继节点为网络成员提供流量转发。启用后，Edge 会自动创建 WireGuard 接口、管理 peer 并处理转发。

> 📖 详细的组网使用指南请参考 [WireGuard 组网指南](../wireguard-networking.md#自维护-edge-配置)

---

## 系统要求

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

---

## 内核配置一览

Edge 启动时会**自动检测并设置**以下内核参数和模块，通常无需手动干预：

### 内核模块

| 模块 | 用途 | 检查方式 |
|------|------|----------|
| `wireguard` | WireGuard 接口创建（Linux 5.6+ 内置） | `lsmod \| grep wireguard` |
| `nf_tables` | nftables 防火墙规则（kernel 策略依赖） | `nft list tables` |

### Sysctl 参数

| 参数 | 值 | 用途 | 设置方式 |
|------|------|------|----------|
| `net.ipv4.ip_forward` | `1` | 启用 IP 转发，peer 间 relay 前提 | Edge 自动设置 |
| `net.ipv4.conf.all.rp_filter` | `0` | 禁用全局反向路径过滤 | Edge 自动设置 |
| `net.ipv4.conf/<wg-iface>/rp_filter` | `0` | 禁用 WG 接口反向路径过滤 | Edge 自动设置 |

::: warning 注意
`rp_filter` 的实际生效值为 `max(all/rp_filter, <if>/rp_filter)`，两者都必须为 0。Edge 已自动处理，但如果手动设置过 `all/rp_filter`，请确认已恢复为 0。
:::

### 内核功能依赖（按转发策略）

| 功能 | kernel 策略（默认） | ebpf 策略 |
|------|---------------------|------------|
| WireGuard 模块 | ✅ 必须 | ✅ 必须 |
| nftables | ✅ 必须 | ❌ 不需要 |
| netlink (rtnetlink) | ✅ 必须 | ✅ 必须 |
| TC + BPF (cls_bpf) | ✅ 必须（peer 流量统计） | ❌ 不需要 |
| eBPF + `bpf_redirect_peer` | ❌ 不需要 | ✅ 必须（Linux 5.8+，实验性） |
| `ip_forward` | ✅ 必须 | ❌ 不需要（绕过内核转发） |

---

## 配置参数

### YAML 配置（config.yaml）

```yaml
proxy:
  wireguard:
    enabled: true                    # 启用 WireGuard 功能
    relay_enabled: true              # 启用 relay 中继
    public_endpoint: "edge.example.com"  # Edge 公网地址（不含端口）
    listen_port_base: 58021          # WG 接口监听端口起始值
    forwarder_strategy: "kernel"     # 转发策略：kernel（默认）| ebpf（实验性，需 Linux 5.8+）
```

完整的 WireGuard 配置项请参考 [配置参数参考](./config-reference.md#_4-4-wireguard-proxy-wireguard)。

### 启动参数（CLI 标志）

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--channel.wireguard.enable` | `true` | 启用 WireGuard 功能 |
| `--channel.wireguard.relay_enabled` | `false` | 启用 Edge 侧 relay 中继 |
| `--channel.wireguard.public_endpoint` | 同 `--public` | WireGuard relay 公网地址 |

::: warning 注意
CLI 标志优先级高于 YAML 配置和缓存的启动配置。如果通过 CLI 设置了参数，会覆盖配置文件中的值。
:::

---

## 防火墙与端口

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

---

## 自动管理的内核参数与 nftables 规则

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

---

## 部署验证

```bash
# 1. 检查 Edge 日志
journalctl -u edge -f | grep -i wireguard
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

---

## 异常处理

### IP 转发未启用

**现象**：peer 间无法通信，nft counter 为 0

**原因**：Edge 虽然会自动设置 `ip_forward`，但某些环境下（如容器权限不足）写入可能失败

```bash
# 手动启用 IP 转发
sudo sysctl -w net.ipv4.ip_forward=1

# 持久化
echo 'net.ipv4.ip_forward=1' | sudo tee -a /etc/sysctl.conf
```

### Docker 主机 iptables 干扰

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

### 内核版本不支持 WireGuard

**现象**：Edge 启动失败，提示 "WireGuard initialization failed"

```bash
# 检查内核版本
uname -r

# 如果 < 5.6，升级内核
sudo apt install linux-image-generic
sudo reboot
```

---

## 🔗 相关文档

- [Edge 服务器管理](./management.md) - 部署和管理 Edge
- [WireGuard 组网指南](../wireguard-networking.md) - 完整的 WireGuard 组网使用指南
- [配置参数参考](./config-reference.md) - YAML 配置项完整参考
- [启动参数参考](./startup-params.md) - 命令行参数完整列表

---

*YAT Team - 让内网穿透更简单*
