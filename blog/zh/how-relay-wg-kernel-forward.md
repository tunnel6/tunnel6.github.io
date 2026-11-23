---
title: WireGuard relay 转发之一：内核 ip_forward 与 nftables 的 forward 链
date: 2026-11-23
author: YAT Team
description: 中继节点上包要先拆封再重封，本篇讲中间那一步：ip_forward、rp_filter、netfilter FORWARD hook，以及为什么关键在 nftables 那条链的声明方式。
excerpt: 中继把 A 的包拆成明文、再重新加密发给 B。拆封与重封都是内核 WireGuard 在做，真正需要设计的是中间那一步：Linux 能不能把一个从某接口收到的包再从同一个接口发出去。
tags:
  - WireGuard
  - Relay
  - Linux 内核
  - nftables
publish: false
layout: doc
sidebar: true
aside: false
pageClass: blog-post
---

[上一篇](./how-relay-wg.md)把中继定义成"网络里的一个普通成员"：它自己持有一个 WireGuard 接口，成员把直连不通的包交给它。这一篇讲它收到包之后做的事。

场景固定下来。成员 A（`10.24.0.2`）和成员 B（`10.24.0.3`）分处两个 NAT 后面，无法直连，二者的配置里都有一条指向中继的 peer。A 发出的加密包到达中继的 UDP 端口，内核的 WireGuard 模块解密，还原出一个普通的 IPv4 包：

```
src = 10.24.0.2    dst = 10.24.0.3    输入接口 = wg-yat0-xxx
```

`10.24.0.3` 也挂在 `wg-yat0-xxx` 上。于是问题变成：**Linux 能不能把一个从某接口收到的包，再从同一个接口发出去？**

能。需要满足三个条件，其中前两个是内核开关，第三个——防火墙放行——才是真正需要设计的地方。Edge 在这条路径上的实现不接触任何一个数据包，它做的全部事情是在启动时把这三个条件置好。

阅读本文需要知道 WireGuard 的 peer 与 AllowedIPs 是什么，不需要 netfilter 编程经验。

## 先说清数据平面：一次拆封，一次重封

转发之前得先弄清包本身被做了什么。这部分与选哪种转发方式无关，而且它才是中继上真正的开销。

一个 WireGuard 数据包的结构：

```
外层 IP 头（中继地址 ↔ 成员地址）
  └ 外层 UDP 头（中继端口 58021 ↔ 成员的 NAT 映射端口）
      └ WireGuard 数据报文：type(1) + receiver index(4) + counter(4) + 密文 + Poly1305 tag(16)
            └ 明文 IPv4 包（没有以太头，取出就是 IP 头）
```

包到中继之后，到它继续上路，一共三步：

1. **拆封**。内核拿报文里的 receiver index（对端静态公钥的哈希前 4 字节）定位到是哪个 peer，用与这个 peer 的会话密钥解密，验证 Poly1305 tag，并检查 counter 没被重放过。成功后取出最内层的明文 IP 包，按“从 `wg-yat0-xxx` 收到”交给 IP 层。
2. **转发决策**。内层包的目的地址不是本机，于是进入转发路径。这一步只改两处：TTL 减 1，以及因 TTL 变化而要同步修正的 IP 头校验和。`src` 与 `dst` 不变。
3. **重封**。`wg_xmit()` 按目的地址在各 peer 的 AllowedIPs 里查出这个包属于 B，用**与 B 那条独立会话**的密钥重新加密，附上新的 counter 与新的 tag，再套上外层 UDP/IP 头发出。源端口仍是 58021，目的地址是内核为 B 学到的当前 endpoint。

两个推论得单独拿出来说。

第一，A 与 B 之间**不存在一个端到端的加密会话**，只有“中继—A”和“中继—B”两段各自独立的会话，中继在第 1 步解密、在第 3 步重新加密。这是 WireGuard 本身的结构决定的，不是实现上的偷懒。上一篇里的“受信中继”就具体到这一步：谁持有中继这台机器，谁就能在第 1 步与第 3 步之间看到明文。

