# WireGuard Networking Guide

> Build virtual LANs with WireGuard for secure device interconnection

---

## 📋 Table of Contents

- [What is WireGuard Networking](#what-is-wireguard-networking)
- [Quick Start](#quick-start)
- [Advanced Optimization](#advanced-optimization)
- [Self-Maintained Edge Configuration](#self-maintained-edge-configuration)
- [Troubleshooting](#troubleshooting)
- [Platform-Specific Guides](#platform-specific-guides)

---

## What is WireGuard Networking

### Core Concepts

WireGuard networking is YAT's advanced networking feature that uses the WireGuard protocol to establish virtual LANs (VPNs) between multiple devices. Unlike traditional tunnel modes, WireGuard networking provides:

- 🌐 **Virtual LAN** - All members share the same IP subnet
- 🔐 **End-to-end encryption** - WireGuard kernel-level encryption
- 🚀 **High performance** - Near-native network performance
- 🔄 **Smart routing** - Automatic direct or relay path selection

### How It Works

```
┌─────────────────────────────────────────────────────┐
│                  WireGuard Network                   │
│                                                     │
│  ┌──────────┐         ┌──────────┐                 │
│  │ Device A │◄───────►│ Device B │                 │
│  │ 10.0.0.2 │ direct  │ 10.0.0.3 │                 │
│  └──────────┘   or    └──────────┘                 │
│       │        relay       │                        │
│       │                    │                        │
│       ▼                    ▼                        │
│  ┌──────────┐         ┌──────────┐                 │
│  │ Device C │◄───────►│ Device D │                 │
│  │ 10.0.0.4 │         │ 10.0.0.5 │                 │
│  └──────────┘         └──────────┘                 │
│                                                     │
│  Edge Server: Coordination + Relay (optional)      │
└─────────────────────────────────────────────────────┘
```

### Comparison with Tunnel Mode

| Feature | Tunnel Mode | WireGuard Networking |
|---------|-------------|---------------------|
| **Connection** | Point-to-point tunnel | Virtual LAN |
| **IP Assignment** | None | Automatic subnet IP |
| **Multi-device** | Multiple tunnels needed | Native support |
| **Performance** | Medium | Near-native |
| **Use Case** | Single service exposure | Multi-device interconnection |

---

## Quick Start

### Prerequisites

- ✅ YAT client installed and logged in
- ✅ Subscribed to a WireGuard-enabled Edge server
- ✅ Edge server has WireGuard functionality enabled (see [Edge Management - Enable WireGuard](./edge-management.md#enable-wireguard))

### Step 1: Create a WireGuard Network

1. Open YAT client, go to **Networks** page
2. Click **Create Network** button
3. Fill in network configuration:
   - **Network Name**: Custom name (e.g., "My Office Network")
   - **CIDR**: Recommended `10.0.0.0/24` (supports 254 devices)
   - **Relay Mode**: Choose `optional` (recommended) or `force`

> 📸 ![Networking snapshot](/images/guide/snapshot-networking-create-en.png) Create WireGuard network dialog
> 
> Description: Shows network name, CIDR input, relay mode selection

4. Click **Create** to complete

### Step 2: Join Local Device

After creating the network, add your current device:

1. Click **Join Local Device** button on the network card
2. Wait for IP address assignment
3. Device status changes to **Online**

> 📸 ![Networking snapshot](/images/guide/snapshot-networkinfo-join-en.png) Network detail page - Join local device button
> 
> Description: Shows network card, join button, member list

::: tip
Each device must click "Join Local Device" separately to participate in the network. This is a security design ensuring only explicitly authorized devices can join.
:::

### Step 3: Invite Other Devices

Steps for other devices to join:

1. Open YAT client on other devices
2. Go to **Networks** page
3. Find the target network (networks under the same Edge sync automatically)
4. Click **Join Network**
5. Wait for IP assignment

### Step 4: Verify Connection

After joining, verify connectivity between devices:

```bash
# Ping device B's internal IP from device A
ping 10.0.0.3

# Should see normal ICMP responses
64 bytes from 10.0.0.3: icmp_seq=1 ttl=64 time=2.5ms
```

> 📸 ![Networking snapshot](/images/guide/snapshot-networkinfo-members-en.png) Network member list - showing online status and IPs
> 
> Description: Shows member list, IP addresses, online status, connection quality

### Step 5: View Connection Details

Click a member to view connection details:

- **Path**: Direct or relay
- **Latency**: Current connection latency
- **Endpoint**: Peer's actual UDP address
- **Handshake Time**: Last WireGuard handshake time

---

## Advanced Optimization

### Relay Mode Selection

YAT supports three relay modes affecting connection strategy:

#### 1. `optional` Mode (Recommended)

```
Device A ──Try direct──► Device B
          │
          ├─ Success → Use direct (low latency)
          │
          └─ Fail → Auto fallback to Edge relay
```

**Features**:
- ✅ Prioritizes direct connection for best performance
- ✅ Automatic fallback to relay if direct fails
- ✅ Suitable for most scenarios

**Use Cases**:
- Mixed network environments (some devices on same LAN)
- Cross-region devices with possible direct connection
- Performance-critical scenarios

#### 2. `force` Mode

```
Device A ──Force relay──► Edge Server ──Relay──► Device B
```

**Features**:
- ✅ Stable connection, unaffected by NAT type
- ⚠️ Higher latency (via Edge relay)
- ⚠️ Bandwidth limited by Edge

**Use Cases**:
- Symmetric NAT environments (direct nearly impossible)
- Stable connection needed, latency not critical
- Debugging and testing

#### 3. `disabled` Mode

```
Device A ──Direct only──► Device B
          │
          └─ Fail → Cannot connect
```

**Features**:
- ✅ Highest performance (pure direct)
- ❌ Cannot communicate if direct fails
- ❌ High NAT type requirements

**Use Cases**:
- All devices on same LAN
- All devices have public IPs
- Extreme performance requirements

### Switching Relay Mode

1. Go to network detail page
2. Click **Settings** or **Edit** button
3. Modify **Relay Mode**
4. After saving, all members sync automatically

> 📸 ![Networking snapshot](/images/guide/snapshot-networkinfo-settting-relay-en.png) Network settings dialog - relay mode selection
> 
> Description: Shows three relay mode options

### Understanding Connection Paths

YAT intelligently selects the optimal path:

#### Endpoint Selection Flowchart

The following diagram shows how YAT determines which endpoint to use for each peer:

```
                    ┌──────────────────────────────────┐
                    │  Edge observes peer's UDP source  │
                    │  from WireGuard handshake          │
                    │  → "observed endpoint"            │
                    │    (e.g. 1.2.3.4:57681)   │
                    └──────────────┬───────────────────┘
                                   │
                    ┌──────────────▼───────────────────┐
                    │  Do both peers share the same     │
                    │  observed public IP?              │
                    │  (same-NAT / same-LAN detection)  │
                    └──────┬───────────────┬───────────┘
                           │               │
                     ┌─YES─┘               └──NO──┐
                     ▼                             ▼
          ┌─────────────────────┐    ┌────────────────────────┐
          │  Edge pushes gather  │    │  Use observed endpoint  │
          │  request to both     │    │  as peer endpoint       │
          │  peers               │    │  (public internet path) │
          └──────────┬──────────┘    └────────────────────────┘
                     │
          ┌──────────▼──────────┐
          │  Client reports its  │
          │  LAN IP + WG port    │
          │  (e.g. 192.168.1.5:  │
          │   51820)             │
          └──────────┬──────────┘
                     │
          ┌──────────▼──────────┐
          │  LAN endpoint valid? │
          │  (not WG TUN IP,    │
          │   not stale)        │
          └──────┬─────────┬───┘
                 │         │
           ┌─YES─┘         └──NO──┐
           ▼                      ▼
  ┌──────────────────┐  ┌────────────────────────┐
  │ Use LAN endpoint  │  │ Fall back to observed   │
  │ for peer          │  │ endpoint                │
  │ (LAN direct path) │  │ (public internet path)  │
  └────────┬─────────┘  └──────────┬─────────────┘
           │                       │
           └───────────┬───────────┘
                       │
          ┌────────────▼────────────┐
          │  WireGuard kernel sends  │
          │  PersistentKeepalive     │
          │  (every 25s)             │
          └────────────┬────────────┘
                       │
          ┌────────────▼────────────┐
          │  Communication working?  │
          └──────┬────────────┬─────┘
                 │            │
           ┌─YES─┘            └──NO──┐
           ▼                         ▼
  ┌──────────────────┐    ┌──────────────────────────┐
  │ ✅ Connected!     │    │  WG kernel auto-corrects  │
  │  Low-latency LAN │    │  endpoint to observed IP   │
  │  or public path  │    │  (self-healing, ≤25s)      │
  └──────────────────┘    └────────────┬─────────────┘
                                       │
                          ┌────────────▼────────────┐
                          │  Still failing?          │
                          │  Relay mode fallback:    │
                          │  optional → relay peer   │
                          │  force → always relay    │
                          │  disabled → no fallback  │
                          └─────────────────────────┘
```

#### Endpoint Types

| Type | Source | Reliability | Example |
|------|--------|-------------|--------|
| **Observed** | Edge sees peer's UDP source IP from WG handshake | ✅ Verified working | `1.2.3.4:57681` |
| **LAN** | Client self-reports via same-NAT gather | ⚠️ Not verified | `192.168.1.100:51820` |
| **Relay** | Edge relay server configuration | ✅ Always available | `edge.example.com:58021` |

#### Self-Healing

When a LAN endpoint turns out to be unreachable, WireGuard's built-in mechanism automatically recovers:

1. Peer sends `PersistentKeepalive` (every 25s) from the **observed** public IP
2. Local WG kernel receives it → automatically updates peer endpoint
3. Communication resumes via the observed (public) path

**Recovery time**: at most 25 seconds (one keepalive cycle) + network latency.

#### Direct Path

```
Device A (192.168.1.100:51820) ──UDP──► Device B (192.168.1.101:51820)
```

**Criteria**:
- WireGuard handshake successful
- Authenticated payload received (not just handshake)
- New data within 75 seconds

**Advantages**:
- Lowest latency
- Highest bandwidth
- No Edge involvement

#### Relay Path

```
Device A ──UDP──► Edge (public-ip:WG-port) ──Kernel Forward──► Device B
```

**Triggers**:
- Direct handshake timeout (30 seconds)
- No direct data (75 seconds)
- Force relay mode

**Edge Relay Mechanism**:
- All peers connect to the same WG interface port
- Edge uses kernel forwarder (nftables + ip_forward) to forward encrypted packets within the same interface
- No additional per-peer relay ports needed

### P2P Session Status & Health Indicators

The health pill at the top of the network detail page reflects the aggregated status of all P2P sessions. Understanding these states helps troubleshoot connection issues.

#### Session Lifecycle

Direct connection negotiation between two devices goes through these stages:

```
Created → Gathering → Punching → Establishing → Connected
                                        ↘ Failed
```

| Stage | Timeout | Description |
|-------|---------|-------------|
| **Gathering** | 30s | Exchange endpoint info (public IP, LAN address, NAT type) |
| **Punching** | 60s | Send WireGuard handshake attempts to peer endpoints |
| **Establishing** | 30s | Wait for peer to confirm punch results |
| **Connected** | - | Negotiation succeeded, direct path available |
| **Failed** | - | Negotiation timed out or punching failed |

#### Health Status Meaning

| Status | Color | Meaning |
|--------|-------|----------|
| **Healthy** | 🟢 Green | All sessions connected |
| **Partial** | 🟠 Orange | Some sessions failed, but relay fallback available or others connected |
| **Error** | 🔴 Red | All sessions failed with no relay fallback |
| **Offline** | ⚪ Gray | No online members |

#### Session Shows Failed But Actually Connected

In some scenarios, the UI shows a session as "failed" but the network is actually working:

- **Why**: P2P signaling (endpoint discovery & punching) and the actual WireGuard crypto handshake are two independent processes. Signaling timeout does not mean the tunnel is broken.
- **Auto-recovery**: Edge's observation loop (every 5 seconds) detects actual WireGuard handshake state. When a working tunnel is detected, failed sessions are automatically recovered to "connected".
- **Recovery delay**: At most 5-10 seconds.

::: tip
If you see "failed" status but `ping` works fine, the WireGuard tunnel is actually established. Wait a few seconds for the UI to auto-update. If it doesn't recover, try clicking the **Refresh** button.
:::

#### Troubleshooting the Health Banner

Expand the health banner to see details of each failed/pending session:

- **Session endpoints**: `{initiator} → {target}`, showing device names
- **Status badge**: Current negotiation stage
- **Error message**: Failure reason (e.g. `timeout`, `direct punch failed`)

Common error messages:

| Error | Meaning | Suggestion |
|-------|---------|------------|
| `timeout` | Negotiation stage timed out | Check NAT type, consider switching to `force` mode |
| `direct punch failed, relay disabled` | Punching failed with no relay | Switch to `optional` mode to enable relay fallback |
| `direct punch failed, relay fallback remains active` | Punching failed but relay available | Normal, traffic is flowing through relay |

### Optimization Tips

#### 1. Devices on Same LAN

If multiple devices are on the same LAN:

- ✅ Use `optional` or `disabled` mode
- ✅ Edge auto-detects Same-NAT devices
- ✅ Devices prioritize LAN address direct connection

> 
> Description: Shows device pairs detected on same NAT

#### 2. Cross-Region Devices

If devices are in different regions:

- ✅ Use `optional` mode
- ✅ Allow automatic relay fallback
- ✅ Consider deploying geographically central Edge

#### 3. Symmetric NAT Environment

If devices are behind symmetric NAT:

- ✅ Use `force` mode
- ✅ All traffic via Edge relay
- ✅ Stable but higher latency

#### 4. Performance-Sensitive Scenarios

For best performance:

- ✅ Ensure devices can connect directly
- ✅ Use `optional` or `disabled` mode
- ✅ Check firewall allows UDP traffic

---

## Self-Maintained Edge Configuration

### Edge WireGuard Requirements

Self-maintained Edge needs WireGuard enabled:

```yaml
# Edge configuration (config.yaml)
proxy:
  wireguard:
    enabled: true              # Enable WireGuard
    relay:
      enabled: true            # Enable business relay
      interface_prefix: "wg-yat0"
      listen_port_base: 58021  # WG interface port base
      key_dir: "/var/lib/yat/wg-keys"
      public_endpoint: "edge.example.com"  # Edge public address
```

### Key Configuration Explained

#### 1. `enabled: true`

Enables WireGuard functionality. Edge will:
- Create WireGuard observation interface
- Initialize relay manager
- Start endpoint observation loop

#### 2. `relay.enabled`

Controls business relay:

- `true`: Enables kernel forwarder relay forwarding (nftables + ip_forward)
- `false`: Only keeps observation interface, no relay support

::: tip
Even with `relay.enabled=false`, Edge can still observe endpoints. Clients just can't use relay paths.
:::

#### 3. `listen_port_base: 58021`

WireGuard interface port base. Each network uses one port:
- Network 1: 58021
- Network 2: 58022
- ...

**Firewall requirements**:
```bash
# Allow WG interface ports
sudo ufw allow 58021:58100/udp
```

#### 4. `public_endpoint`

Edge's public address. Clients use this for relay:

```
Client A ──UDP──► edge.example.com:58021 ──Kernel Forward──► Client B
```

**Format requirements**:
- ✅ `edge.example.com`
- ✅ `1.2.3.4`
- ✅ `1.2.3.4:8000` (if Edge on non-standard port)
- ❌ `http://edge.example.com` (no protocol)

### Deployment Verification

After deploying Edge, verify WireGuard:

```bash
# 1. Check Edge logs
journalctl -u yat-edge -f | grep -i wireguard

# Should see:
# "WireGuard functionality enabled"
# "Relay manager initialized"
# "Observation loop started"

# 2. Check WireGuard interfaces
sudo ip link show | grep wg-yat

# Should see similar:
# wg-yat0-abc123: <POINTOPOINT,NOARP,UP,LOWER_UP> mtu 1420

# 3. Check listening ports
sudo ss -ulnp | grep yat-edge

# Should see:
# udp  0  0  0.0.0.0:58021  0.0.0.0:*  users:(("yat-edge",pid=1234))
```

::: tip
Edge relay uses kernel forwarder to forward traffic within the same WG interface.
No additional per-peer relay ports needed. Just allow the WG interface port.
:::

### Common Configuration Issues

#### Q: Edge fails to start with "WireGuard initialization failed"

**Causes**:
- Kernel doesn't support WireGuard (needs Linux 5.6+)
- Missing permissions to create network interfaces

**Solution**:
```bash
# Check kernel version
uname -r

# If < 5.6, upgrade kernel
sudo apt install linux-image-generic

# Ensure Edge runs as root
sudo systemctl start yat-edge
```

#### Q: Clients can't connect to relay

**Causes**:
- Firewall not allowing ports
- `public_endpoint` misconfigured
- Edge relay not enabled

**Solution**:
```bash
# 1. Check firewall
sudo ufw status
sudo ufw allow 58021:60999/udp

# 2. Verify public_endpoint
curl -I http://edge.example.com

# 3. Check Edge config
grep -A 10 "wireguard:" /etc/yat/config.yaml
```

#### Q: Relay mode switch doesn't take effect

**Causes**:
- Config not synced to all members
- Clients haven't refreshed runtime

**Solution**:
1. Modify relay mode on Edge
2. All clients click **Sync Local Adapter** button
3. Wait 5-10 seconds for config to apply

---

## Troubleshooting

### Issue 1: Need to Manually Click "Join Local Device"

**Symptom**:
After creating network, current device didn't auto-join, need to manually click "Join Local Device".

**Cause**:
This is security design. YAT doesn't auto-add devices to networks, requiring explicit user authorization.

**Solution**:
1. Find **Join Local Device** button on network card
2. Click and wait for IP assignment
3. Device status **Online** means join successful

> 📸![Networking snapshot](/images/guide/snapshot-networking-create-en.png)Join local device button
> 
> Description: Shows join button on network card

### Issue 2: Networking Fails, Try "Sync Local Adapter"

**Symptom**:
Device joined network but can't ping other members.

**Causes**:
- Local WireGuard config not synced
- Helper daemon didn't apply config correctly
- Runtime inconsistent with config

**Solution**:
1. Go to network detail page
2. Find **Sync Local Adapter** button (usually in config panel or action menu)
3. Click and wait for sync to complete
4. Check if WireGuard interface appears

**macOS**:
```bash
# Check WireGuard interfaces
ifconfig | grep -A 5 utun

# Should see similar:
# utun3: flags=8051<UP,POINTOPOINT,RUNNING,MULTICAST> mtu 1420
#     inet 10.0.0.2 --> 10.0.0.1 netmask 0xffffffff
```

**Windows**:
```powershell
# Check network adapters
Get-NetAdapter | Where-Object {$_.InterfaceDescription -like "*WireGuard*"}

# Should see similar:
# Name  InterfaceDescription                  Status
# ----  --------------------                  ------
# YAT   WireGuard Tunnel: yat-network1        Up
```

### Issue 3: macOS WireGuard Debugging

**Symptom**:
WireGuard interface not created or not working on macOS.

**Debug Steps**:

#### 1. Check Helper Daemon

```bash
# Check if yat-wg-helperd is running
ps aux | grep yat-wg-helper

# Should see:
# root  1234  0.0  0.1  /var/run/yat-wg-helperd

# If not running, start manually
sudo /Library/Application\ Support/yat/yat-wg-helperd
```

#### 2. Check Unix Socket

```bash
# Check socket file
ls -l /var/run/yat-wg-helper.sock

# Should see:
# srw-r--r--  1 root  wheel  0  9 18 10:00 /var/run/yat-wg-helper.sock
```

#### 3. View Helper Logs

```bash
# View helper daemon logs
log show --predicate 'process == "yat-wg-helperd"' --last 5m

# Or in YAT client:
# Settings > System > WireGuard Helper > View logs
```

#### 4. View Helper Logs to Confirm Startup

```bash
# macOS: via unified log
log show --predicate 'process == "yat-wg-helperd"' --last 5m

# macOS: view log file directly
tail -f /Library/Logs/YAT/yat-wg-helperd.log

# Windows: view log file
type %ProgramData%\YAT\helper\wireguard\yat-wg-helperd.log

# Or in YAT client:
# Settings > System > WireGuard Helper > View logs
```

::: tip
`yat-wg-helperd` embeds the boringtun engine — there is no separate boringtun process.
Confirm the log shows `started` or successful `apply` messages to verify the helper daemon is running.
:::

#### 5. Manual Helper Test

```bash
# Use socat to communicate with helper
sudo socat - UNIX-CONNECT:/var/run/yat-wg-helper.sock

# Send JSON request
{"request":"status"}

# Should receive response
{"status":"ok","interfaces":["wg-yat0-abc123"]}
```

#### 6. Force Re-apply

```bash
# Remove all WireGuard interfaces
sudo ifconfig utun3 down
sudo ifconfig utun3 destroy

# Click "Sync Local Adapter" in YAT client
# Or restart YAT client
```

### Issue 4: Windows Check Network Adapter Creation

**Symptom**:
WireGuard network not working properly on Windows.

**Check Steps**:

#### 1. Check Network Adapter

```powershell
# Method 1: PowerShell
Get-NetAdapter | Where-Object {$_.InterfaceDescription -like "*WireGuard*"}

# Method 2: Command line
netsh interface show interface

# Method 3: Device Manager
# Open Device Manager > Network adapters > Look for "WireGuard" devices
```

**Expected Result**:
```
Name       InterfaceDescription         Status
----       --------------------         ------
YAT-NET1   WireGuard Tunnel: yat-net1   Up
```

#### 2. Check IP Configuration

```powershell
# View WireGuard adapter IP config
Get-NetIPAddress -InterfaceAlias "YAT-NET1"

# Should see assigned internal IP
# IPAddress      : 10.0.0.2
# PrefixLength   : 24
# AddressFamily  : IPv4
```

#### 3. Check Route Table

```powershell
# View routes
Get-NetRoute -InterfaceAlias "YAT-NET1"

# Should see network subnet route
# DestinationPrefix  NextHop  RouteMetric
# 10.0.0.0/24        0.0.0.0  256
```

#### 4. Test Connectivity

```powershell
# Ping other members
Test-Connection -ComputerName 10.0.0.3 -Count 4

# If fails, check firewall
# Windows Defender firewall may block ICMP
New-NetFirewallRule -DisplayName "Allow ICMP" -Direction Inbound -Protocol ICMPv4 -Action Allow
```

#### 5. Check Wintun Driver

```powershell
# Check Wintun driver (bundled with installer, no manual install needed)
Get-WindowsDriver -Online | Where-Object {$_.ProviderName -like "*Wintun*"}

# Driver should be ready after installing YAT client
# If missing, rerun the YAT installer to repair
```

#### 6. Restart WireGuard Service

```powershell
# Stop YAT client
Stop-Process -Name "YAT"

# Remove WireGuard adapter
Remove-NetAdapter -Name "YAT-NET1" -Confirm:$false

# Restart YAT client
Start-Process "C:\Program Files\YAT\YAT.exe"

# Wait 10 seconds, check if adapter recreated
Get-NetAdapter | Where-Object {$_.InterfaceDescription -like "*WireGuard*"}
```

### Issue 5: Observe Same-NAT LAN Success

**Symptom**:
Two devices on same LAN (Same-NAT), unsure if successfully using LAN address for direct connection.

**Observation Methods**:

#### 1. View Member Details

In YAT client:
1. Go to network detail page
2. Click target member
3. View **Connection Info**

**Expected to see**:
```
Path: direct
Endpoint: 192.168.1.101:51820  (LAN address)
Latency: < 5ms
```

If Endpoint is public IP, LAN address not used.

#### 2. Check Edge Logs

```bash
# View logs on Edge
journalctl -u yat-edge -f | grep -i "same-nat"

# Should see:
# "Detected same-NAT peers: peerA=1.2.3.4, peerB=1.2.3.4"
# "Triggering LAN endpoint gathering"
```

#### 3. Verify LAN Connectivity

```bash
# On device A
ping 192.168.1.101  # Device B's LAN address

# Should succeed
64 bytes from 192.168.1.101: icmp_seq=1 ttl=64 time=0.5ms
```

#### 4. Check WireGuard Interface

**macOS**:
```bash
# View WireGuard peer endpoints
sudo wg show all

# Should see:
# interface: wg-yat0-abc123
# peer: <peer-B-public-key>
#   endpoint: 192.168.1.101:51820  (LAN address)
```

**Windows**:
```powershell
# Use WireGuard CLI (if installed)
& "C:\Program Files\WireGuard\wireguard.exe" /showall

# Or view in YAT config panel
```

#### 5. Force LAN Discovery

If Same-NAT not detected:

1. Ensure both devices joined network
2. Wait 30 seconds for Edge to complete endpoint observation
3. Click **Sync Local Adapter** on both devices
4. Check Edge logs for LAN gathering trigger

### Issue 6: Endpoint Not Observed

**Symptom**:
Member's endpoint shows empty or "not observed".

**Causes**:
- Client not sending WireGuard handshake
- Edge observation interface not working
- Firewall blocking UDP traffic

**Solution**:

#### 1. Check Client WireGuard Status

```bash
# macOS
sudo wg show all

# Should see peer and endpoint
# peer: <public-key>
#   endpoint: 1.2.3.4:51820

# Windows
# View WireGuard status in YAT config panel
```

#### 2. Check Edge Observation Interface

```bash
# On Edge
sudo wg show wg-yat0-abc123

# Should see all peers
# peer: <peer-A-key>
#   endpoint: 1.2.3.4:51820
# peer: <peer-B-key>
#   endpoint: 5.6.7.8:51820
```

#### 3. Check Firewall

```bash
# Edge firewall
sudo ufw status
sudo ufw allow 58021:60999/udp

# Client firewall
# macOS: System Settings > Network > Firewall > Allow incoming connections
# Windows: Windows Defender Firewall > Allow app through firewall
```

#### 4. Force Refresh

1. Click **Sync Local Adapter** on client
2. Wait 5-10 seconds
3. Check Edge logs: `journalctl -u yat-edge -f | grep observation`
4. Should see endpoint update

### Issue 7: Relay Forwarding Fails

**Symptom**:
Using `force` mode but can't communicate via Edge relay.

**Causes**:
- Edge relay listener not started
- Target endpoint not observed
- Strict NAT blocking relay traffic

**Solution**:

#### 1. Check Edge Relay Status

```bash
# Check if WG interface is listening
sudo ss -ulnp | grep yat-edge

# Should see:
# udp  0  0  0.0.0.0:58021  0.0.0.0:*  users:(("yat-edge",pid=1234))
```

::: tip
Edge relay uses kernel forwarder to forward within the same WG interface.
All peers share the same WG port. No need to check additional per-peer relay ports.
:::

#### 2. Check Target Endpoint

```bash
# View target peer's endpoint on Edge
sudo wg show wg-yat0-abc123 | grep -A 2 "peer: <target-key>"

# Should see:
# endpoint: 1.2.3.4:51820
```

If endpoint empty, relay can't forward.

#### 3. Check Relay Logs

```bash
# View relay forwarding logs
journalctl -u yat-edge -f | grep -i relay

# Should see nft counter growing:
# yat_relay  chain forward  accept
```

::: tip
Edge relay uses kernel forwarder to forward within the same WG interface.
All peers share the same WG port. No need to check additional per-peer relay ports.
:::

#### 4. Understand Current Limitations

::: warning Important
The kernel forwarder relies on `ip_forward` for same-interface forwarding,
preserving the original source IP. However, in strict endpoint-dependent
NAT environments, direct peer connections may still be limited.
We recommend using `optional` mode as the preferred setting.
:::

**Temporary Solutions**:
- Use `optional` mode, prioritize direct connection
- Deploy geographically central Edge to reduce NAT layers
- Ensure target device's endpoint has been observed

---

## Platform-Specific Guides

### macOS

#### Prerequisites

- Joined at least one WireGuard network
- Helper daemon requires administrator privileges (YAT will automatically request elevation when joining a network)

#### Debug Information

| Item | Path |
|------|------|
| Helper Log | `/Library/Logs/YAT/yat-wg-helperd.log` |
| WG Config | `~/Library/Application Support/yat/wireguard/networks/<networkId>/wg.conf` |

#### View WireGuard Status

```bash
# Available after installing the official WireGuard macOS client
# https://apps.apple.com/app/wireguard/id1451685025
sudo wg show all
```

### Windows

#### Prerequisites

- Joined at least one WireGuard network
- Helper daemon requires administrator privileges (automatically configured by YAT installer)

#### Debug Information

| Item | Path |
|------|------|
| Helper Log | `%ProgramData%\YAT\helper\wireguard\yat-wg-helperd.log` |
| WG Config | `%APPDATA%\yat\wireguard\networks\<networkId>\wg.conf` |

#### View WireGuard Status

```powershell
# Check packet activity via Wintun virtual network adapter
Get-NetAdapter | Where-Object {$_.InterfaceDescription -like "*WireGuard*"}

# Wintun adapter can also be found in Windows Device Manager > Network adapters
```

### Linux

#### Prerequisites

- Linux 5.6+ (native kernel WireGuard support)
- Edge process requires root privileges

```bash
# View WireGuard interface status
sudo wg show all

# View interface details
sudo ip link show type wireguard
```

---

## 💡 Best Practices

### 1. Network Planning

- ✅ Use `/24` subnet (supports 254 devices)
- ✅ Avoid conflicts with existing subnets (e.g., `192.168.1.0/24`)
- ✅ Create different networks for different purposes (office, test, production)

### 2. Security Recommendations

- ✅ Regularly review network members
- ✅ Remove inactive devices promptly
- ✅ Use strong passwords for YAT account
- ✅ Enable two-factor authentication (if supported)

### 3. Performance Optimization

- ✅ Prioritize direct connection paths
- ✅ Choose geographically central Edge
- ✅ Avoid direct connection in symmetric NAT environments
- ✅ Regularly monitor connection quality

### 4. Fault Prevention

- ✅ Keep YAT client updated
- ✅ Regularly check Edge health
- ✅ Backup important configurations
- ✅ Document network topology and IP assignments

---

## 📚 Related Documentation

- [Transport Modes](./transport-modes.md) - Understand Relay/P2P/WireGuard differences
- [Edge Management](./edge-management.md) - Deploy and manage Edge servers
- [Multi-Device & Roles](./multi-device-roles.md) - Multi-device collaboration and permissions
- [FAQ](./faq.md) - Solve other common issues

---

*Last updated: 2026-09-18*
*YAT Team - Making intranet penetration simpler*
