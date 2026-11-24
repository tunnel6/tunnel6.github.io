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
publish: true
layout: doc
sidebar: true
aside: false
pageClass: blog-post
---

网络里有两个成员：A（`10.24.0.2`）和 B（`10.24.0.3`）。它们分处两个 NAT 后面，无法直连，都把中继（`10.24.0.1`）配置成 peer。A 发出的加密包到达中继的 UDP 端口，内核 WireGuard 解出普通 IPv4 包：

```
src = 10.24.0.2    dst = 10.24.0.3    输入接口 = wg-yat0-xxx
```

`10.24.0.3` 也挂在 `wg-yat0-xxx` 上。于是问题变成：**Linux 能不能把一个从某接口收到的包，再从同一个接口发出去？**

能。需要满足三个条件，其中前两个是内核开关，第三个——防火墙放行——才是真正需要设计的地方。Edge 在这条路径上的实现不接触任何一个数据包，它做的全部事情是在启动时把这三个条件置好。

阅读本文需要知道 WireGuard 的 peer 与 AllowedIPs 是什么，不需要 netfilter 编程经验。

## 数据面：一次拆封，一次重封

转发之前得先弄清包本身被做了什么。这部分与选哪种转发方式无关，而且它才是中继上真正的开销。

一个 WireGuard 数据包的结构：

```
外层 IP 头（中继地址 ↔ 成员地址）
  └ 外层 UDP 头（中继端口 58021 ↔ 成员的 NAT 映射端口）
      └ WireGuard 数据报文：消息头(16) + 密文 + Poly1305 tag(16)
            └ 明文 IPv4 包（没有以太头，取出就是 IP 头）
```

包到中继之后，到它继续上路，一共三步：

1. **拆封**。内核用报文里的 receiver index 定位本端会话，用会话密钥解密，验证 Poly1305 tag，并检查 counter 没被重放。成功后取出内层 IP 包，按“从 `wg-yat0-xxx` 收到”交给 IP 层。
2. **转发决策**。内层包的目的地址不是本机，于是进入转发路径。这一步只改两处：TTL 减 1，以及因 TTL 变化而要同步修正的 IP 头校验和。`src` 与 `dst` 不变。
3. **重封**。`wg_xmit()` 按目的地址在各 peer 的 AllowedIPs 里查出这个包属于 B，用**与 B 那条独立会话**的密钥重新加密，附上新的 counter 与新的 tag，再套上外层 UDP/IP 头发出。源端口仍是 58021，目的地址是内核为 B 学到的当前 endpoint。

有两个结果值得注意。

第一，A 与 B 之间**不存在一个端到端的加密会话**，只有“中继—A”和“中继—B”两段各自独立的会话，中继在第 1 步解密、在第 3 步重新加密。这是 WireGuard 本身的结构决定的，不是实现上的偷懒。上一篇里的“受信中继”就具体到这一步：谁持有中继这台机器，谁就能在第 1 步与第 3 步之间看到明文。

第二，开销主要在两次加解密，不在转发。WireGuard 数据报文在明文 IP 包之外增加 32 字节：16 字节数据消息头，加 16 字节 Poly1305 tag；再加上外层 UDP 8 字节、IPv4 20 字节，线上共多 60 字节。中继每转一个包要跑两遍 ChaCha20-Poly1305。所以两种转发方式的共同点是不要把包搬到用户态；中间那一步是查路由还是查哈希表，量级上不重要。[另一篇](./how-relay-wg-ebpf-forward.md)重定向的仍是同一个包，拆封和重封不变。

本文只讨论第 2 步。

## 数据包经过的内核路径

```
UDP 58021 收到密文
  └─ 拆封（上一节第 1 步）→ 明文包以"链路层收到"的形式进入 IP 层
       ip_rcv()
         └─ ip_rcv_finish()
              ├─ ip_route_input()
              │    ├─ 查目的网段路由
              │    └─ fib_validate_source() ← rp_filter 在这里生效
              ├─ 目的地址是本机 → 投递给本机 socket
              └─ 目的地址不是本机 → ip_forward()
                   ├─ TTL > 1，减 1 并修正校验和
                   ├─ NF_INET_FORWARD ← 防火墙在这里生效
                   └─ ip_output() → dev_queue_xmit()
                        └─ 出口 qdisc → wg_xmit() ← 重封：按 AllowedIPs 选中 B 并发出
```

