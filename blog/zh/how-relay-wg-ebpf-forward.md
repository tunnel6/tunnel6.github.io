---
title: WireGuard relay 转发之二：用 eBPF 在 TC 入口重定向数据包
date: 2026-11-24
author: YAT Team
description: 讲透中继节点上的 eBPF 转发：TC 与 clsact、SchedCLS 程序能做什么、bpf_redirect 的 flags 为什么必须是 0，以及这条路绕过了什么、又换上了哪些前提。
excerpt: 中继转发的两条路都是内核级操作，权限要求差不多，eBPF 甚至更高。真正的区别在于：转发是否正确要不要依赖宿主机上那份共享的、会被别人重写的防火墙状态。
tags:
  - WireGuard
  - Relay
  - eBPF
  - Linux 内核
publish: false
layout: doc
sidebar: true
aside: false
pageClass: blog-post
---

[上一篇](./how-relay-wg-kernel-forward.md)讲的是让内核自己转发：打开 `ip_forward`、关掉 `rp_filter`、在 nftables 的 forward 链上放行。这一篇讲另一条路：在包进入协议栈更早的位置截住它，直接送回接口的出口。

先划清一条界限，它经常被当成选 eBPF 的理由：**两条路的权限要求是同一级的，eBPF 甚至更高。** 写 `/proc/sys` 和下发 nftables 规则需要 root 与 `CAP_NET_ADMIN`；加载 BPF 程序额外需要 `CAP_BPF` 和一个够新的内核。一台改不了 sysctl 的机器，通常也加载不了 BPF 程序，所以“没权限改机器就改用 eBPF”这个推论不成立。

路径长这样：

```
UDP 58021 收到密文 → 拆封（内核 WireGuard 解密）→ 明文包到达接口的 TC ingress
                                                    │ 我们挂载在这里的 BPF 程序
                                                    │ bpf_redirect(ifindex, 0)
                                                    ▼
                                接口出口 qdisc → wg_xmit() → 重封（内核 WireGuard 加密）→ B
```

包没有查路由表，没有进 netfilter 的 FORWARD hook，没有进 conntrack，也没有离开内核。

范围要先圈清楚：[上一篇](./how-relay-wg-kernel-forward.md)把包在中继上的经历拆成了三步——拆封、转发决策、重封，**这条路只替换中间那一步**。用 A 的会话密钥解密、验 tag、查 counter，以及用 B 的会话密钥重新加密，都还是内核 WireGuard 在做；`bpf_redirect` 提交之后包走的仍然是同一个 `wg_xmit()`。所以它省掉的是路由查找、netfilter 和 conntrack，一次加解密也不会少。

真正的区别在于**转发是否正确要不要依赖别人的状态**。内核转发的结果由三样东西共同决定：一个全局开关、两处 `rp_filter`、一条共用的 FORWARD hook。前两项是整台机器共享的，后一项是所有防火墙工具共用的挂载点。Docker 启停容器、`ufw reload`、安全 agent 刷新规则，都可能把其中某一项改回去，而这类变更不会通知你。eBPF 路径把判断收进自己的程序里：条件写在指令里，不读也不写任何全局开关。

代价是换上一组别的前提：内核版本、编译方式、协议覆盖范围，以及调试与调优的难度——`tcpdump` 在这条路上只能看到出方向，`nft` 计数器不会增长，改一个匹配条件意味着重新生成指令并重新过验证器。这一篇把两边都说清楚。

阅读前需要知道 TC、qdisc 这些词大致指什么；如果不清楚，下一节把它们定义清楚。

## 三个概念：TC、clsact、SchedCLS

**TC（Traffic Control）** 是 Linux 上管设备收发的框架。每个网络设备挂一棵队列树，出口方向由 root qdisc 决定包怎么排队（这是限速功能的地方），入口方向默认几乎不做处理。

**clsact** 是一种特殊的 qdisc，它的作用只有一个：给设备提供 `ingress` 和 `egress` 两个可以挂分类器的位置。它的句柄固定是 `ffff:0`，和出口方向的 root qdisc 互不影响，因此"在入口挂一个 BPF 程序"和"用 HTB 在出口限速"可以共存。要往入口挂东西，先得确保接口上有 clsact。

**`BPF_PROG_TYPE_SCHED_CLS`**（Go 里是 `ebpf.SchedCLS`）是运行在这两个位置上的程序类型。它的输入是一个 `__sk_buff` 结构，返回值是 TC 的动作码：

