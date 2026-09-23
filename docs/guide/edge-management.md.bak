# Edge Server Management

> Learn how to deploy, manage, and subscribe to Edge servers

---

## 📋 Table of Contents

- [What is Edge Server](#what-is-edge-server)
- [Edge Server Architecture](#edge-server-architecture)
- [Deploy Edge Server](#deploy-edge-server)
- [Manage Edge Server](#manage-edge-server)
- [Subscribe to Shared Edge](#subscribe-to-shared-edge)
- [Edge Marketplace](#edge-marketplace)
- [Domain and Health Check](#domain-and-health-check)
- [Enable WireGuard](#enable-wireguard)
- [Startup Parameters Reference](#startup-parameters-reference)
- [FAQ](#faq)

---

## What is Edge Server

### Core Role

Edge server is YAT network's **core node**, responsible for:

- 🔄 **Traffic Forwarding** - Relay traffic between clients and servers
- 🔐 **mTLS Authentication** - Mutual TLS verification
- 📊 **Status Sync** - Real-time tunnel status synchronization
- 🌐 **Domain Management** - Assign and manage tunnel domains

### Why Need Edge?

```
Traditional solution (requires public IP + port forwarding):
  External users → Router configuration → Internal service

YAT solution (no configuration needed):
  External users → Edge server → Internal service
```

**Advantages**:
- ✅ No public IP required
- ✅ No router configuration needed
- ✅ Automatic encryption
- ✅ Global deployment

### Edge Types

| Type | Description | Use Case |
|------|-------------|----------|
| **Self-built Edge** | Edge you deploy yourself | Production environment, private deployment |
| **Shared Edge** | Edge shared by others | Testing, personal use |

---

## Edge Server Architecture

### Component Structure

```
Edge Server
├── Configuration File (config.yaml)
├── Certificate Directory (certs/)
│   ├── root-ca.crt         # Root certificate
│   ├── edge-sub-ca.crt     # Edge sub-CA
│   ├── edge-tls.crt        # TLS certificate
│   └── edge-tls.key        # TLS private key
├── Database
│   ├── channels.db         # Channel status
│   └── wireguard.db        # WireGuard configuration
└── Binary File (yat-edge)
```

### Startup Process

```
1. Bootstrap - Initialize configuration
2. RegisterNode - Register with Captain
3. Subscribe - Subscribe to control flow
4. Heartbeat - Heartbeat keep-alive
```

---

## Deploy Edge Server

### Prerequisites

- ✅ Public VPS (Ubuntu 18.04+ / CentOS 7+ Linux kernel 5.6+)
- ✅ Public IP address
- ✅ Domain (optional, for custom domains)

### Method 1: Deploy with YAT Client (Recommended)

#### Step 1: Open Deployment Dialog

1. Click **Edges** > **Create**
2. Fill in Edge information:
   - **Edge Name** - Custom name
   - **Node Type** - Private or shared

> 📸 ![Edge snapshot](/images/guide/snapshot-edge-deploy.png) Edge Deployment Dialog

> 📸 ![Edge snapshot](/images/guide/snapshot-edge-deployscript.png) Get Deployment Script

#### Step 2: Manual Deployment
1. Login to public server
2. Execute deployment script
> 📸 ![Edge snapshot](/images/guide/snapshot-edge-deploy-run.png) Edge Deployment Dialog

#### Step 4: Verify Deployment

After successful deployment:
- ✅ Edge appears in "My Edge" list
- ✅ Status shows **Online**
- ✅ Shows public IP and domain

### Method 2: Manual Deployment

#### Step 1: Download Edge

```bash
# Download latest version
wget https://github.com/tunnel6/yat/releases/latest/download/yat-edge-linux-amd64

# Add execute permission
chmod +x yat-edge-linux-amd64
```

#### Step 2: Get Deployment Script (same as above)

#### Step 3: Start Edge

```bash
# Start in foreground (testing)
./yat-edge-linux-amd64 server start

# Start in background (production)
nohup ./yat-edge-linux-amd64 start --config config.yaml > edge.log 2>&1 &
```

#### Step 5: Configure systemd (optional)

```ini
# /etc/systemd/system/yat-edge.service
[Unit]
Description=YAT Edge Server
After=network.target

[Service]
Type=simple
ExecStart=/opt/yat/yat-edge-linux-amd64 server start 
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable yat-edge
sudo systemctl start yat-edge

# Check status
sudo systemctl status yat-edge
```

---

## Manage Edge Server

### View Edge List

Click **Edges**, switch to **My** tab:

> 📸 ![Edge snapshot](/images/guide/snapshot-edge-manage.png) Edge List Page
> 
> Description: Shows Edge cards, status, action buttons

### Edge Card Information

Each Edge card displays:

- **Name** - Edge name
- **Status** - Online/Offline (with icon)
- **Public IP** - Edge's public IP address
- **Domain** - System-assigned domain
- **Tunnel Count** - Number of tunnels on this Edge
- **Service Status** - Status of various services

### Edge Operations

#### View Details

Click **Details** button to view:

- Basic information
- Network information (IP, domain)
- Domain health status
- Service running status
- Tunnel list

> 📸 ![Edge snapshot](/images/guide/snapshot-edge-manage.png) Edge Details Page
> 
> Description: Shows detailed info, domain health, service status

#### Manage Configuration

Click **Manage** button (self-built Edge only):

- Modify name
- Modify description
- Restart Edge
- View deployment commands

> 📸 **[Screenshot Location]** Edge Management Dialog
> 
> Description: Shows configuration form, action buttons

#### Delete Edge

Click **Delete** button:

> ⚠️ **Warning**:
> - Deleting Edge will clean up all related tunnels
> - Certificates will be revoked
> - Domains will be released

### Monitor Edge Status

#### Online Status

- 🟢 **Online** - Edge running normally
- 🔴 **Offline** - Edge unreachable
- 🟡 **Abnormal** - Some services abnormal

#### Domain Health

Edge domain health status:

| Status | Description | Action |
|--------|-------------|--------|
| **Normal** | DNS and certificate both normal | No action needed |
| **DNS Abnormal** | DNS record has issues | Check DNS configuration |
| **Certificate Abnormal** | Certificate expired or invalid | Regenerate certificate |
| **Unknown** - Cannot detect | Check Edge connection |

---

## Subscribe to Shared Edge

### What is Shared Edge?

Other users can share their Edge with other devices under the same account.

### Subscription Process

#### Step 1: Browse Edge Marketplace

1. Click **Edges** > **Marketplace**
2. View subscribable Edge list

> 📸 ![Edge snapshot](/images/guide/snapshot-edge-market.png) Edge Marketplace
> 
> Description: Shows subscribable Edges, subscribe buttons, owner info

#### Step 2: Subscribe to Edge

1. Select suitable Edge
2. Click **Subscribe** button
3. Confirm subscription

#### Step 3: Use Edge

After successful subscription:
- ✅ Edge appears in "My Edge" list
- ✅ Can create tunnels
- ✅ Can view status

### Unsubscribe

1. Find Edge in "My Edge" list
2. Click **Unsubscribe**
3. Confirm unsubscribe

> ⚠️ **Note**:
> - After unsubscribing, tunnels on that Edge will stop
> - Need to resubscribe to restore

---

## Edge Marketplace

### Marketplace Features

Edge marketplace is a trading platform for shared Edges:

- 📦 **Publish Edge** - Share your Edge with others
- 🔍 **Browse Edges** - Find available Edges
- ⭐ **Rating System** - View other users' reviews (in development)
- 📊 **Statistics** - View Edge performance metrics

### Publish Edge (In Development)

Edge sharing feature is currently under development, will support:

- Set sharing permissions
- Configure usage limits
- View usage statistics

---

## Domain and Health Check

### System-Assigned Domain

Each Edge is automatically assigned a domain:

```
Format: {edge-id}.edge.myroxy.dev
Example: abc123.edge.myroxy.dev
```

### Custom Domain

You can configure custom domain for Edge:

#### Step 1: Add Domain

Add custom domain in Edge management:
- `edge.example.com`

#### Step 2: Configure DNS

Add CNAME record:

```
Type: CNAME
Name: edge
Value: abc123.edge.myroxy.dev
TTL: 300
```

> 📸 **[Screenshot Location]** DNS Configuration提示
> 
> Description: Shows DNS record type, name, value, copy button

#### Step 3: Verify DNS

YAT will automatically verify DNS configuration:

- ✅ **Verification Passed** - Domain available
- ❌ **Verification Failed** - Check DNS record

#### Step 4: Automatic Certificate

After verification passes, YAT will automatically:
1. Apply for Let's Encrypt certificate
2. Configure TLS
3. Enable HTTPS

### Health Check

YAT periodically checks Edge domain health:

**Check Items**:
- DNS resolution
- Certificate validity
- HTTPS connection
- Response time

**Check Frequency**: Every 5 minutes

---

## Enable WireGuard

Edge servers support WireGuard networking, acting as relay nodes to forward traffic for network members. Once enabled, the Edge automatically creates WireGuard interfaces, manages peers, and handles forwarding.

> 📖 For detailed networking guide, see [WireGuard Networking Guide](./wireguard-networking.md#self-hosted-edge-configuration)

### System Requirements

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

### Kernel Configuration Reference

The Edge **automatically detects and configures** the following kernel parameters and modules on startup — usually no manual intervention is needed:

#### Kernel Modules

| Module | Purpose | Check |
|--------|---------|-------|
| `wireguard` | WireGuard interface creation (built-in since Linux 5.6) | `lsmod \| grep wireguard` |
| `nf_tables` | nftables firewall rules (required by kernel strategy) | `nft list tables` |

#### Sysctl Parameters

| Parameter | Value | Purpose | Configured by |
|-----------|-------|---------|---------------|
| `net.ipv4.ip_forward` | `1` | Enable IP forwarding, prerequisite for peer-to-peer relay | Edge auto-sets |
| `net.ipv4.conf.all.rp_filter` | `0` | Disable global reverse path filtering | Edge auto-sets |
| `net.ipv4.conf/<wg-iface>/rp_filter` | `0` | Disable per-interface reverse path filtering | Edge auto-sets |

::: warning
The effective `rp_filter` value is `max(all/rp_filter, <if>/rp_filter)` — both must be 0. Edge handles this automatically, but if you've manually set `all/rp_filter`, please verify it's been restored to 0.
:::

#### Kernel Feature Dependencies (by Forwarding Strategy)

| Feature | kernel strategy (default) | ebpf strategy |
|---------|---------------------------|---------------|
| WireGuard module | ✅ Required | ✅ Required |
| nftables | ✅ Required | ❌ Not needed |
| netlink (rtnetlink) | ✅ Required | ✅ Required |
| TC + BPF (cls_bpf) | ✅ Required (per-peer traffic stats) | ❌ Not needed |
| eBPF + `bpf_redirect_peer` | ❌ Not needed | ✅ Required (Linux 5.8+, experimental) |
| `ip_forward` | ✅ Required | ❌ Not needed (bypasses kernel forwarding) |

### Configuration Parameters

#### YAML Configuration (config.yaml)

```yaml
proxy:
  wireguard:
    enabled: true                    # Enable WireGuard functionality
    relay_enabled: true              # Enable relay forwarding
    public_endpoint: "edge.example.com"  # Edge public address (no port)
    listen_port_base: 58021          # WG interface listen port base
    forwarder_strategy: "kernel"     # Forwarding strategy: kernel (default) | ebpf (experimental, requires Linux 5.8+)
```

#### CLI Flags

| Flag | Default | Description |
|------|---------|-------------|
| `--channel.wireguard.enable` | `true` | Enable WireGuard functionality |
| `--channel.wireguard.relay_enabled` | `false` | Enable Edge-hosted WireGuard relay |
| `--channel.wireguard.public_endpoint` | Same as `--public` | WireGuard relay public address |

::: warning
CLI flags take priority over YAML configuration and cached startup config. If set via CLI, the value overrides configuration file settings.
:::

### Firewall & Ports

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

### Auto-Managed Kernel Parameters & nftables Rules

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

### Deployment Verification

```bash
# 1. Check Edge logs
journalctl -u yat-edge -f | grep -i wireguard
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

### Troubleshooting

#### IP Forwarding Not Enabled

**Symptom**: Peers cannot communicate, nft counter is 0

**Cause**: Edge automatically sets `ip_forward`, but the write may fail in some environments (e.g., insufficient container privileges)

```bash
# Manually enable IP forwarding
sudo sysctl -w net.ipv4.ip_forward=1

# Persist
echo 'net.ipv4.ip_forward=1' | sudo tee -a /etc/sysctl.conf
```

#### Docker Host iptables Interference

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

#### Kernel Version Doesn't Support WireGuard

**Symptom**: Edge startup fails with "WireGuard initialization failed"

```bash
# Check kernel version
uname -r

# If < 5.6, upgrade kernel
sudo apt install linux-image-generic
sudo reboot
```

---

## FAQ

### Q: What to do when Edge shows offline?

**Checklist**:
1. Is server running normally
2. Is firewall blocking port 443
3. Is Edge process running
4. Is network connection normal

**Resolution Steps**:

```bash
# 1. Check Edge process
ps aux | grep yat-edge

# 2. Check port
netstat -tlnp | grep 443

# 3. View logs
journalctl -u yat-edge -n 100

# 4. Restart service
sudo systemctl restart yat-edge
```

### Q: How to view Edge logs?

```bash
# systemd method
sudo journalctl -u yat-edge -f

# Direct log file
tail -f /var/log/yat-edge.log
```

### Q: Can Edge change IP?

Yes, but need to:
1. Update DNS record
2. Regenerate certificate
3. Restart Edge

### Q: How many Edges can one account create?

Currently no limit, but recommended:
- Personal users: 1-3 Edges
- Team users: 5-10 Edges

### Q: Edge server performance requirements?

**Minimum Configuration**:
- CPU: 1 core
- Memory: 512MB
- Bandwidth: 1Mbps
- Storage: 1GB

**Recommended Configuration**:
- CPU: 2 cores
- Memory: 1GB
- Bandwidth: 10Mbps
- Storage: 5GB

### Q: Which operating systems does Edge support?

- ✅ Ubuntu 18.04+
- ✅ CentOS 7+
- ✅ Debian 9+
- ✅ macOS (development testing)
- ❌ Windows (not supported yet)

---

## Startup Parameters Reference

Complete parameter list for `edge server start`. Parameters marked as "deployment override" will override YAML config and cached startup config.

### Process & Paths

| Parameter | Short | Default | Description |
|-----------|-------|---------|-------------|
| `--config` | `-c` | `~/.yat/config.yml` | Config file path |
| `--daemon` | `-d` | `false` | Run in daemon mode |
| `--pid-file` | | `~/.edge/RUNNING` | PID file path |
| `--sock-file` | | `~/.edge/.edge.sock` | IPC socket file path |

### Core Network

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--public` | empty | Public IP or domain (without port) |
| `--domain` | empty | Custom domain for HTTP channels |
| `--controller.address` | empty | Controller server address |
| `--channel.alias_domain_policy` | empty | Alias domain policy: `disabled` \| `optional` \| `required` |
| `--tunnel.listen` | empty | Tunnel listen address |
| `--tunnel.max_sessions` | `0` | Max sessions (0=unlimited) |

### TLS Certificates

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--tunnel.tls.ca` | empty | TLS CA certificate path |
| `--tunnel.tls.cert` | empty | TLS server certificate path |
| `--tunnel.tls.key` | empty | TLS server private key path |

### HTTP Channels

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--channel.http.enable` | `true` | Enable HTTP channels/proxy |
| `--channel.http.port` | `0` | HTTP proxy port |
| `--channel.https.port` | `0` | HTTPS proxy port |
| `--channel.http.addr` | empty | HTTP proxy listen address |
| `--channel.http.timeout` | `0` | HTTP proxy request timeout |
| `--channel.http.buffer` | empty | HTTP channel read buffer size (supports K/M suffix) |
| `--channel.http.buffer.lock` | `false` | Lock buffer to fixed size, disable dynamic window |
| `--channel.http.eager_start` | `false` | Start HTTP proxy on boot |

### TCP / UDP Channels

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--channel.tcp.enable` | `true` | Enable TCP channels |
| `--channel.tcp.port_min` | `0` | TCP port range start |
| `--channel.tcp.port_max` | `0` | TCP port range end |
| `--channel.udp.enable` | `true` | Enable UDP channels |
| `--channel.udp.port_min` | `0` | UDP port range start |
| `--channel.udp.port_max` | `0` | UDP port range end |

### WireGuard

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--channel.wireguard.enable` | `true` | Enable WireGuard functionality |
| `--channel.wireguard.relay_enabled` | `false` | Enable Edge-side relay forwarding |
| `--channel.wireguard.public_endpoint` | same as `--public` | WireGuard relay public address (without port) |

### P2P

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--server.capabilities.auto_enable` | `true` | Auto-enable services based on client capabilities |
| `--server.capabilities.p2p` | `true` | Enable P2P capability |
| `--channel.p2p.udp_addr` | empty | P2P UDP listen address, e.g. `0.0.0.0:9000` |

### Tunnel Limits

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--tunnel.limits.max_per_session` | `0` | Max tunnels per user session (0=unlimited) |
| `--tunnel.limits.max_total` | `0` | Max total tunnels for this edge (0=unlimited) |

### CSR Forwarder

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--csr.forwarder.enable` | `true` | Enable CSR forwarder |
| `--csr.forwarder.subca_serial` | empty | CSR forwarder sub-CA serial number |

### Logging

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--log.output` | `console` | Log output mode: `console` \| `file` |
| `--log.file` | empty | Log file path (effective when `log.output=file`) |
| `--log.level` | empty | Log level: `debug` \| `info` \| `warn` \| `error` \| `fatal` \| `panic` |

### Startup Config Injection

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--startup.config_b64` | empty | Startup config (Base64 encoded JSON), delivered by Captain |
| `--startup.config_json` | empty | Startup config (raw JSON) |

---

## 💡 Best Practices

### 1. Choose Server Location

Choose server closest to you and target users:

- China users: Hong Kong, Japan, Singapore
- Europe/US users: Frankfurt, US West
- Global users: Multi-region deployment

### 2. Security Hardening

```bash
# Disable password login, use key only
sudo vim /etc/ssh/sshd_config
PasswordAuthentication no

# Configure firewall
sudo ufw allow 443/tcp
sudo ufw allow 80/tcp
sudo ufw enable

# Regular system updates
sudo apt update && sudo apt upgrade
```

### 3. Monitoring and Alerting

```bash
# Install monitoring tools
sudo apt install htop iotop nethogs

# Setup log rotation
sudo vim /etc/logrotate.d/yat-edge
/var/log/yat-edge.log {
    daily
    rotate 7
    compress
    missingok
}
```

### 4. Backup Configuration

```bash
# Backup certificates and configuration
tar czf edge-backup-$(date +%Y%m%d).tar.gz \
  config.yaml certs/ data/

# Regular backup (cron)
0 2 * * * /opt/yat/backup.sh
```

---

## 📚 Related Documentation

- [Quick Start](./quick-start.md) - Subscribe to your first Edge
- [Tunnel Management](./tunnel-management.md) - Create tunnels on Edge
- [WireGuard Networking](./wireguard-networking.md) - Build virtual LANs with WireGuard
- [Custom Domains](./custom-domains.md) - Configure Edge domains
- [FAQ](./faq.md) - Solve Edge-related issues

---

*YAT Team - Making intranet penetration simpler*
