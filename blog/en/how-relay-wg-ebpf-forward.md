---
title: "WireGuard relay forwarding, part 2: redirecting packets at TC ingress with eBPF"
date: 2026-11-24
author: YAT Team
description: "The eBPF forwarding implementation on a relay node: TC and clsact, why bpf_redirect flags must be 0, what this path bypasses, and the assumptions it adds."
excerpt: "eBPF forwarding puts the relay decision in a TC ingress program and does not depend on a FORWARD chain that other software can rewrite. It costs more privileges, narrower protocol coverage, and harder failure diagnosis."
tags:
  - WireGuard
  - Relay
  - eBPF
  - Linux kernel
publish: true
layout: doc
sidebar: true
aside: false
pageClass: blog-post
---

[Part 1](./how-relay-wg-kernel-forward.md) lets the kernel forward: enable `ip_forward`, disable `rp_filter`, and accept the traffic in an nftables forward chain. This article takes another path: intercept the packet before the protocol stack and send it directly back to the interface egress.

The path is:

```
UDP 58021 receives ciphertext → decapsulation (kernel WireGuard decrypts)
                              → plaintext reaches TC ingress on the interface
                                                          │ BPF program attached here
                                                          │ bpf_redirect(ifindex, 0)
                                                          ▼
                                Interface egress qdisc → wg_xmit()
                                → re-encryption (kernel WireGuard) → B
```

The packet does not consult the routing table, enter netfilter's FORWARD hook, enter conntrack, or leave the kernel.

Scope first: [part 1](./how-relay-wg-kernel-forward.md) splits relay processing into decapsulation, forwarding, and re-encapsulation. This path replaces only forwarding. Kernel WireGuard still decrypts with A's session key, verifies the tag and counter, and encrypts with B's session key. After `bpf_redirect` submits the packet, it still goes through the same `wg_xmit()`.

The distinction is where the forwarding decision lives. The kernel path depends on one global switch, two `rp_filter` settings, and a shared FORWARD hook. Those are machine-wide state. Docker restarting containers, `ufw reload`, or a security agent refreshing rules can change them without notice. The eBPF path embeds the decision in its own program: it reads no global switch and does not traverse FORWARD.

You only need a rough idea of TC and qdisc; the next section defines them.

## Three concepts: TC, clsact, and SchedCLS

**TC (Traffic Control)** is Linux's framework for device receive and transmit processing. Every device has a queue tree. On egress, the root qdisc decides queueing—where rate limiting attaches. Ingress normally does little.

**clsact** is a special qdisc whose only job is to provide `ingress` and `egress` classifier attachment points. Its handle is fixed at `ffff:0` and does not conflict with the egress root qdisc. Therefore a BPF program at ingress can coexist with HTB rate limiting at egress. clsact must be present before anything is attached to ingress.

**`BPF_PROG_TYPE_SCHED_CLS`** (`ebpf.SchedCLS` in Go) runs at these attachment points. Its input is a `__sk_buff`; its return value is a TC action:

| Return value | Meaning |
|---|---|
| `TC_ACT_OK` (0) | Continue the normal packet path |
| `TC_ACT_SHOT` (2) | Drop |
| `TC_ACT_REDIRECT` (7) | Submitted elsewhere by `bpf_redirect` |

In DirectAction mode, the program return value is the TC verdict. Without it, the return value is only a classification result and a configured police action or classid decides the next step. Edge uses DirectAction.

`bpf_redirect(ifindex, flags)` submits the packet to the target device's transmit path and returns `TC_ACT_REDIRECT`. The parameters are covered below.

## Attachment

```
Start():
  link = netlink.LinkByName(ifName)
  link.Type() != "wireguard"            → return an error; do not guess other types
  cfg.IfIndex = link.Attrs().Index      ← used by every packet decision
  cfg.MTU     = link.Attrs().MTU

  statsMap = ebpf.NewMap(...)           HashMap keyed by source address
  prog     = ebpf.NewProgram(...)       loaded only if the verifier accepts it

  QdiscAdd(clsact)                      reuse EEXIST; abort on other errors
  FilterAdd(BpfFilter{
      Parent: HANDLE_MIN_INGRESS, Priority: 1, Handle: 1,
      Protocol: ETH_P_ALL, DirectAction: true, Name: "yat_redirect",
  })                                    CREATE|EXCL: fail if occupied; never replace another filter

Stop():
  FilterDel → prog.Close → map.Close
```

