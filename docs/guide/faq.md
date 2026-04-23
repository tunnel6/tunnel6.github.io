# FAQ

> Solve common issues encountered when using YAT

---

## 📋 Table of Contents

- [Installation Issues](#installation-issues)
- [Login Issues](#login-issues)
- [Tunnel Issues](#tunnel-issues)
- [Edge Server Issues](#edge-server-issues)
- [Extension Issues](#extension-issues)
- [Performance Issues](#performance-issues)
- [Network Issues](#network-issues)
- [Advanced Issues](#advanced-issues)

---

## Installation Issues

### Q: Which operating systems does YAT support?

**Supported**:
- ✅ macOS 10.15+ (Catalina)
- ✅ Windows 10+
- ✅ Linux (Ubuntu 18.04+, CentOS 7+, Debian 9+)

**Not Supported**:
- ❌ macOS 10.14 and below
- ❌ Windows 7/8
- ❌ 32-bit systems

### Q: macOS shows "Cannot verify developer"?

**Reason**: macOS Gatekeeper security policy

**Solution**:
1. Open **System Settings** > **Privacy & Security**
2. Find **Open Anyway** button
3. Click **Open Anyway**
4. Confirm open

Or use command line:
```bash
xattr -d com.apple.quarantine /Applications/YAT.app
```

### Q: Windows SmartScreen blocks installation?

**Solution**:
1. Click **More info**
2. Click **Run anyway**

### Q: Linux missing dependencies?

**Ubuntu/Debian**:
```bash
sudo apt install libnss3 libatk1.0-0 libatk-bridge2.0-0 \
  libcups2 libdrm2 libxkbcommon0 libxcomposite1 \
  libxdamage1 libxrandr2 libgbm1 libpango-1.0-0 \
  libcairo2 libasound2
```

**CentOS/RHEL**:
```bash
sudo yum install nss atk at-spi2-atk cups-libs \
  libdrm libxkbcommon xorg-x11-util-macros \
  libXcomposite libXdamage libXrandr mesa-libgbm \
  pango cairo alsa-lib
```

### Q: Cannot start after installation?

**Troubleshooting Steps**:

1. **Check system requirements**
   - OS version
   - Memory (at least 2GB)
   - Disk space (at least 500MB)

2. **View logs**

**macOS**:
```bash
cat ~/Library/Logs/YAT/main.log
```

**Windows**:
```
%APPDATA%\YAT\logs\main.log
```

**Linux**:
```bash
cat ~/.config/yat/logs/main.log
```

3. **Reinstall**
   - Uninstall current version
   - Clean configuration directory
   - Re-download latest version

---

## Login Issues

### Q: Cannot login to GitHub?

**Possible Reasons**:
1. Network issue
2. GitHub OAuth app configuration issue
3. Browser blocking

**Solution**:
1. Check network connection
2. Try accessing GitHub in browser
3. Disable ad blocking plugins
4. Clear browser cache

### Q: Immediately logout after login?

**Possible Reasons**:
1. Token expired
2. Network disconnected
3. Account disabled

**Solution**:
1. Relogin
2. Check network
3. Contact support team

### Q: Multi-device login conflict?

**No conflict**. YAT supports multi-device simultaneous login.

---

## Tunnel Issues

### Q: Prompt "No available Edge" when creating tunnel?

**Reason**: Not subscribed to any Edge server

**Solution**:
1. Go to **Edges** page
2. Switch to **Marketplace** tab
3. Subscribe to an Edge server
4. Return to create tunnel

### Q: Tunnel fails to start?

**Common Errors**:

#### Error 1: Edge Offline

**Symptom**: "Edge is offline"

**Solution**:
1. Check Edge status
2. Restart Edge server
3. Wait for Edge to come online

#### Error 2: Port Occupied

**Symptom**: "Port already in use"

**Solution**:
```bash
# macOS/Linux
lsof -i :8080
kill -9 <PID>

# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

#### Error 3: Network Timeout

**Symptom**: "Connection timeout"

**Solution**:
1. Check network connection
2. Check firewall settings
3. Try switching network

#### Error 4: Insufficient Permissions

**Symptom**: "Permission denied"

**Solution**:
- Consumer role cannot start tunnel
- Contact Publisher to start

### Q: Tunnel stops immediately after starting?

**Possible Reasons**:
1. Local service not started
2. Edge connection disconnected
3. Configuration error

**Troubleshooting Steps**:
```
1. Confirm local service running
   curl http://localhost:8080

2. Check Edge status
   - View Edge page
   - Status should be "Online"

3. View tunnel logs
   - Check error info in details page
```

### Q: Remote address inaccessible?

**Checklist**:

- [ ] Is tunnel status "Running"
- [ ] Is local service normal
- [ ] Is Edge online
- [ ] Does browser show certificate error
- [ ] Is firewall blocking connection

**Test Methods**:

```bash
# Test local service
curl http://localhost:8080

# Test remote address
curl https://xxx.myroxy.dev

# Test Edge connection
ping edge.myroxy.dev
```

### Q: How to stop tunnel?

1. Find tunnel card
2. Click **Stop** button
3. Confirm stop

### Q: Can tunnel be renamed?

Currently **does not support** renaming. Need to:
1. Delete old tunnel
2. Create new tunnel

---

## Edge Server Issues

### Q: Edge shows offline?

**Troubleshooting Steps**:

```bash
# 1. Check if server is running
ssh user@edge-server
uptime

# 2. Check Edge process
ps aux | grep yat-edge

# 3. Check port
netstat -tlnp | grep 443

# 4. View logs
sudo journalctl -u yat-edge -n 100

# 5. Restart service
sudo systemctl restart yat-edge
```

### Q: How to update Edge?

**Auto Update** (Recommended):
```bash
# Click "Update" button in YAT client
```

**Manual Update**:
```bash
# 1. Download new version
wget https://github.com/yat/releases/latest/download/yat-edge

# 2. Stop old version
sudo systemctl stop yat-edge

# 3. Replace binary
sudo mv yat-edge /opt/yat/yat-edge
sudo chmod +x /opt/yat/yat-edge

# 4. Start new version
sudo systemctl start yat-edge
```

### Q: Edge certificate expired?

**Auto Renewal** (Default):
YAT will auto-renew 30 days before expiration.

**Manual Renewal**:
```bash
# On Edge server
./yat-edge certs renew --config config.yaml

# Restart Edge
sudo systemctl restart yat-edge
```

### Q: How to view Edge resource usage?

```bash
# CPU and memory
top -p $(pgrep yat-edge)

# Network traffic
iftop -i eth0

# Disk usage
du -sh /opt/yat/
```

---

## Extension Issues

### Q: Extension not showing after installation?

**Troubleshooting Steps**:

1. **Check directory structure**
```
extensions/my-extension/
├── index.js        # Required
├── index.d.ts      # Optional
└── manifest.json   # Optional
```

2. **Check entry file**
```javascript
// index.js must export extension
export const extension = { ... }
```

3. **View console**
```
Open Developer Tools > Console
Check for loading errors
```

4. **Restart YAT**

### Q: ARD extension connection failed?

**Common Errors**:

#### Error 1: VNC Port Unreachable

**Symptom**: "Target port is unreachable: 127.0.0.1:5900"

**Solution**:
1. Confirm macOS screen sharing enabled
2. Check firewall settings
3. Test local connection:
   ```bash
   nc -zv 127.0.0.1 5900
   ```

#### Error 2: Role Error

**Symptom**: "Current device is client, cannot create ARD channel"

**Solution**:
- Ensure Publisher device starts tunnel
- Consumer device can only connect

#### Error 3: VNC Client Not Installed

**Symptom**: "No available local VNC client found"

**Solution**:
- macOS: Use built-in "Screen Sharing" app
- Windows: Install RealVNC or TightVNC
- Linux: Install Remmina or Vinagre

### Q: How to uninstall extension?

1. Go to **Apps** page
2. Find extension
3. Click **Uninstall**
4. Confirm uninstall

> ⚠️ **Note**: Uninstall will delete all tunnels of that extension

---

## Performance Issues

### Q: High tunnel latency?

**Optimization Suggestions**:

1. **Choose closer Edge**
   - China users: Hong Kong, Japan
   - Europe/US users: Frankfurt, US West

2. **Switch transport mode**
   - Relay → P2P (same region)
   - Relay → WireGuard (large files)

3. **Check network quality**
   ```bash
   # Test latency
   ping edge.myroxy.dev
   
   # Test bandwidth
   speedtest-cli
   ```

### Q: Bandwidth limits?

**Limiting Factors**:
- Edge server bandwidth
- Local network bandwidth
- Transport mode

**Recommendations**:
- Small files: Relay mode
- Large files: P2P or WireGuard
- Video streaming: P2P mode

### Q: High CPU usage?

**Optimization Suggestions**:

1. **Reduce tunnel count**
   - Close unused tunnels

2. **Switch transport mode**
   - WireGuard has lowest CPU usage

3. **Check extensions**
   - Some extensions may consume more resources

---

## Network Issues

### Q: Cannot use on company network?

**Possible Reasons**:
- Firewall blocking connection
- Proxy server intercepting
- Port blocked

**Solution**:

1. **Use HTTPS (port 443)**
   - Usually not blocked

2. **Configure proxy**
   ```bash
   export HTTPS_PROXY=http://proxy.company.com:8080
   ```

3. **Contact IT department**
   - Request to open port 443
   - Add Edge domain to whitelist

### Q: Unstable on mobile network?

**Optimization Suggestions**:

1. **Use Relay mode**
   - P2P has low success rate on mobile networks

2. **Enable auto reconnect**
   - YAT enables by default

3. **Use WireGuard**
   - Well-optimized for mobile networks

### Q: IPv6 support?

YAT **supports** IPv6:
- Edge servers can configure IPv6
- Client auto-selects best protocol

---

## Advanced Issues

### Q: How to customize Edge configuration?

Edit Edge configuration file:

```yaml
# config.yaml
server:
  port: 443
  tls:
    cert_file: certs/edge-tls.crt
    key_file: certs/edge-tls.key

captain:
  address: captain.myroxy.dev:443
  token: "your-token"

edge:
  name: "my-edge"
  data_dir: ./data
  
  # Advanced configuration
  max_channels: 100
  heartbeat_interval: 30
  reconnect_interval: 5
```

### Q: How to debug tunnel?

**Enable debug logs**:

Set log level to DEBUG in client.

**View logs**:
```bash
# macOS
tail -f ~/Library/Logs/YAT/main.log

# Filter tunnel-related logs
grep -i tunnel ~/Library/Logs/YAT/main.log
```

### Q: Data backup strategy?

**Auto Backup** (In development)

**Manual Backup**:
```bash
# Backup configuration
tar czf yat-backup-$(date +%Y%m%d).tar.gz \
  ~/Library/Application\ Support/YAT/

# Restore configuration
tar xzf yat-backup-20241210.tar.gz \
  -C ~/Library/Application\ Support/YAT/
```

### Q: How to contribute code?

1. Fork repository
2. Create branch
3. Submit changes
4. Submit Pull Request

See: [CONTRIBUTING.md](../CONTRIBUTING.md)

---

## 💡 General Troubleshooting Steps

### 1. Check Logs

Logs are most useful debugging information.

### 2. Restart Service

Many issues are temporary, restart can solve.

### 3. Update Version

Ensure using latest version.

### 4. Search Issues

Search for similar issues in GitHub Issues.

### 5. Submit Issue

If issue unresolved, submit Issue with:
- OS version
- YAT version
- Error logs
- Reproduction steps
- Screenshots

---

## 📚 Related Documentation

- [Quick Start](./quick-start.md) - Getting started guide
- [Tunnel Management](./tunnel-management.md) - Tunnel-related
- [Edge Management](./edge-management.md) - Edge-related
- [Apps and Extensions](./apps-and-extensions.md) - Extension-related

---

## 💬 Get Help

- **GitHub Issues**: [Report Issues](https://github.com/yat/issues)
- **Discussions**: [Community Discussions](https://github.com/yat/discussions)
- **Email**: support@myroxy.dev

---

*YAT Team - Making intranet penetration simpler*