三个条件对应图中的三个点：内核得愿意转发（`ip_forward`）、不得在反查时把包判成伪造（`rp_filter`）、不得被防火墙丢掉（FORWARD 链）。

## 条件一：ip_forward 开启

`net.ipv4.ip_forward` 为 0 时，内核在 `ip_rcv` 之后就把非本机地址的包丢弃，转发路径根本不会进入。这个开关在多数发行版的云镜像上是关的。

[Edge](/guide/zh/edge/#什么是-edge) 在启动转发器时直接写入 1，写不进去就报错退出：这个条件不成立，后面所有配置都没有意义，与其让中继静默丢包，不如启动失败。

```bash
sysctl net.ipv4.ip_forward          # 期望 1
```

```bash
nstat -az | grep -E '^Ip(InReceives|ForwDatagrams)'
```

排查时看这两个计数：`IpInReceives` 在涨而 `IpForwDatagrams` 不动，说明包没有进入转发路径，问题在 `ip_forward` 或路由判断，不在 FORWARD 链。

## 条件二：rp_filter 关闭

反向路径过滤（reverse path filtering）反欺骗检查：内核拿**源地址**做一次路由查询，如果"要发给这个源地址"的最优路由不是刚才的入接口，就认为这个包是伪造的，丢弃。

它有两个键，内核取两者中较大的值生效：

```
net.ipv4.conf.all.rp_filter
net.ipv4.conf.wg-yat0-xxx.rp_filter
```

只改接口那一个、或者只改 `all` 那一个，都不会生效。取值含义是 `0` 关闭、`1` 严格模式（最优路由必须正好是入接口）、`2` 宽松模式（存在任意路由即可）。

中继场景容易撞上它：成员网段的路由可能同时出现在多个地方，例如另一条隧道声称覆盖同一网段、机器有多个网卡，或者成员已经直连并可从其他路径到达。严格模式下这些都会让最优路由不再是中继接口，包被丢掉。宽松模式在多数拓扑里能过，但排错时要额外推理“到 A 究竟走哪条路由”。Edge 直接置 0；两个键写失败都只告警，不中止。

注意 `accept_local` 是另一条独立的检查（是否接受源地址属于本机地址集的包），打开它不能替代关闭 `rp_filter`。

## 条件三：FORWARD 链

前两个条件是内核自己的判断，第三个是防火墙。netfilter 在 Linux 上有两套用户态接口：老的 `iptables` 和新的 `nftables`。先分清 nftables 的三个概念。

netfilter 在协议栈的固定位置开放挂载点，称为 hook，转发路径上的是 `NF_INET_FORWARD`。一个 hook 上可以挂多条链，按优先级数字从小到大依次执行。nftables 里：

- **table**：一个命名空间，同时决定协议族（`ip`、`ip6`、`inet`、`bridge`）。表名互不冲突，删表即删除其中全部内容。
- **chain**：声明自己 `type` 与挂在哪个 `hook`、`priority` 多少、以及没有任何规则命中时的默认动作 `policy`。
- **rule**：匹配条件加一个 verdict（`accept`、`drop`、`continue`……）。

[Edge](/guide/zh/edge/#什么是-edge) 装的是一条这样的链：

```nft
table ip yat_relay {
  chain forward {
    type filter hook forward priority mangle; policy accept;
    iifname "wg-yat0-xxx" oifname "wg-yat0-xxx" ip daddr 10.24.0.0/24 accept
  }
}
```

看这条链的声明：

`type filter hook forward`：注册在上面调用栈里的 `NF_INET_FORWARD` hook。

`priority mangle`（`-150`）让它排在 `conntrack`（`-200`）之后、常见 filter 链（`0`）之前。但 nftables 的 `accept` 只结束当前 base chain 的评估，不会阻止同一个 hook 上优先级更靠后的链继续看包；`drop` 才会立刻终止。因此这条链不能“覆盖”Docker、`ufw`、`firewalld` 或其他安全软件后来设置的规则。它先放行自己匹配的中继流量，再由宿主上其他 FORWARD 规则决定是否仍放行。

Docker 的 `DOCKER-USER` 通常在 iptables 的 `FORWARD` 链里。用 `iptables -I FORWARD ...` 把同一条匹配规则插到该链前面，能避免它被同一链内的 Docker 规则拦掉；后续如果有独立的 nftables 表继续 drop，这条流量仍然会被拦。更多 hook 和 priority 可以看[Netfilter 相关文档](https://wiki.nftables.org/wiki-nftables/index.php/Netfilter_hooks)。
![netfilter](/blog/images/nf-hooks.png)

同时可以看到，`conntrack`（-200）排在前面，已经执行完了。所以走内核转发的流量仍然被连接跟踪记录，宿主上用 `conntrack -E` 或基于状态的防火墙规则依然能看到这条会话。这一点在[第二篇](./how-relay-wg-ebpf-forward.md)里正好相反，是两条路径最实质的区别之一。

`policy accept`：没有规则命中时，当前链返回 accept。其余转发不该由这条链裁决，所以不在链内 drop；后续 base chain 仍会继续评估。

`iifname "wg-yat0-xxx" oifname "wg-yat0-xxx"`：入接口和出接口必须是同一个，而且必须是这个中继接口。这两个条件同时写，是"同接口转发"这件事在规则语言里的准确表达。

`ip daddr 10.24.0.0/24`：只放行目的地在这个网络内的包。中继不参与其他网段的转发决策。

一台 Edge 上多个网络有多条规则，放在同一张表里。Edge 会保存规则 handle；卸载时先用 handle 删除，handle 失效后再按接口名、网段和 verdict 扫描匹配。规则里还存了内部 `UserData`（`yat-relay:<接口名>`），但它不是 `nft list` 中显示的普通注释，当前删除逻辑也不依赖它。

## iptables

`iptables` 和 nftables 操作的是同一个内核防火墙，上面的效果也可以用 iptables 实现：

```bash
# 安装（等价于上面那条 nft 规则）
iptables -I FORWARD -i wg-yat0-xxx -o wg-yat0-xxx -d 10.24.0.0/24 -j ACCEPT

# 卸载
iptables -D FORWARD -i wg-yat0-xxx -o wg-yat0-xxx -d 10.24.0.0/24 -j ACCEPT
```

注意事项：

- **用 `-I` 插到链首，不要用 `-A` 追加**。Docker 常把 `DOCKER-USER` 跳转放在 `FORWARD` 链前面，追加的规则可能轮不到执行。链内顺序就是 iptables 能控制的顺序。
- **先看后端类型**：`iptables -V` 输出括号里是 `nf_tables` 还是 `legacy`。`nf_tables` 后端会把规则放进 iptables 兼容层；插到 `FORWARD` 链前面后，可以先于链内 Docker 规则生效。`legacy` 后端走独立的 `x_tables` 路径，`nft list ruleset` 看不到它；只有 iptables fallback rule 才能在这类宿主上放行同一条流量。所以 Edge 不区分后端，总会装上，失败只告警。
- **卸载要重述整条规则**：`-D` 一次只删一条匹配规则。进程重启多次可能留下重复副本，Edge 因此循环执行 `-D`，直到命令报“规则不存在”为止。


## 相关阅读

- [异地组网：为什么我们用 Edge 做 WireGuard peer relay](./how-relay-wg.md)
- [WireGuard relay 转发之二：用 eBPF 在 TC 入口重定向数据包](./how-relay-wg-ebpf-forward.md)
- [Edge WireGuard 配置](/guide/edge/wireguard)

## 参考

- [nftables Wiki：Netfilter hooks](https://wiki.nftables.org/wiki-nftables/index.php/Netfilter_hooks) — hook 与优先级的权威列表
- [Linux kernel docs：ip-sysctl](https://www.kernel.org/doc/Documentation/networking/ip-sysctl.txt) — `ip_forward`、`rp_filter`、`accept_local` 的原始定义
- [WireGuard：Whitelisting](https://www.wireguard.com/whitelisting/) — AllowedIPs 的路由语义
