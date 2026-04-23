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
wget https://github.com/yat/releases/latest/download/yat-edge-linux-amd64

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
- [Custom Domains](./custom-domains.md) - Configure Edge domains
- [FAQ](./faq.md) - Solve Edge-related issues

---

*YAT Team - Making intranet penetration simpler*
