# Transport Modes and Protocols

> Learn about transport modes supported by YAT, choose the most suitable solution

---

## 📋 Table of Contents

- [Transport Modes Overview](#transport-modes-overview)
- [Relay Mode](#relay-mode)
- [P2P Direct Connection Mode](#p2p-direct-connection-mode)
- [WireGuard Mode](#wireguard-mode)
- [Mode Comparison](#mode-comparison)
- [How to Choose](#how-to-choose)
- [FAQ](#faq)

---

## Transport Modes Overview

### What is Transport Mode?

Transport mode determines how data is transmitted between client and Edge server.

YAT supports three transport modes:

1. **Relay** - Forward through Edge server
2. **P2P (Peer-to-Peer)** - Direct device connection
3. **WireGuard** - VPN tunnel

### Underlying Protocol

All modes use **mTLS over TCP** as underlying transport:

- ✅ Mutual TLS authentication
- ✅ Encrypted transmission
- ✅ Prevent man-in-the-middle attacks

---

## Relay Mode

### Working Principle

```
Client A ──mTLS──► Edge Server ──mTLS──► Client B
```

All traffic is relayed through Edge server.

### Features

| Feature | Description |
|---------|-------------|
| **Latency** | Medium (adds Edge round-trip time) |
| **Bandwidth** | Limited by Edge bandwidth |
| **Stability** | High (Edge usually has stable network) |
| **NAT Traversal** | No traversal needed |
| **Firewall** - Only Edge needs open ports |

### Use Cases

- ✅ Cross-region access
- ✅ Complex network environment
- ✅ Requires high stability
- ✅ Web services (HTTP/HTTPS)

### Configuration

Select **Relay** mode when creating tunnel:

> 📸 ![Transport mode selection](./images/snapshot-tunnel-create-02.png) Transport Mode Selection
> 
> Description: Shows Relay/P2P/WireGuard options

---

## P2P Direct Connection Mode

### Working Principle

```
Client A ──mTLS──► Client B (Direct)
         ▲
         │
      Edge (Coordination only)
```

Edge only handles initial connection coordination, subsequent traffic is direct.

### NAT Traversal

P2P mode uses **ICE/STUN/TURN** technology for NAT traversal:

1. **STUN** - Get public IP
2. **ICE** - Candidate address collection
3. **TURN** - Fallback to relay when traversal fails

### Features

| Feature | Description |
|---------|-------------|
| **Latency** | Low (direct, no relay) |
| **Bandwidth** | High (limited by both ends) |
| **Stability** | Medium (depends on NAT type) |
| **NAT Traversal** | Requires traversal |
| **Firewall** | May need configuration |

### Use Cases

- ✅ LAN or same region
- ✅ Requires low latency (remote desktop)
- ✅ Large file transfers
- ✅ Audio/video streaming

### NAT Type Compatibility

| NAT Type | P2P Success Rate |
|----------|------------------|
| Full Cone | ✅ High |
| Restricted Cone | ✅ Medium |
| Port Restricted | ⚠️ Low |
| Symmetric | ❌ Very low |

---

## WireGuard Mode

### Working Principle

```
Client A ──WireGuard──► Virtual NIC ──Forward──► Local Service
                                    ▲
                                    │
                                 Edge (Coordination)
```

Uses WireGuard VPN to establish virtual LAN.

### Features

| Feature | Description |
|---------|-------------|
| **Latency** | Low |
| **Bandwidth** | Very high |
| **Stability** | High |
| **Security** | Very high (kernel-level encryption) |
| **Configuration Complexity** | Medium |

### Use Cases

- ✅ Large file transfers
- ✅ Database synchronization
- ✅ Multi-service access
- ✅ Requires virtual LAN

### Configuration Requirements

**Edge Server**:
```bash
# Install WireGuard
sudo apt install wireguard

# Load kernel module
sudo modprobe wireguard
```

**Client**:
- macOS: Install WireGuard.app
- Windows: Install WireGuard
- Linux: Install wireguard-tools

---

## Mode Comparison

### Performance Comparison

| Mode | Latency | Bandwidth | CPU Usage |
|------|---------|-----------|-----------|
| **Relay** | 50-200ms | 10-100Mbps | Medium |
| **P2P** | 5-50ms | 100-1000Mbps | Low |
| **WireGuard** | 5-30ms | 500-2000Mbps | Very low |

### Compatibility Comparison

| Mode | NAT Traversal | Firewall | Mobile Network |
|------|---------------|----------|----------------|
| **Relay** | ✅ Not needed | ✅ Friendly | ✅ Supported |
| **P2P** | ⚠️ Required | ⚠️ May be blocked | ⚠️ Unstable |
| **WireGuard** | ⚠️ Required | ⚠️ UDP 443 | ✅ Supported |

### Protocol Support

| Mode | HTTP | TCP | UDP | WireGuard |
|------|------|-----|-----|-----------|
| **Relay** | ✅ | ✅ | ✅ | ✅ |
| **P2P** | ✅ | ✅ | ✅ | ❌ |
| **WireGuard** | ✅ | ✅ | ✅ | ✅ |

---

## How to Choose

### Decision Tree

```
Need low latency?
├─ Yes → Same region?
│       ├─ Yes → P2P mode
│       └─ No → WireGuard mode
└─ No → Need high stability?
        ├─ Yes → Relay mode
        └─ No → P2P mode
```

### Recommended Configuration

| Scenario | Recommended Mode | Reason |
|----------|------------------|--------|
| **Web Service** | Relay | Stable, good compatibility |
| **Remote Desktop** | P2P | Low latency |
| **Database** | WireGuard | High bandwidth, secure |
| **File Transfer** | WireGuard | Fast speed |
| **API Debugging** | Relay | Simple and easy to use |
| **Game Server** | P2P | Low latency |

### Auto Fallback

YAT supports auto fallback mechanism:

```
P2P attempt failed
  ↓
Fallback to Relay
  ↓
Maintain connection
```

---

## FAQ

### Q: How to switch transport mode?

Currently **does not support** runtime switching. Need to:
1. Stop tunnel
2. Delete tunnel
3. Recreate and select new mode

### Q: What to do when P2P mode connection fails?

**Reason**: NAT traversal failed

**Solution**:
1. Check NAT type
2. Try on same network
3. Use Relay mode as backup

### Q: Does WireGuard mode require additional configuration?

**Yes**:
1. Install WireGuard
2. Open UDP port (default 51820)
3. Configure firewall

### Q: Which mode is most secure?

**WireGuard > P2P > Relay**

- WireGuard: Kernel-level encryption, strictly audited
- P2P: mTLS encrypted, direct no relay
- Relay: mTLS encrypted, but through Edge

### Q: Which mode to use on mobile network?

Recommend **Relay** or **WireGuard**:
- Mobile network NAT type complex, P2P success rate low
- WireGuard well-optimized for mobile networks

---

## 💡 Best Practices

### 1. Try P2P First

P2P mode has best performance, recommend trying first.

### 2. Prepare Fallback Plan

If P2P fails, auto fallback to Relay.

### 3. Test Network Environment

```bash
# Test NAT type
# Use online tool: https://test-ipv6.com/

# Test bandwidth
speedtest-cli

# Test latency
ping edge.myroxy.dev
```

### 4. Monitor Performance

Regularly monitor tunnel performance:
- Latency
- Bandwidth
- Packet loss rate

---

## 📚 Related Documentation

- [Tunnel Management](./tunnel-management.md) - Select mode when creating tunnel
- [Apps and Extensions](./apps-and-extensions.md) - Recommended modes for different apps
- [FAQ](./faq.md) - Transport-related issues

---

*YAT Team - Making intranet penetration simpler*