| 返回值 | 含义 |
|---|---|
| `TC_ACT_OK` (0) | 按原来的流程继续处理这个包 |
| `TC_ACT_SHOT` (2) | 丢弃 |
| `TC_ACT_REDIRECT` (7) | 已经交给 `bpf_redirect` 送到别处 |

程序以 DirectAction 模式挂载时，它的返回值直接就是 TC 的判决；否则返回值只是分类结果，还要靠 filter 上配的Police 或 classid 决定去向。Edge 用的是 DirectAction。

`bpf_redirect(ifindex, flags)` 把包提交到指定设备的发送路径，返回值是 `TC_ACT_REDIRECT`。这两个参数后面会单独说。

## 挂载

```
Start():
  link = netlink.LinkByName(ifName)
  link.Type() != "wireguard"            → 返回错误，不猜测别的设备类型
  cfg.IfIndex = link.Attrs().Index      ← 下面所有判断都用它
  cfg.MTU     = link.Attrs().MTU

  statsMap = ebpf.NewMap(...)           按源地址计数的 HashMap
  prog     = ebpf.NewProgram(...)       加载，验证器通过才算成功

  QdiscAdd(clsact)                      已存在（EEXIST）就复用，其他错误中止
  FilterAdd(BpfFilter{
      Parent: HANDLE_MIN_INGRESS, Priority: 1, Handle: 1,
      Protocol: ETH_P_ALL, DirectAction: true, Name: "yat_redirect",
  })                                    CREATE|EXCL：位置被占就失败，不顶掉别人的 filter

Stop():
  FilterDel → prog.Close → map.Close
```

三个细节值得说明。

**接口类型要先确认。** 这套逻辑只对 WireGuard 接口成立：入口是解密后的明文 IP 包，出口是待加密的明文 IP 包。挂到别的设备上，语义完全不同。

**netlink 请求要等 ack。** 下发 qdisc 和 filter 用的是带确认的请求。用非阻塞收发时，`Recvfrom` 把 `EAGAIN` 当成成功返回，规则其实没装上也看不出来——这类"程序活着但没生效"的问题非常难查。

**priority 1 而不是 100。** 同一个 hook 上按优先级从小到大执行。转发程序占 1，只负责计数的程序占 10，顺序是“先决定去留，再计数”。内核转发路径上不搬包，因此需要一个独立的计数程序；eBPF 路径的转发程序自己就把数计了。

## 程序内部：每一条判断都在补协议栈的账

程序没有循环、没有查表，网段、掩码、中继地址、接口编号、MTU 都在加载时作为立即数写进指令。判断顺序如下，"交回协议栈"就是返回 `TC_ACT_OK`：

| 顺序 | 判断 | 不满足时 |
|---|---|---|
| 1 | 头 20 字节能否读全 | 交回协议栈 |
| 2 | 首字节是否为 `0x45`（IPv4、无选项） | 交回协议栈 |
| 3 | 源与目的是否都落在本网络内 | 交回协议栈 |
| 4 | 目的是否就是中继自己的地址 | 交回协议栈（那是给中继的流量） |
| 5 | 目的是否组播/广播/网络地址（`/31`、`/32` 跳过网络地址检查） | 交回协议栈 |
| 6 | TTL 是否已 ≤ 1 | 交回协议栈（让协议栈去发 ICMP time exceeded） |
| 7 | 头长 < 20 或总长 > `skb->len` | 丢弃 |
| 8 | 总长 ≠ `skb->len`（有多余填充）或 > MTU | 交回协议栈 |
| 9 | IP 头反码校验和验证 | 丢弃 |
| 10 | TTL 减 1 并修正校验和，`bpf_redirect(ifindex, 0)`，按源地址累加计数 | — |

对应的伪代码大致是这样（真实实现是指令序列）：

