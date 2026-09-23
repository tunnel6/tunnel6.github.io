# Deploy Edge Server

> Deploy YAT Edge node on a public server

---

## 📋 Prerequisites

- ✅ Public VPS (Ubuntu 18.04+ / CentOS 7+ Linux kernel 5.6+)
- ✅ Public IP address
- ✅ Domain (optional, for custom domains)

---

## Method 1: Deploy with YAT Client (Recommended)

### Step 1: Open Deployment Dialog

1. Click **Edges** > **Create**
2. Fill in Edge information:
   - **Edge Name** — Custom name
   - **Node Type** — Private or shared

> 📸 ![Edge snapshot](/images/guide/snapshot-edge-deploy.png) Edge Deployment Dialog

> 📸 ![Edge snapshot](/images/guide/snapshot-edge-deployscript.png) Get Deployment Script

### Step 2: Deploy

1. Login to your public server
2. Execute the deployment script

> 📸 ![Edge snapshot](/images/guide/snapshot-edge-deploy-run.png) Execute deployment script

### Step 3: Verify Deployment

After successful deployment:
- ✅ Edge appears in "My Edge" list
- ✅ Status shows **Online**
- ✅ Shows public IP and domain

---

## Method 2: Manual Deployment

### Step 1: Download Edge

```bash
# Download latest version
curl https://download.tunnel6.com/download/edge/releases/v1.1.0-rc3/edge-linux-amd64 -o /usr/local/bin/edge

# Add execute permission
chmod +x /usr/local/bin/edge
```

### Step 2: Get Deployment Script

After creating an Edge in the YAT client, get the corresponding deployment script (contains auth token).

### Step 3: Start Edge

```bash
# Start in foreground (testing)
edge server start

# Start in background (production)
nohup edge server start --daemon > edge.log 2>&1 &
```

### Step 4: Configure systemd (optional)

```ini
# /etc/systemd/system/edge.service
[Unit]
Description=YAT Edge Server
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/edge server start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable edge
sudo systemctl start edge

# Check status
sudo systemctl status edge
```

---

## Next Steps

- [Manage Edge Server](./management.md#manage-edge-server) — View status, configure domains
- [Config Reference](./config-reference.md) — Customize Edge configuration
- [CLI Reference](./cli-reference.md) — Command-line tools
- [WireGuard Configuration](./wireguard.md) — Enable WireGuard networking

---

*YAT Team - Making intranet penetration simpler*