Three details matter.

**Check the interface type.** The logic is valid only on WireGuard: ingress carries decrypted plaintext IP, egress carries plaintext IP awaiting encryption. Other device types have different semantics.

**Wait for netlink acknowledgements.** Qdisc and filter changes use acknowledged requests. With non-blocking receive, `Recvfrom` can treat `EAGAIN` as success and hide a rule that was never installed—very difficult to diagnose.

**Use priority 1, not 100.** Filters on the same hook run from low to high. The forwarding program owns 1 and the standalone counting program owns 10: decide first, then count. Kernel forwarding does not count by itself; the eBPF forwarding program does.

## Program decisions

The program has no loops or packet-time table lookups. Network, mask, relay address, interface index, and MTU are immediate values written at load time. "Return to the stack" means returning `TC_ACT_OK`:

| Order | Check | If it fails |
|---|---|---|
| 1 | Are the first 20 bytes readable? | Return to stack |
| 2 | Is the first byte `0x45` (IPv4, no options)? | Return to stack |
| 3 | Are source and destination both in this network? | Return to stack |
| 4 | Is the destination the relay itself? | Return to stack (traffic for the relay) |
| 5 | Is it multicast, broadcast, or a network address? `/31` and `/32` skip the network-address check. | Return to stack |
| 6 | Is TTL already ≤ 1? | Return to stack (let the stack send ICMP time exceeded) |
| 7 | Header < 20 or total length > `skb->len` | Drop |
| 8 | Total length ≠ `skb->len` (padding) or > MTU | Return to stack |
| 9 | Validate the ones-complement IPv4 checksum | Drop |
| 10 | Decrement TTL, update checksum, `bpf_redirect(ifindex, 0)`, update source counters | — |

The equivalent pseudocode is:

```
data     = skb->data          // __sk_buff offset 76
data_end = skb->data_end      // __sk_buff offset 80
if data + 20 > data_end { return TC_ACT_OK }

version_ihl = *data                       // must be 0x45: IPv4, 20-byte header
                                          // no Ethernet header after decapsulation
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

data[8] -= 1                              // equivalent to ip_decrease_ttl()
data[10..12] += 0x100 and fold into 16 bits // incremental checksum update
return bpf_redirect(IFINDEX, 0)
```

Three details are easy to miss.

**Validate the header checksum.** `ip_rcv` normally does it. This path bypasses that entry, so an invalid header would otherwise travel all the way to B and be rejected there—a "it looks like forwarding, but it does not work" problem.

**Decrement TTL and update the checksum.** The relay is a router. Without a TTL decrement, loops can persist. The checksum must follow, or B receives an invalid packet. Since only the TTL byte changes, incremental correction avoids recomputing the full checksum.

**Repeat bounds checks.** The BPF verifier rejects unchecked pointer movement. `data` and `data_end` are fixed `__sk_buff` fields (76 and 80); `skb->len` is at offset 0 and includes nonlinear data.

## bpf_redirect's second argument must be 0

`flags = 0` sends to the target device's **egress**: `dev_queue_xmit`, the egress qdisc, then `ndo_start_xmit`. For WireGuard that is `wg_xmit`—exactly the intended path.

`flags = BPF_F_INGRESS` sends to the target device's **ingress**. The target is the same interface, so the packet returns to this program and loops.

Two alternatives look plausible but are wrong:

- **`bpf_redirect_peer`**: requires the target to be a peer device in another network namespace, typically opposite ends of a veth pair. Both sides of our WireGuard interface are in one netns, so there is no such peer. Its return value must also be checked in the program, and successful submission still does not guarantee WireGuard transmission or peer reception.
- **`bpf_clone_redirect`**: clones the packet and leaves the original continuing through the stack. We need one packet on a different path, already modified for TTL and checksum; cloning adds work without solving anything.

The final choice is therefore `bpf_redirect(ifindex, 0)`, with bookkeeping performed by the program.

## What is bypassed, and what it costs

Both paths together:

```
Kernel path: decrypt → ip_rcv → routing and rp_filter → ip_forward
             → FORWARD(nftables) → ip_output → qdisc → wg_xmit
eBPF path:   decrypt → TC ingress → bpf_redirect → qdisc → wg_xmit
```