```
data     = skb->data          // __sk_buff 偏移 76
data_end = skb->data_end      // __sk_buff 偏移 80
if data + 20 > data_end { return TC_ACT_OK }

version_ihl = *data                       // 必须是 0x45：IPv4 且头长 20 字节
                                          // 拆封之后没有以太头，偏移 0 就是 IP 头
src = ntohl(*(u32*)(data + 12))
dst = ntohl(*(u32*)(data + 16))
if (src & NETMASK) != NETWORK { return TC_ACT_OK }
if (dst & NETMASK) != NETWORK { return TC_ACT_OK }
if dst == RELAY_IP || dst >= 224.0.0.0 { return TC_ACT_OK }
if data[8] <= 1 { return TC_ACT_OK }

totlen = ntohs(*(u16*)(data + 2))
if totlen < 20 || totlen > skb->len { return TC_ACT_SHOT }
if totlen != skb->len || totlen > MTU { return TC_ACT_OK }

if ones_complement_sum(data[0..20]) != 0xffff { return TC_ACT_SHOT }

data[8] -= 1                              // 等价于 ip_decrease_ttl()
data[10..12] += 0x100 并折叠进 16 位       // 校验和的增量修正
return bpf_redirect(IFINDEX, 0)
```

这段代码里有三件事容易被忽略，但都是必须的。

**头校验和必须自己验。** 走 `ip_rcv` 的话这一步由协议栈做。既然绕过了入口，非法包头就会一路送到 B 那里，由 B 的 WireGuard 或 IP 层丢弃——排查时会变成一个"看起来在转发但不通"的谜。

**TTL 必须自己减，校验和必须自己改。** 中继是一个路由器角色，不减 TTL 就可能出现环路。而 TTL 变了校验和必须跟着变，否则对端收到的是非法包。因为改动只是 TTL 那一字节，校验和可以用增量修正而不必整段重算。

**边界检查必须重新做。** BPF 验证器要求每一次指针移动之后都重新和 `data_end` 比较，否则拒绝加载。`data` 和 `data_end` 是 `__sk_buff` 里固定偏移的字段（76 和 80），`skb->len` 在偏移 0，包含非线性数据。

## `bpf_redirect` 的第二个参数必须是 0

这是这条路最容易搞错、后果也最严重的一点。

`flags = 0` 表示把包送到目标设备的**出口**路径，也就是走 `dev_queue_xmit`，进入出口 qdisc，再交给设备的 `ndo_start_xmit`——对 WireGuard 接口就是 `wg_xmit`，正好是要的效果。

`flags = BPF_F_INGRESS` 表示送到目标设备的**入口**。目标设备就是自己，于是包回到自己挂着的这个程序上，形成循环。

有两个看起来更合适的选择，实际都不对：

- **`bpf_redirect_peer`**：跳过分类器重新执行、直达对端设备，性能更好，但它的语义前提是**对端设备在另一个网络命名空间**（典型场景是 veth 两端分居 netns）。我们的 WireGuard 接口两端都在同一个 netns 里，没有可跳转的"对端设备"。而且它返回 `TC_ACT_REDIRECT` 只表示"提交了一次重定向"，不代表投递成功，失败是静默的。
- **`bpf_clone_redirect`**：复制一份包再重定向，原包继续走协议栈。我们要的不是复制，而是让这个包换条路走，并且还要修改它（TTL 和校验和），克隆反而多此一举。

因此最终选择是 `bpf_redirect(ifindex, 0)`，配合程序自己完成簿记。

## 这条路绕过了什么，代价是什么

把两篇的内容并到一张报文路径上看：

```
内核路径：解密 → ip_rcv → rp_filter → FORWARD(nftables) → 路由查询 → ip_output → qdisc → wg_xmit
eBPF 路径：解密 → TC ingress → bpf_redirect → qdisc → wg_xmit
```

省掉的环节带来的好处是直接的：不需要 `ip_forward`，不需要动 `rp_filter`，不需要在 FORWARD 链上放行，宿主上的 Docker、`ufw`、`firewalld`、云厂商的安全组脚本都影响不到这条路径。每包还少了一次路由查找和一条 hook 链的遍历，但相对于 WireGuard 本身的加解密，这部分开销不是主要矛盾。

被绕过的另一面是可观测性。这些工具在这个路径上什么都看不到：

- `nft list table ip yat_relay`：内核路径的证据。eBPF 路径下这张表是空的，**这是正常的**。
- `conntrack -E`：eBPF 路径不进 conntrack，没有会话记录。
- 基于 netfilter 的流量统计与告警：统计不到这部分流量。
- 想看有没有转发，只能看 `tc -s filter show dev <接口> ingress` 里程序的计数，或者程序自己维护的那张按源地址的哈希表。