第二，开销主要在两次加解密，不在转发。一个数据报文在明文 IP 包之外增加 25 字节（type 1 + receiver index 4 + counter 4 + tag 16），再加上外层 UDP 8 与外层 IPv4 20，线上共 53 字节；而中继每转一个包要跑两遭 ChaCha20-Poly1305。所以衡量两种转发方式时真正要守住的是“不要把包搬到用户态”；中间那一步是查路由还是查一张哈希表，量级上不重要。[另一篇](./how-relay-wg-ebpf-forward.md)里那条路的完整动机也在这里：它重定向的还是同一个包，第 1 步与第 3 步一字不改。

本文只讨论第 2 步。

## 数据包经过的内核路径

```
UDP 58021 收到密文
  └─ 拆封（上一节第 1 步）→ 明文包以"链路层收到"的形式进入 IP 层
       ip_rcv()
         ├─ 目的地址是本机？   否 → ip_forward()
         │     ├─ fib_validate_source()   ← rp_filter 在这里生效
         │     ├─ nf_hook(NF_INET_FORWARD) ← 防火墙在这里生效
         │     ├─ ip_route_input()         ← 目的网段的路由在这里查
         │     └─ ip_output() → dev_queue_xmit()
         │            └─ 出口 qdisc → wg_xmit()  ← 重封（上一节第 3 步）：按 AllowedIPs 选中 B 并发出
         └─ 是 → 投递给本机 socket
```

三个条件对应图中的三个点：内核得愿意转发（`ip_forward`）、不得在反查时把包判成伪造（`rp_filter`）、不得被防火墙丢掉（FORWARD 链）。

## 条件一：ip_forward

`net.ipv4.ip_forward` 为 0 时，内核在 `ip_rcv` 之后就把非本机地址的包丢弃，转发路径根本不会进入。这个开关在多数发行版的云镜像上是关的。

Edge 在启动转发器时直接写入 1，写不进去就报错退出：这个条件不成立，后面所有配置都没有意义，与其让中继静默丢包，不如启动失败。

```bash
sysctl net.ipv4.ip_forward          # 期望 1
nstat -az 'IpForwDatagrams'          # 转发发生时这个值会涨
```

第二条命令在排查时很有用：`IpInReceives` 在涨而 `IpForwDatagrams` 不动，说明包根本没进入转发路径，与防火墙无关。

## 条件二：rp_filter

反向路径过滤（reverse path filtering）是 1970 年代思路的反欺骗检查：内核拿**源地址**做一次路由查询，如果"要发给这个源地址"的最优路由不是刚才的入接口，就认为这个包是伪造的，丢弃。

它有两个键，内核取两者中较大的值生效：

```
net.ipv4.conf.all.rp_filter
net.ipv4.conf.wg-yat0-xxx.rp_filter
```

只改接口那一个、或者只改 `all` 那一个，都不会生效。取值含义是 `0` 关闭、`1` 严格模式（最优路由必须正好是入接口）、`2` 宽松模式（存在任意路由即可）。

中继场景为什么必然撞上它：成员网段的路由可能同时出现在多个地方——另一条隧道也声称覆盖同一网段、机器有多个网卡、或者成员已经直连上并从其他路径可达。严格模式下这些都足以让最优路由不再是中继接口，包被丢掉。宽松模式在多数拓扑里能过，但它依赖"到 A 恰好有某条路由"这个间接前提，不好推理也不好排错。Edge 选择直接置 0，把不确定性去掉，写失败只告警不中止。

注意 `accept_local` 是另一条独立的检查（是否接受源地址属于本机地址集的包），打开它不能替代关闭 `rp_filter`。

## 条件三：FORWARD 链

前两个条件是内核自己的判断，第三个是防火墙。放行这件事由 netfilter 完成，而 netfilter 在 Linux 上有两套用户态接口：老的 `iptables` 和新的 `nftables`。这里需要把 nftables 的三个概念说清楚，因为**关键不在那条匹配规则，而在链的声明方式**。

netfilter 在协议栈的固定位置开放挂载点，称为 hook，转发路径上的是 `NF_INET_FORWARD`。一个 hook 上可以挂多条链，按优先级数字从小到大依次执行。nftables 里：

- **table**：一个命名空间，同时决定协议族（`ip`、`ip6`、`inet`、`bridge`）。表名互不冲突，删表即删除其中全部内容。
- **chain**：声明自己 `type` 与挂在哪个 `hook`、`priority` 多少、以及没有任何规则命中时的默认动作 `policy`。
- **rule**：匹配条件加一个 verdict（`accept`、`drop`、`continue`……）。

