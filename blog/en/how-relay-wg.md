---
title: "Cross-site networking: why we use Edge as a WireGuard peer relay"
date: 2026-11-11
author: YAT Team
description: "Which layer the relay runs at, how many ports it needs, and whether it can see plaintext—how YAT's WireGuard relay design was settled."
excerpt: "Two machines behind routers need to talk. When hole punching fails, something has to relay. Choosing the layer, the port model, and the visibility trade-off narrows the design quickly."
tags:
  - WireGuard
  - Relay
  - Cross-site networking
publish: true
layout: doc
sidebar: true
aside: false
pageClass: blog-post
---

A home NAS needs to reach a test machine at the office. Both are behind routers and neither has a public address. YAT tries a direct connection first. If hole punching fails, packets go through a relay on an Edge node—an Edge server that you deploy yourself.

Three choices shape the design: where the relay runs, how many UDP ports it uses, and whether it can see packet contents. Ours can see relayed traffic. That is a deliberate trade-off; Section 4 explains why.

## 1. Where a relay can live

A WireGuard direct connection needs two things: both peers know each other's address, and the network path works. NAT provides the address mapping; reachability depends on the network shape. Symmetric NAT can make ports mismatch. Under carrier-grade NAT, neither side may have an address the other can reach. Machines behind the same router also depend on that router supporting hairpin forwarding. When direct connection fails, a relay is needed.

There are only a few practical places to put it:

**At the application layer.** Tools such as frp and `ssh -R` connect a TCP stream: "forward local 8080 to remote NAS:5001." Configuration is precise, but the proxy does not understand IP. Every new service needs another rule, and UDP and other protocols are awkward. That is port forwarding, not networking.

**At the network layer, with a central lookup node.** This is the traditional VPN model: routes point to the center; the center decrypts, consults a routing table, and sends the packet onward. The implementation is straightforward, but all traffic traverses the center even when peers can connect directly.

**At the network layer, without decrypting at the relay.** Tailscale's DERP and NetBird's relay work this way: the relay carries encrypted WireGuard bytes and cannot read the contents. The relay must maintain a connection-to-member mapping, usually encapsulates UDP in TCP or QUIC, and processes every packet in user space. Standard `wg` tools cannot inspect it.

**At the network layer, with the relay as a member.** The relay runs a real WireGuard interface, and members configure it as an ordinary peer. A packet from A to B first goes to the relay; the relay decrypts it and forwards it as a normal IP packet. B receives a packet encrypted with A's key.

We chose the last model. It has the weakest privacy boundary (Section 4), but it needs one port, leaves encryption and decryption in the kernel, and works with standard `wg` and `tcpdump` tools. Two constraints explain why this choice follows.

## 2. Two constraints

### NAT only accepts replies from the same socket

Suppose A is behind a home router and sends to `203.0.113.10:58021`. The router rewrites the source to `1.2.3.4:57138`, forwards the packet, and records that port 57138 belongs to traffic sent to `203.0.113.10:58021`.

A reply must come from `203.0.113.10:58021` for the router to map it back to A's port 57138. If the relay replies from another port—even with the same IP—the router drops the packet.

This rule is strict. A separate relay port per member, or a different source port during forwarding, breaks here. The relay must use one UDP port: whichever port members send to is the port replies must leave from.

### WireGuard learns peer endpoints

Even if a peer has a configured `Endpoint`, the kernel updates that endpoint whenever an authenticated packet arrives from a different source.

That behavior makes NAT traversal work, but it is dangerous for a relay. If forwarding opens a temporary source port, a member learns that port as the relay's address. Subsequent handshakes and data go to a socket that is not listening until the configuration is distributed again.

The fix is not compensation logic. The relay must always send from the address and port members expect—which returns us to one UDP port.

The resulting shape is a relay with a real WireGuard interface and one UDP port per network. Handshakes, keepalives, and data all use that port. Delivering a packet from one member to another is left to kernel forwarding.

## 3. What it looks like now

```
   Member A                                   Edge (you deploy it)                             Member B
 10.24.0.2                              WG interface wg-yat0-xxx                            10.24.0.3
                                        Network 10.24.0.0/24, port 58021

 A ── ciphertext encrypted with Edge's public key ──→ 58021
                                      │ Kernel decrypts: src=10.24.0.2 dst=10.24.0.3
                                      │ Kernel forwards: destination is on this interface
                                      │ WireGuard sends: AllowedIPs selects B and encrypts with B's key
 58021 ←──────────────────────────── sent from the same port ──────────────────────────────→ B

 B replies to 58021. A's router recognizes the port mapping and accepts the packet.
```