还有一个前提值得单独指出，它说明"绕过宿主配置"是有边界的：程序只接管**它判定合格的那部分流量**。IPv6、带 IP 选项的包、分片、跨网段的目的地址，全部原样交回协议栈——而这些包如果确实需要转发，走的还是上一篇那套内核路径。也就是说，`ebpf` 策略并不等于"这台机器完全不需要开 `ip_forward`"，它等于"中继所需的那条主要路径不再依赖它"。

按成员的字节计数还有个小坑：程序在重定向成功后按源地址查表累加，但表里没有对应条目时不会创建，只跳过。所以统计恒为 0 不代表没在转发，要先确认条目是否建过。

## 前提与限制

- 需要 root 与 `CAP_BPF`、`CAP_NET_ADMIN`。注意这比内核路径的权限更多，不是更少。
- 最低内核 5.8。这个下限与内核能力有关：`CAP_BPF` 从 5.8 起才从 `CAP_SYS_ADMIN` 里独立出来。
- 二进制必须用 `go build -tags ebpf` 编译。默认构建里这套代码不参与编译，配置成 `ebpf` 会直接返回"不可用"，而不是静默退化——这是刻意的，避免运维以为在用另一条路。
- 只处理 IPv4 且头部无选项的包，不处理分片与组播，不生成 ICMP 差错报文。
- 用 `cilium/ebpf/asm` 在 Go 里直接生成指令，不需要 clang/LLVM，也不需要预编译的 `.o`。代价是这段代码的可读性接近汇编，任何改动都要清楚验证器的规则。
- 与限速不冲突：HTB 挂在 root qdisc（`1:`）上，`bpf_redirect` 的包会经过出口 qdisc，所以按成员的出向限速照常生效。
- 调试与调优比内核路径难。程序被验证器拒载时只有一个错误码，没有报文可看；想确认判定分支走到哪一步，要么读 `bpftool prog dump xlated` 的指令，要么重新生成一版带额外计数的程序。任何匹配条件的改动都是一次重新加载，而不是改一条规则。

## 什么时候用它

两条路的权限门槛差不多（eBPF 还更高），所以选择依据不是“能不能”，而是下面三条：

- 宿主的 FORWARD 链会不会被别人反复重写。装了 Docker 的机器上，容器启停和 daemon 重启都会重排规则；`ufw`、`firewalld`、EDR 类 agent 也会。内核路径依赖“我们的链恰好排在前面”这个条件一直成立，eBPF 路径不依赖任何人。
- 是否介意转发的流量进 conntrack。内核转发会给每条流建一个连接跟踪条目，成员多、长连接多的时候这张表持续膨胀，表满时新流会被直接丢弃。eBPF 路径不产生条目。
- 可运维性值多少。内核转发是 Linux 的标准行为，`tcpdump`、`nft` 计数器、`conntrack -E` 都在这条路径上有效；eBPF 路径上这些工具全部沉默，只剩 `tc -s filter` 和 `bpftool`。

默认仍是 kernel。保留 ebpf 作为可选项，用在前两条确实成立的机器上，而不是把它当成“更快的那个”。

## 验证

```bash
# 程序与 filter 是否挂上，命中了多少包
tc -s filter show dev wg-yat0-xxx ingress

# 内核里登记的 BPF 程序
bpftool prog list | grep yat_

# 有没有真的送达对端：在中继上看接口计数，在成员 B 上看收到的源地址
ip -s link show wg-yat0-xxx
wg show wg-yat0-xxx
```

`tc` 输出里 `bpf` 那行带着程序名和 run 次数，是这条路径最直接的存活证据。`Forwarded` 这个计数的含义是"成功提交重定向的次数"，不等于对端收到——从提交到送达之间还有 WireGuard 自己的发送与对端的接收。

## 相关阅读

- [异地组网：为什么我们用 Edge 做 WireGuard peer relay](./how-relay-wg.md)
- [WireGuard relay 转发之一：内核 ip_forward 与 nftables 的 forward 链](./how-relay-wg-kernel-forward.md)
- [Edge WireGuard 配置](/guide/edge/wireguard)

## 参考

- [Cilium ebpf](https://github.com/cilium/ebpf) — Go 加载器与 `asm` 指令构造
- [eBPF helper：`bpf_redirect`](https://docs.ebpf.io/linux/helper-function/bpf_redirect/) — flags 语义
- [lartc：Traffic Control filters](https://lartc.org/howto/lartc.qdisc.filters.html) — qdisc / class / filter 的关系
