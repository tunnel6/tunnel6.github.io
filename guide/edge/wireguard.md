# Edge WireGuard Configuration Guide

> Enable and configure WireGuard networking on Edge servers

---

## 📋 Overview

Edge servers support WireGuard networking, acting as relay nodes to forward traffic for network members. Once enabled, the Edge automatically creates WireGuard interfaces, manages peers, and handles forwarding.

> 📖 For detailed networking guide, see [WireGuard Networking Guide](../wireguard-networking.md#self-hosted-edge-configuration)

---

## System Requirements

| Item | Requirement | Notes |
|------|-------------|-------|
| **OS** | Linux | Only Linux supports WireGuard relay |
| **Kernel** | 5.6+ (kernel strategy) / 5.8+ (ebpf strategy, experimental) | WireGuard module + nftables / eBPF |
| **Privileges** | root | Required for creating network interfaces and setting kernel parameters |

Check kernel version:

```bash
uname -r
# Example output: 5.15.0-91-generic → meets both 5.6+ and 5.8+ requirements
```

---

## Kernel Configuration Reference

The Edge **automatically detects and configures** the following kernel parameters and modules on startup — usually no manual intervention is needed:

### Kernel Modules

| Module | Purpose | Check |
|--------|---------|-------|
| `wireguard` | WireGuard interface creation (built-in since Linux 5.6) | `lsmod \| grep wireguard` |
| `nf_tables` | nftables firewall rules (required by kernel strategy) | `nft list tables` |

### Sysctl Parameters

| Parameter | Value | Purpose | Configured by |
|-----------|-------|---------|---------------|
| `net.ipv4.ip_forward` | `1` | Enable IP forwarding, prerequisite for peer-to-peer relay | Edge auto-sets |
| `net.ipv4.conf.all.rp_filter` | `0` | Disable global reverse path filtering | Edge auto-sets |
| `net.ipv4.conf/<wg-iface>/rp_filter` | `0` | Disable per-interface reverse path filtering | Edge auto-sets |

::: warning
The effective `rp_filter` value is `max(all/rp_filter, <if>/rp_filter)` — both must be 0. Edge handles this automatically, but if you've manually set `all/rp_filter`, please verify it's been restored to 0.
:::

### Kernel Feature Dependencies (by Forwarding Strategy)

| Feature | kernel strategy (default) | ebpf strategy |
|---------|---------------------------|---------------|
| WireGuard module | ✅ Required | ✅ Required |
| nftables | ✅ Required | ❌ Not needed |
| netlink (rtnetlink) | ✅ Required | ✅ Required |
| TC + BPF (cls_bpf) | ✅ Required (per-peer traffic stats) | ❌ Not needed |
| eBPF + `bpf_redirect_peer` | ❌ Not needed | ✅ Required (Linux 5.8+, experimental) |
| `ip_forward` | ✅ Required | ❌ Not needed (bypasses kernel forwarding) |

---

## Configuration Parameters

### YAML Configuration (config.yaml)

```yaml
proxy:
  wireguard:
    enabled: true                    # Enable WireGuard functionality
    relay_enabled: true              # Enable relay forwarding
    public_endpoint: "edge.example.com"  # Edge public address (no port)
    listen_port_base: 58021          # WG interface listen port base
    forwarder_strategy: "kernel"     # Forwarding strategy: kernel (default) | ebpf (experimental, requires Linux 5.8+)
```

For complete WireGuard config items, see [Config Reference](./config-reference.md#4-4-wireguard-proxy-wireguard).

### CLI Flags

| Flag | Default | Description |
|------|---------|-------------|
| `--channel.wireguard.enable` | `true` | Enable WireGuard functionality |
| `--channel.wireguard.relay_enabled` | `false` | Enable Edge-hosted WireGuard relay |
| `--channel.wireguard.public_endpoint` | Same as `--public` | WireGuard relay public address |

::: warning
CLI flags take priority over YAML configuration and cached startup config. If set via CLI, the value overrides configuration file settings.
:::

---

## Firewall & Ports

Edge WireGuard requires the following UDP ports to be open:

| Port Range | Purpose | Notes |
|------------|---------|-------|
| `58021+` | WG interface listen port | One port per network |

::: tip
Edge relay uses kernel forwarder to forward traffic within the same WG interface.
No additional per-peer relay ports needed. Just allow the WG interface ports.
:::

```bash
# UFW method
sudo ufw allow 58021:58100/udp   # WG interface ports

# iptables method
sudo iptables -A INPUT -p udp --dport 58021:58100 -j ACCEPT
```

---

## Auto-Managed Kernel Parameters & nftables Rules

The Edge kernel forwarder **automatically** handles the following on startup — no manual intervention required:

**Kernel Parameters**:
- `net.ipv4.ip_forward = 1` — Enable IP forwarding
- `net.ipv4.conf/<wg-iface>/rp_filter = 0` — Disable reverse path filtering

**nftables Rules** (table name `yat_relay`):

```nft
table ip yat_relay {
    chain forward {
        type filter hook forward priority mangle; policy accept;
        iifname "wg-yat0-xxx" oifname "wg-yat0-xxx" ip daddr <cidr> accept  /* yat-relay:wg-yat0-xxx */
    }
}
```

::: tip
The nftables rules consist of a single FORWARD ACCEPT rule at mangle priority (-150),
which runs before iptables-nft's filter chain (priority 0) to ensure same-interface
forwarded traffic is accepted. Each rule carries a `/* yat-relay:<ifName> */` comment
for easy identification and cleanup.
:::

---

## Deployment Verification

```bash
# 1. Check Edge logs
journalctl -u edge -f | grep -i wireguard
# Expected:
# "WireGuard functionality enabled"
# "kernel forwarder started: iface=wg-yat0-xxx"

# 2. Check WireGuard interfaces
sudo ip link show | grep wg-yat
# Expected: wg-yat0-xxx: <POINTOPOINT,NOARP,UP,LOWER_UP> mtu 1420

# 3. Check nftables rules
sudo nft list table ip yat_relay
# Expected: forward chain with /* yat-relay:wg-yat0-xxx */ comment on the rule

# 4. Check kernel parameters
cat /proc/sys/net/ipv4/ip_forward   # Should be 1
```

---

## Troubleshooting

### IP Forwarding Not Enabled

**Symptom**: Peers cannot communicate, nft counter is 0

**Cause**: Edge automatically sets `ip_forward`, but the write may fail in some environments (e.g., insufficient container privileges)

```bash
# Manually enable IP forwarding
sudo sysctl -w net.ipv4.ip_forward=1

# Persist
echo 'net.ipv4.ip_forward=1' | sudo tee -a /etc/sysctl.conf
```

### Docker Host iptables Interference

**Symptom**: nftables rules are installed and nft counter shows packets, but peer forwarding still fails

**Background**: Edge's nftables rule ACCEPTs at FORWARD hook priority mangle (-150),
which normally **terminates the entire hook evaluation** — subsequent iptables-nft
filter chains (priority 0) including Docker's `DOCKER-USER` chain are never reached.
However, if the system uses **iptables-legacy** (based on x_tables, a completely
separate kernel path from nftables), the nftables ACCEPT cannot prevent legacy rules
from dropping packets.

**Diagnostic Steps**:

```bash
# 1. Identify iptables backend: nft or legacy
sudo iptables -V
# Output contains "nf_tables" → iptables-nft (nftables ACCEPT takes effect)
# Output contains "legacy"     → iptables-legacy (additional handling needed)

# 2. Check DOCKER-USER chain policy and rules
sudo iptables -L DOCKER-USER -v -n
# Look for: Is Policy DROP? Are there DROP rules targeting wg-yat0?

# 3. Check FORWARD chain for DROP rule hits
sudo iptables -L FORWARD -v -n | grep -E 'DROP|REJECT|wg-yat'

# 4. Check if nftables rules are being hit (counter growing)
sudo nft list table ip yat_relay
# If packets counter keeps growing, nftables layer has already ACCEPTed

# 5. If nft counter grows but packets are still dropped, iptables-legacy is the cause
#    Confirm with logging:
sudo iptables -A FORWARD -i wg-yat0-xxx -o wg-yat0-xxx -d <cidr> -j LOG --log-prefix "YAT-FWD: "
# Then ping test and check: dmesg | grep YAT-FWD
```

**Solutions**:

```bash
# Option A: Add ACCEPT to DOCKER-USER (works for both iptables-nft and iptables-legacy)
sudo iptables -I DOCKER-USER -i wg-yat0-xxx -o wg-yat0-xxx -d <cidr> -j ACCEPT
# Note: DOCKER-USER chain is rebuilt on Docker restart; persistence is needed

# Option B: Switch to iptables-nft (recommended)
sudo update-alternatives --set iptables /usr/sbin/iptables-nft
sudo update-alternatives --set ip6tables /usr/sbin/ip6tables-nft
# After switching, Docker and nftables share the same kernel path,
# so nftables ACCEPT takes effect

# Option C: Disable Docker's iptables management
# Add to /etc/docker/daemon.json:
# { "iptables": false }
# Then restart Docker: sudo systemctl restart docker
# Warning: This disables all Docker iptables rules; container port mappings
# must be configured manually
```

### Kernel Version Doesn't Support WireGuard

**Symptom**: Edge startup fails with "WireGuard initialization failed"

```bash
# Check kernel version
uname -r

# If < 5.6, upgrade kernel
sudo apt install linux-image-generic
sudo reboot
```

---

## 🔗 Related Documentation

- [Edge Server Management](./management.md) — Deploy and manage Edge
- [WireGuard Networking Guide](../wireguard-networking.md) — Complete WireGuard networking guide
- [Config Reference](./config-reference.md) — YAML configuration reference
- [Startup Parameters](./startup-params.md) — Command-line parameter reference

---

*YAT Team - Making intranet penetration simpler*
