# Quick Start

> Get started with YAT in 5 minutes, create your first tunnel

---

## 📋 Prerequisites

- ✅ macOS 10.15+ / Windows 10+ / Linux (Ubuntu 18.04+)
- ✅ Network connection
- ✅ YAT account (supports GitHub/Google login)

---

## Step 1: Install YAT Client

### macOS

1. Download the `.dmg` package
2. Double-click to open, drag to Applications folder
3. Launch from Launchpad or Applications folder

> ⚠️ **First Launch**: If prompted "Cannot verify developer", go to System Settings > Privacy & Security > Open Anyway

### Windows

1. Download the `.exe` installer
2. Double-click to run the installation wizard
3. Follow prompts to complete installation

### Linux

```bash
# Download AppImage
chmod +x yat-*.AppImage
./yat-*.AppImage
```

### Verify Installation

After launching, you should see YAT's main interface:

> 📸 ![Tunnel snapshot](/images/guide/snapshot-login.png) YAT Main Interface - First Launch
> 
> Description: Shows welcome page, login button, feature introduction

---

## Step 2: Login

### Login Methods

YAT supports the following login methods:

1. **GitHub Login** (Recommended)
2. **Google Login**
3. **Email Registration** (Coming soon)

### Login Process

1. Click the **Login** button
2. Select login method
3. Authorize YAT to access your account
4. Complete login

> ![Tunnel snapshot](/images/guide/snapshot-login.png) Login Page
> 
> Description: Shows GitHub/Google login buttons

### After Login

After successful login, you'll enter the main interface where you can see:

- 📊 **Dashboard** - Overview statistics
- 🔌 **Tunnels** - Tunnel management
- 🖥️ **Edges** - Edge server management
- 🧩 **Apps** - Apps and extensions
- ⚙️ **Settings** - Settings

---

## Step 3: Subscribe to Edge Server

Edge servers are YAT network's relay nodes. For new users, we recommend subscribing to shared Edge servers first.

### Subscribe to Shared Edge

1. Click **Edges** in the left navigation
2. Switch to **Marketplace** tab
3. Select an available Edge server
4. Click **Subscribe** button

> 📸 ![Tunnel snapshot](/images/guide/snapshot-edge-market.png) Edge Marketplace Page
> 
> Description: Shows subscribable Edge list, subscribe button

### Verify Subscription

After successful subscription, the Edge will appear in **My** tab with status **Online**.

---

## Step 4: Create Your First Tunnel

Now let's create an HTTP tunnel to expose a local service to the public network.

### Prepare Local Service

If you don't have a local service, quickly start one:

```bash
# Start simple HTTP server with Python
python3 -m http.server 8080

# Or use Node.js
npx http-server -p 8080
```

Visit `http://localhost:8080` to confirm the service is running normally.

### Create Tunnel

1. Click **Tunnels** in the left navigation
2. Click **Create Tunnel** button
3. Select **HTTP Proxy** app
4. Select your subscribed Edge server
5. Fill in configuration:
   - **Tunnel Name**: My Test Service
   - **Local Port**: 8080
   - **Sharing Settings**: Exclusive (Recommended)
6. Click **Create**

> ![Tunnel snapshot](/images/guide/snapshot-tunnel-create-01.png) Create Tunnel Dialog
> ![Tunnel snapshot](/images/guide/snapshot-tunnel-create-02.png)
> ![Tunnel snapshot](/images/guide/snapshot-tunnel-create-03.png)
> Description: Shows app selection, Edge selection, configuration form

### Creation Successful

After successful creation, the tunnel will appear in the tunnel list with status **Inactive**.

---

## Step 5: Start Tunnel

1. Find the newly created tunnel card
2. Click **Start** button
3. Wait for status to change to **Running**

> ![Tunnel snapshot](/images/guide/snapshot-tunnel-status-01.png) Tunnel Startup Process
> 
> Description: Shows start button, status changes, loading animation

### Start Successful

After successful start, the tunnel card will display:

- ✅ Status: **Running** (green)
- 🌐 Remote Address: `https://xxx.myroxy.dev`
- 📊 Traffic statistics

---

## Step 6: Access Remote Service

### Get Remote Address

On the tunnel card, find the **Remote Address** section:

```
https://abc123-def456.myroxy.dev
```

### Test Access

1. Copy the remote address
2. Open in browser
3. You should see the same content as `http://localhost:8080`

> 📸 ![Tunnel snapshot](/images/guide/snapshot-tunnel-status-02.png)  Browser Accessing Remote Address
> 
> Description: Shows webpage accessed through YAT tunnel

### 🎉 Congratulations!

You've successfully created and started your first YAT tunnel!

---

## 🎯 5-Minute Experience Checklist

- [x] Install YAT client
- [x] Register and login
- [x] Subscribe to Edge server
- [x] Create HTTP tunnel
- [x] Start tunnel
- [x] Access remote service

---

## 🚀 Next Steps

Now that you've experienced YAT's basic features, explore more advanced features:

### Recommended Learning Path

1. **[Tunnel Management](./tunnel-management.md)** - Learn to create TCP/UDP tunnels, tunnel sharing, etc.
2. **[Edge Server Management](./edge-management.md)** - Deploy your own Edge server
3. **[Apps and Extensions](./apps-and-extensions.md)** - Use ARD remote desktop

### Common Operations Quick Reference

| Operation | Location | Description |
|-----------|----------|-------------|
| Create Tunnel | Tunnels > Create Tunnel | Select app and Edge |
| Start/Stop | Tunnel Card > Button | Control tunnel status |
| View Details | Tunnel Card > View Details | View channels, domains, etc. |
| Delete Tunnel | Tunnel Card > Delete | Permanently delete tunnel |
| Subscribe Edge | Edges > Marketplace > Subscribe | Subscribe to shared Edge |
| Deploy Edge | Edges > Create | Deploy your own Edge |

---

## 💡 FAQ

### Q: Prompt "No available Edge" when creating tunnel

**Reason**: You haven't subscribed to any Edge server.

**Solution**: Go to Edges > Marketplace, subscribe to a shared Edge.

### Q: Tunnel fails to start

**Possible Reasons**:
1. Edge server offline
2. Local port occupied
3. Network connection issue

**Solution**: 
1. Check Edge status (should be online)
2. Confirm local port is accessible
3. Check error message, or refer to [FAQ](./faq.md)

### Q: Remote address inaccessible

**Checklist**:
- [ ] Is tunnel status "Running"
- [ ] Is local service running normally
- [ ] Does browser show certificate error (ignore and continue)
- [ ] Is Edge server online

---

## 📚 Related Documentation

- [What is YAT](./what-is-yat.md) - Learn YAT's core features
- [Tunnel Management](./tunnel-management.md) - Deep dive into tunnel management
- [Edge Server Management](./edge-management.md) - Deploy and manage Edge
- [FAQ](./faq.md) - Solve common issues

---

*YAT Team - Making intranet penetration simpler*