eBPF avoids `ip_forward`, `rp_filter`, route lookup, and FORWARD. Docker, `ufw`, `firewalld`, or a security agent changing FORWARD cannot affect this matched traffic. The saved protocol-stack work is small relative to WireGuard encryption; the more important gain is a narrower dependency boundary.

The observability trade-off is that netfilter-based tools cannot see this path:

- `nft list table ip yat_relay`: belongs only to the kernel path. On eBPF there is no such table, which is normal.
- `conntrack -E`: eBPF forwarding creates no connection-tracking entry.
- Netfilter-based traffic accounting and alerts do not count it.
- `tc -s filter show dev <interface> ingress` proves the filter is running; the program lacks branch counters, so this alone does not prove that a given packet was redirected.

The program takes over only traffic it accepts. IPv6, IPv4 options, fragments, and cross-network destinations return to the stack. If those truly need forwarding, they still use the kernel path from part 1. Selecting `ebpf` does not mean the host no longer needs `ip_forward`; it means the main relay path no longer depends on it.

Per-member statistics have another issue: after redirect, the forwarding program only looks up an existing key and never creates one. No other code precreates keys in the current implementation, so this source-address hash map stays empty and Edge's aggregated `Forwarded` value is therefore unusable. To confirm forwarding, test connectivity on member B and inspect `wg show wg-yat0-xxx transfer`.

## Prerequisites and limits

- Requires root plus `CAP_BPF` and `CAP_NET_ADMIN`—more than the kernel path, not less.
- Minimum kernel is 5.8; `CAP_BPF` separated from `CAP_SYS_ADMIN` in 5.8.
- Build with `go build -tags ebpf`. Default builds exclude this code. Configuring `ebpf` then returns "unavailable" instead of silently falling back.
- Only option-free IPv4 is handled. Fragments and multicast are not taken over, and ICMP error messages are not generated.
- Instructions are generated in Go with `cilium/ebpf/asm`, so clang/LLVM and a prebuilt `.o` are unnecessary. The cost is assembly-like code whose changes must respect verifier rules.
- Rate limiting still works: HTB attaches to root qdisc `1:`, and redirected packets traverse the egress qdisc.
- Debugging is harder. When the verifier rejects a load, there is only an error code. Inspect `bpftool prog dump xlated` or generate another program with counters. Every match-condition change is a reload, not a rule edit.

## When to use it

eBPF has higher privilege requirements. The reason to choose it is isolation from host firewall state:

- Will FORWARD be rewritten repeatedly? Docker reorders rules as containers and daemons restart; `ufw`, `firewalld`, and EDR agents do too. The kernel path requires every relevant firewall to allow the flow; eBPF does not depend on FORWARD.
- Does conntrack growth matter? Kernel forwarding creates an entry per flow. Many members and long-lived connections grow the table; a full table rejects new flows. eBPF creates none.
- How valuable is observability? The kernel path has nft counters, `conntrack -E`, and `tcpdump` at each stage. eBPF can still capture on the interface, but nft and conntrack cannot see it; internal behavior mainly requires `tc -s filter` and `bpftool`.

The default remains `kernel`. Keep `ebpf` for hosts where the first two conditions are real, not as "the faster option."

## Verification

```bash
# Is the program/filter attached, and how many packets did it see?
tc -s filter show dev wg-yat0-xxx ingress

# BPF programs registered in the kernel
bpftool prog list | grep yat_

# Did it really reach the peer? Check relay interface counters and source addresses on B.
ip -s link show wg-yat0-xxx
wg show wg-yat0-xxx
```

The `bpf` line in `tc` output, including its program name and run count, is the clearest evidence that the filter is alive. It counts invocations, not accepts, drops, redirects, or packets received by B. Final confirmation comes from member-side connectivity and WireGuard transfer counters.

## Related reading

- [Cross-site networking: why we use Edge as a WireGuard peer relay](./how-relay-wg.md)
- [WireGuard relay forwarding, part 1: kernel ip_forward and the nftables forward chain](./how-relay-wg-kernel-forward.md)
- [Edge WireGuard configuration](/guide/edge/wireguard)

## References

- [Cilium ebpf](https://github.com/cilium/ebpf) — Go loader and `asm` instruction construction
- [eBPF helper: `bpf_redirect`](https://docs.ebpf.io/linux/helper-function/bpf_redirect/) — flag semantics
- [LARTC: Traffic Control filters](https://lartc.org/howto/lartc.qdisc.filters.html) — relationship among qdisc, class, and filter