Edge 装的是一条这样的链：

```nft
table ip yat_relay {
  chain forward {
    type filter hook forward priority mangle; policy accept;
    iifname "wg-yat0-xxx" oifname "wg-yat0-xxx" ip daddr 10.24.0.0/24 accept
  }
}
```

逐个字段看它决定了什么。

`table ip yat_relay`：IPv4 族的独立表。不复用系统里已有的 `filter` 表，因此这条规则的存在与删除不会触碰用户或 Docker 写的任何东西，排错时用一条 `nft list table ip yat_relay` 就能看到中继需要的东西在不在。

`type filter hook forward`：注册在转发 hook 上，也就是上面调用栈里 `nf_hook(NF_INET_FORWARD)` 那一跳。

`priority mangle`：这是最要紧的一处。`mangle` 是 nftables 给 `-150` 起的名字，各优先级的含义是：

| 优先级 | 数值 | 这一层通常做什么 |
|---|---|---|
| `raw` | -300 | 连接跟踪例外 |
| `conntrack` | -200 | 连接跟踪本身 |
| `mangle` | -150 | 改包标记、改 TTL |
| `dstnat` | -100 | 目的地址转换 |
| `filter` | 0 | 常规的允许/拒绝，Docker 与 `ufw`、`firewalld` 的规则在这里 |
| `srcnat` | 100 | 源地址转换 |

netfilter 的语义是：一条 `accept` 会**终结当前 hook 上优先级更靠后的所有链的评估**。放在 `-150`，就意味着排在 `0` 的一大批链——包括 Docker 默认设置的 `FORWARD` / `DOCKER-USER` 拒绝规则——不会被执行到。如果把它放在 `filter`（0），就得指望自己恰好排在别人的 DROP 之前，而那是一个没人能保证的顺序。

同时可以看到，`conntrack`（-200）排在前面，已经执行完了。所以走内核转发的流量仍然被连接跟踪记录，宿主上用 `conntrack -E` 或基于状态的防火墙规则依然能看到这条会话。这一点在[第二篇](./how-relay-wg-ebpf-forward.md)里正好相反，是两条路径最实质的区别之一。

`policy accept`：这条链对没有命中任何规则的包怎么办。链只描述中继自己那个接口和网段，其余转发行为不该由它裁决，所以默认放行。

`iifname "wg-yat0-xxx" oifname "wg-yat0-xxx"`：入接口和出接口必须是同一个，而且必须是这个中继接口。这两个条件同时写，是"同接口转发"这件事在规则语言里的准确表达。

`ip daddr 10.24.0.0/24`：只放行目的地在这个网络内的包。中继不参与其他网段的转发决策。

一条链对应一个接口，一台 Edge 上多个网络就有多个接口、多条规则，都放在同一张表里。nftables 允许给规则附带注释，Edge 写入的是 `yat-relay:<接口名>`，`nft list` 输出里直接可读，卸载时按注释精确删除自己那几条。

## 还得多补一条 iptables 规则

`nftables` 和 `iptables` 是两套用户态工具，但 `iptables` 命令在内核里可能落在两个不同后端上，用 `iptables -V` 可以看出是哪一个。

`nf_tables` 后端会把 `iptables` 规则翻译成 nftables 的链，和上面那条链处在同一个 hook 上。由于我们的链优先级更高并且直接 `accept`，这些规则不会被评估，问题自动解决。

`legacy` 后端走的是内核里另一组独立的回调（`x_tables`），它和 nftables 各自注册在 FORWARD hook 上，**nftables 的 accept 不会阻止 legacy 回调执行**。这类机器上，Docker 设置的 `FORWARD` 默认 DROP 依然会杀掉转发的包，而且从 `nft list ruleset` 里完全看不到。所以 Edge 除了 nftables 规则，还会执行等价的：

```bash
iptables -I FORWARD -i wg-yat0-xxx -o wg-yat0-xxx -d 10.24.0.0/24 -j ACCEPT
```

这条写入失败只告警：不是所有机器都有 `iptables`，而多数机器也不需要它。

判断自己踩的是哪一种：`nft list table ip yat_relay` 里规则计数器在涨、但对端收不到包，同时 `iptables -L FORWARD -v -n` 显示大量 DROP 计数，基本就是 legacy。

