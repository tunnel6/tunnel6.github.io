---
title: "WireGuard relay forwarding, part 1: kernel ip_forward and the nftables forward chain"
date: 2026-11-23
author: YAT Team
description: "The middle hop on a relay node: ip_forward, rp_filter, the netfilter FORWARD hook, and why the nftables chain declaration matters."
excerpt: "The relay decrypts A's packet and encrypts it again for B. Kernel WireGuard does both; the design problem is whether Linux will forward a packet received from an interface back through that same interface."
tags:
  - WireGuard
  - Relay
  - Linux kernel
  - nftables
publish: true
layout: doc
sidebar: true
aside: false
pageClass: blog-post
---

This network has two members: A (`10.24.0.2`) and B (`10.24.0.3`). They are behind different NATs and cannot connect directly, so both configure the relay (`10.24.0.1`) as a peer. A's encrypted packet reaches the relay's UDP port, and kernel WireGuard produces a normal IPv4 packet:

```
src = 10.24.0.2    dst = 10.24.0.3    input interface = wg-yat0-xxx
```

`10.24.0.3` is also on `wg-yat0-xxx`. The question becomes: **can Linux forward a packet received on an interface back out of that same interface?**

Yes, if three conditions hold. The first two are kernel switches; the third is firewall acceptance—the part that needs design. Edge does not touch individual packets here. It prepares those three conditions when the forwarder starts.

This article assumes you know WireGuard peers and `AllowedIPs`; netfilter programming experience is not required.

## Data path: one decryption and one encryption

First, establish what happens to the packet. This part is independent of forwarding strategy and is the real cost on the relay.

The structure of a WireGuard data packet is:

```
Outer IP header (relay address ↔ member address)
  └ Outer UDP header (relay port 58021 ↔ member's NAT-mapped port)
      └ WireGuard data message: 16-byte header + ciphertext + Poly1305 tag(16)
            └ Plaintext IPv4 packet (no Ethernet header; the IP header is exposed)
```

From arrival at the relay to departure, there are three steps:

1. **Decapsulation.** The kernel uses the receiver index to identify the local session, decrypts with that session key, verifies the Poly1305 tag, and rejects replayed counters. It then hands the inner IP packet upward as if received on `wg-yat0-xxx`.
2. **Forwarding decision.** The inner destination is not local, so the packet enters forwarding. This step changes only TTL and the IPv4 checksum that must track it. `src` and `dst` stay unchanged.
3. **Re-encapsulation.** `wg_xmit()` selects B from peer `AllowedIPs`, encrypts with B's independent session, attaches a new counter and tag, and adds new outer UDP/IP headers. The source port remains 58021; the destination is B's currently learned endpoint.

Two consequences are worth stating directly.

First, there is **no end-to-end encryption session** between A and B. There are separate relay-to-A and relay-to-B sessions, and the relay decrypts in step 1 and encrypts in step 3. This follows from WireGuard's structure. Whoever controls the relay can see plaintext between those operations.

Second, cost is dominated by encryption, not forwarding. A WireGuard data message adds 32 bytes beyond the plaintext IP packet: a 16-byte data-message header plus a 16-byte Poly1305 tag. With 8 bytes of UDP and 20 bytes of IPv4, the wire overhead is 60 bytes. The relay runs ChaCha20-Poly1305 twice per forwarded packet. Both forwarding strategies therefore share one invariant: do not move packets into user space. Whether the middle step consults a route or a hash table is secondary. [Part 2](./how-relay-wg-ebpf-forward.md) redirects the same packet and leaves decapsulation and encryption unchanged.

This article discusses only step 2.

## The kernel path

```
UDP 58021 receives ciphertext
  └─ Decapsulation (step 1) → plaintext enters the IP layer as if link-layer received
       ip_rcv()
         └─ ip_rcv_finish()
              ├─ ip_route_input()
              │    ├─ Route lookup for the destination
              │    └─ fib_validate_source() ← rp_filter takes effect here
              ├─ Local destination → deliver to a local socket
              └─ Non-local destination → ip_forward()
                   ├─ TTL > 1; decrement it and update the checksum
                   ├─ NF_INET_FORWARD ← firewall takes effect here
                   └─ ip_output() → dev_queue_xmit()
                        └─ Egress qdisc → wg_xmit() ← re-encryption: AllowedIPs selects B
```

The three conditions map to three points: the kernel must forward (`ip_forward`), must not reject the source during reverse-path validation (`rp_filter`), and the firewall must accept the packet (FORWARD chain).

## Condition 1: ip_forward is enabled

When `net.ipv4.ip_forward` is 0, non-local packets are discarded after `ip_rcv`, so forwarding is never entered. Most cloud images disable it.