Member configuration is ordinary WireGuard configuration with two kinds of peers:

```ini
[Interface]
PrivateKey = <member's local private key; it never leaves this machine>
Address    = 10.24.0.2/24

# Relay: Edge's public key and port
[Peer]
PublicKey  = <Edge public key>
Endpoint   = 203.0.113.10:58021
AllowedIPs = 10.24.0.1/32, 10.24.0.3/32   # Edge itself + members not yet directly connected
PersistentKeepalive = 25

# A member that is directly connected: traffic does not traverse Edge
[Peer]
PublicKey  = <member C public key>
Endpoint   = 192.168.1.30:51820
AllowedIPs = 10.24.0.4/32
PersistentKeepalive = 25
```

Two details are intentional.

The relay peer's `AllowedIPs` lists individual `/32` addresses instead of the whole network. When two members establish a direct connection, the destination address moves from the relay peer to their direct peer. A member IP therefore has one exit at any moment, so two peers never claim the same address. Keeping Edge's own `10.24.0.1/32` lets packets originated by Edge pass WireGuard's source-address check.

`PersistentKeepalive = 25` preserves the NAT mapping. UDP timeouts vary by router, but 25 seconds is a common WireGuard value with practical margin.

On Edge, each network has an independent WireGuard interface, key pair, and subnet. An observation loop runs every 5 seconds and reads each peer's learned endpoint and last handshake time. Endpoint changes are reported to clients for path selection. A peer is considered offline after 300 seconds without a successful handshake.

The subnet is chosen when the network is created. Edge scans its interfaces and existing networks, avoids conflicts, prefers CGNAT candidates such as `100.64.1.0/24` through `100.65.2.0/24`, and then falls back to common private ranges.

## 4. Can the relay see plaintext?

Yes.

Every link is encrypted by WireGuard, so no plaintext travels the public Internet. At Edge, however, the packet is decrypted and then encrypted again. There is no end-to-end session; there are two independent sessions—member to Edge and Edge to the other member. Edge therefore sees the contents. This is a trusted relay, not a ciphertext-only relay such as Tailscale's.

Three properties make the trade-off acceptable here:

- Edge runs on the user's own server, not ours. Who can see the data depends on where you deploy the relay.
- Member private keys stay local. Only the handshake peer changes from another member to Edge; the design introduces no private key system.
- The relay carries only traffic that cannot connect directly. Once a direct path works, it is removed from the relay. Point-to-point is the normal state; the relay is the fallback.

If your requirements forbid the relay from seeing contents, choose a ciphertext-only design like DERP. That is a future direction for higher-security deployments, not something currently implemented.

## 5. What to verify when deploying

Edge configuration is small:

```yaml
proxy:
  wireguard:
    enabled: true
    relay_enabled: true                # whether this Edge relays traffic
    forwarder_strategy: "kernel"       # kernel (default) or ebpf
```

Three host-level conditions are normally handled by Edge at startup, but they belong on a deployment checklist:

```bash
sysctl net.ipv4.ip_forward                 # must be 1, or the kernel will not forward
sysctl net.ipv4.conf.all.rp_filter         # must be 0
sysctl net.ipv4.conf.wg-yat0-xxx.rp_filter # must also be 0; the kernel uses the larger value
```

Known limits: the relay supports Linux and IPv4 only. Members behind the same NAT prefer a LAN direct connection instead of traversing the public relay.

## 6. Summary

- The relay is an ordinary WireGuard member, and each network uses one UDP port.
- The relay can see plaintext; the trust boundary is the Edge host you deploy.
- Kernel forwarding depends on `ip_forward`, `rp_filter`, and the FORWARD firewall. The next two articles cover the kernel and eBPF implementations.

## Related reading

The two forwarding implementations have separate articles:

- [WireGuard relay forwarding, part 1: kernel ip_forward and the nftables forward chain](./how-relay-wg-kernel-forward.md)
- [WireGuard relay forwarding, part 2: redirecting packets at TC ingress with eBPF](./how-relay-wg-ebpf-forward.md)
- [WireGuard networking guide](/guide/wireguard-networking)
- [Edge WireGuard configuration](/guide/edge/wireguard)