## 没有 masquerade，也不该有

上面第 2 步说内层 `src`/`dst` 不变，这里说它为什么不能变。早期版本在 postrouting 加过源地址转换，那是错的。同接口转发时内核保留原始源地址，B 收到的包源地址就是 `10.24.0.2`，它的回包按自己的路由直接回到中继的 `58021`，正好命中 A 的 NAT 映射。

一旦做了 SNAT，源地址被改写成中继自己的 IP，B 会把回包当作发给本机的流量处理，A 永远等不到响应。可以在 B 上确认源地址：

```bash
tcpdump -i wg-yat0-xxx -n net 10.24.0.0/24
```

## 程序做的事，和不做的事

```
启动：
  写 /proc/sys/net/ipv4/ip_forward = 1                    失败 → 中止启动
  写 conf/all/rp_filter = 0，conf/<接口>/rp_filter = 0     失败 → 告警
  通过 netlink 创建表与链，插入放行规则，记下句柄
  通过 iptables 命令补一条等价规则                          失败 → 告警
  挂上按成员统计与限速的辅助组件

停止 / 进程退出：
  按句柄删除规则；删除整张 yat_relay 表；删除 iptables 规则
```

没有一个环节涉及读取或改写数据包：没有抓包的 socket，没有处理报文的 goroutine。规则下发全部通过 netlink 完成，不依赖机器上装了 `nft` 命令；只有那条兜底的 iptables 规则会去调用外部命令。

## 验证

按调用栈的顺序查，不要从防火墙开始。

```bash
# 1. 三个条件
sysctl net.ipv4.ip_forward net.ipv4.conf.all.rp_filter net.ipv4.conf.wg-yat0-xxx.rp_filter
nft list table ip yat_relay

# 2. 包有没有进接口、有没有被转出去：应同时看到两个方向的明文包
tcpdump -i wg-yat0-xxx -n

# 3. 端到端
ping 10.24.0.3
wg show wg-yat0-xxx                  # 成员的 endpoint 与 last handshake
```

三条判读规则：

- 规则里的包计数器一直是 0：包没有进入 FORWARD，回去查 `ip_forward`，不是匹配条件写错了。这种情况下改接口名、改网段都不会有变化。
- 计数器在涨，B 收不到：查 B 侧配置的 AllowedIPs 是否包含 A 的地址，以及 A 的路由表里到 B 的下一跳是不是中继。
- 一切都对但不通，且 `iptables -V` 显示 `legacy`：见上一节。

## 前提与限制

- 转发是否正确依赖三份共享状态：一个全局开关、两处 `rp_filter`、一条很多人共用的 FORWARD hook。Docker 启停、`ufw reload`、系统重启都可能把其中某一项改回去，而且不会通知正在跑的中继。这是[第二篇](./how-relay-wg-ebpf-forward.md)那条路存在的主要原因——注意不是因为权限，两条路权限要求同级，eBPF 反而更高。
- 只覆盖 IPv4。表族是 `ip`，IPv6 需要另外一张 `ip6` 表和对应的内核开关，目前没有实现。
- 向宿主的 FORWARD hook 注入了一条链。它与其他人注册的链共享同一个 hook，如果别的组件也用了 `-150` 优先级，评估顺序要自己确认。
- 依赖内核的 nftables 支持（Linux 3.13 起内置）与 WireGuard 模块，不需要额外安装包。但需要 `nf_tables` 内核模块可加载，部分极简化的容器镜像内核里没有。

## 相关阅读

- [异地组网：为什么我们用 Edge 做 WireGuard peer relay](./how-relay-wg.md)
- [WireGuard relay 转发之二：用 eBPF 在 TC 入口重定向数据包](./how-relay-wg-ebpf-forward.md)
- [Edge WireGuard 配置](/guide/edge/wireguard)

## 参考

- [nftables Wiki：Netfilter hooks](https://wiki.nftables.org/wiki-nftables/index.php/Netfilter_hooks) — hook 与优先级的权威列表
- [Linux kernel docs：ip-sysctl](https://www.kernel.org/doc/Documentation/networking/ip-sysctl.txt) — `ip_forward`、`rp_filter`、`accept_local` 的原始定义
- [WireGuard：Whitelisting](https://www.wireguard.com/whitelisting/) — AllowedIPs 的路由语义