[Edge](/guide/edge/#what-is-edge) writes `1` when the forwarder starts and fails startup if the write fails. There is no point installing the remaining configuration if the packet can never enter forwarding.

```bash
sysctl net.ipv4.ip_forward          # expected: 1
```

This command is useful while troubleshooting:

```bash
nstat -az | grep -E '^Ip(InReceives|ForwDatagrams)'
```

If `IpInReceives` increases while `IpForwDatagrams` does not, the packet is not reaching the forwarding path. The problem is before FORWARD—usually `ip_forward` or routing—not the firewall.

## Condition 2: rp_filter is disabled

Reverse path filtering is an anti-spoofing check. The kernel performs a route lookup using the **source address**. If the best route to that source is not the incoming interface, the kernel treats the packet as spoofed and drops it.

Two keys participate, and the kernel uses the larger value:

```
net.ipv4.conf.all.rp_filter
net.ipv4.conf.wg-yat0-xxx.rp_filter
```

Changing only one of them is not enough. The meanings are `0` disabled, `1` strict (the best route must be the incoming interface), and `2` loose (any route is enough).

Relay traffic easily triggers this check because a member subnet can be reachable through more than one path: another tunnel claims the same range, the host has multiple interfaces, or a directly connected member is reachable elsewhere. Strict mode drops these packets. Loose mode often passes, but troubleshooting then requires reasoning about which route A actually follows. Edge sets both values to 0. A failed write is logged, not fatal.

`accept_local` is a separate check for packets whose source belongs to the host's own address set. Enabling it is not a substitute for disabling `rp_filter`.

## Condition 3: the FORWARD chain

The first two conditions are kernel decisions. The third is the firewall. Linux has two user-space front ends for netfilter: older `iptables` and newer `nftables`. Three nftables concepts matter here.

Netfilter exposes fixed hooks. The forwarding hook is `NF_INET_FORWARD`. Multiple chains can attach to one hook and run in increasing priority order. In nftables:

- **table**: a namespace that also selects a family (`ip`, `ip6`, `inet`, `bridge`). Deleting a table removes everything in it.
- **chain**: declares its `type`, attached `hook`, `priority`, and default `policy` when no rule matches.
- **rule**: match expressions plus a verdict (`accept`, `drop`, `continue`, and others).

[Edge](/guide/edge/#what-is-edge) installs a chain like this:

```nft
table ip yat_relay {
  chain forward {
    type filter hook forward priority mangle; policy accept;
    iifname "wg-yat0-xxx" oifname "wg-yat0-xxx" ip daddr 10.24.0.0/24 accept
  }
}
```

Breaking down the declaration:

`type filter hook forward` registers the chain on the `NF_INET_FORWARD` hook shown above.

`priority mangle` (`-150`) places it after `conntrack` (`-200`) and before a common filter chain (`0`). But an nftables `accept` ends evaluation only of the current base chain. It does not prevent later chains on the same hook from seeing the packet; only `drop` stops immediately. This chain therefore does not override Docker, `ufw`, `firewalld`, or another security product that installs later rules. It accepts relay traffic in its own chain, and later FORWARD rules can still reject it.

Docker's `DOCKER-USER` usually lives in an iptables `FORWARD` chain. Inserting the same match with `iptables -I FORWARD ...` places it before rules in that chain, so Docker rules in that same chain do not intercept it. If an independent nftables table later drops the packet, it is still dropped. See the [Netfilter documentation](https://wiki.nftables.org/wiki-nftables/index.php/Netfilter_hooks) for more hooks and priorities.
![netfilter](/blog/images/nf-hooks.png)

`conntrack` (`-200`) runs earlier, so kernel-forwarded traffic is still tracked. `conntrack -E` and stateful firewall rules can see the flow. That is the opposite of [part 2](./how-relay-wg-ebpf-forward.md) and is one of the substantive differences between the paths.

`policy accept`: with no matching rule, this chain returns accept. It deliberately does not judge unrelated forwarding; later base chains still evaluate the packet.

`iifname "wg-yat0-xxx" oifname "wg-yat0-xxx"` requires the input and output interfaces to be the same relay interface. Together, these expressions state "same-interface forwarding" precisely.

`ip daddr 10.24.0.0/24` limits acceptance to destinations in this network. The relay does not decide forwarding for other ranges.

Multiple networks on one Edge produce multiple rules in the same table. Edge stores the rule handle and removes it by handle first. If the handle is stale, it scans the chain for the interface, network, and verdict. The rule also carries internal `UserData` (`yat-relay:<interface>`); that is not a normal comment displayed by `nft list`, and current deletion does not depend on it.

## iptables

`iptables` operates on the same kernel firewall. The same effect can be expressed as:

```bash
# Install (equivalent to the nft rule above)
iptables -I FORWARD -i wg-yat0-xxx -o wg-yat0-xxx -d 10.24.0.0/24 -j ACCEPT

# Remove
iptables -D FORWARD -i wg-yat0-xxx -o wg-yat0-xxx -d 10.24.0.0/24 -j ACCEPT
```

Notes:

- **Use `-I`, not `-A`.** Docker commonly places the `DOCKER-USER` jump near the front of `FORWARD`; an appended rule may never execute. Chain order is the ordering control iptables has.
- **Check the backend first.** The parentheses in `iptables -V` say `nf_tables` or `legacy`. The `nf_tables` backend places the rule in the iptables compatibility layer, where inserting before the existing `FORWARD` rules lets it run before Docker rules in that chain. The `legacy` backend uses the separate `x_tables` path and is invisible to `nft list ruleset`; on such hosts the iptables fallback is required to accept this traffic. Edge installs it regardless of backend and logs, but does not fail, if installation fails.
- **Removal must restate the rule.** `-D` deletes one matching rule at a time. Repeated restarts can leave duplicates, so Edge loops `-D` until it reports that the rule no longer exists.

## Related reading

- [Cross-site networking: why we use Edge as a WireGuard peer relay](./how-relay-wg.md)
- [WireGuard relay forwarding, part 2: redirecting packets at TC ingress with eBPF](./how-relay-wg-ebpf-forward.md)
- [Edge WireGuard configuration](/guide/edge/wireguard)

## References

- [nftables Wiki: Netfilter hooks](https://wiki.nftables.org/wiki-nftables/index.php/Netfilter_hooks) — authoritative hook and priority list
- [Linux kernel docs: ip-sysctl](https://www.kernel.org/doc/Documentation/networking/ip-sysctl.txt) — definitions of `ip_forward`, `rp_filter`, and `accept_local`
- [WireGuard: Whitelisting](https://www.wireguard.com/whitelisting/) — routing semantics of AllowedIPs
