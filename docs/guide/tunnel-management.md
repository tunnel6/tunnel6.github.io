# Tunnel Management

> Learn how to create, manage, and monitor tunnels

---

## 📋 Table of Contents

- [Tunnel Overview](#tunnel-overview)
- [Create Tunnel](#create-tunnel)
- [Start and Stop](#start-and-stop)
- [View Tunnel Details](#view-tunnel-details)
- [Tunnel Sharing and Collaboration](#tunnel-sharing-and-collaboration)
- [Delete Tunnel](#delete-tunnel)
- [Tunnel Statistics](#tunnel-statistics)
- [FAQ](#faq)

---

## Tunnel Overview

### What is a Tunnel?

Tunnel is YAT's core working unit, used to expose internal network services to the public network.

**Tunnel Components**:
- **Intent** - What you want to do (protocol, configuration)
- **Channels** - Specific forwarding rules
- **Participants** - Devices and their roles
- **Routes** - Running links

### Tunnel Status

| Status | Description | Icon |
|--------|-------------|------|
| **active** | Running | 🟢 |
| **inactive** | Not started | ⚪ |
| **stopped** | Stopped | 🔴 |
| **failed** | Start failed | ❌ |
| **negotiating** | Negotiating | 🟡 |

### Supported App Types

| App | Protocol | Description |
|-----|----------|-------------|
| **HTTP Proxy** | HTTP/HTTPS | Web services, APIs |
| **TCP Forward** | TCP | Databases, SSH |
| **UDP Forward** | UDP | Game servers, DNS |
| **ARD Remote Desktop** | TCP+UDP | macOS Remote Desktop |

---

## Create Tunnel

### Method 1: Create from Tunnels Page

1. Click **Tunnels** in left navigation
2. Click **Create Tunnel** button
3. Select app type

> 📸 ![Tunnel snapshot](/images/guide/snapshot-tunnel-create-01.png)  App Selection Dialog
> 
> Description: Shows available apps list, app icons and descriptions

### Method 2: Create from Edge Page

1. Click **Edges** in left navigation
2. Select an Edge server
3. Click **Create Tunnel** button

### Configure Tunnel

#### HTTP Proxy

**Configuration Items**:
- **Tunnel Name** - Custom name (required)
- **Local Port** - Local service port (required)
- **Local Host** - Local listen address (default 127.0.0.1)
- **Transport Mode** - Relay / P2P / WireGuard
- **Sharing Settings** - Shared / Exclusive

> 📸 ![Tunnel snapshot](/images/guide/snapshot-tunnel-create-02.png) HTTP Proxy Configuration Form
> 
> Description: Shows name, port, transport mode and other configuration items

#### TCP/UDP Forward

**Configuration Items**:
- **Tunnel Name** - Custom name
- **Local Port** - Local listen port
- **Remote Port** - Remote expose port (optional)
- **Local Host** - Local listen address

#### ARD Remote Desktop

**Configuration Items**:
- **Tunnel Name** - Custom name
- **Target Host** - Target Mac's hostname or IP
- **Transport Mode** - Relay / P2P / WireGuard
- **Role** - Server / Client

### Configuration Initialization

Some apps automatically initialize configuration during creation:

```typescript
// ARD Example
{
  localHost: '127.0.0.1',
  sharedState: 'shared',
  tunnelRole: 'publisher',
  transport: 'relay',
  creatorDeviceId: 'device-xxx'
}
```

### Creation Successful

After successful creation:
- ✅ Tunnel appears in tunnel list
- ✅ Status is **Inactive**
- ✅ Can click to view details

---

## Start and Stop

### Start Tunnel

**Method 1: Start from List**

1. Find tunnel card
2. Click **Start** button
3. Wait for status to change to **Running**

**Method 2: Start from Details**

1. Click **View Details**
2. Click **Start** button

> 📸 ![Tunnel snapshot](/images/guide/snapshot-tunnel-status-01.png)  Tunnel Startup Process
> 
> Description: Shows start button, loading state, success message

### Startup Process

```
User clicks start
  ↓
Check Edge connection
  ↓
Check local port
  ↓
Call Host API (startChannels)
  ↓
Edge creates channels
  ↓
Status syncs to client
  ↓
Display running
```

### Stop Tunnel

**Method 1: Stop from List**

1. Find running tunnel
2. Click **Stop** button
3. Confirm stop

**Method 2: Stop from Details**

1. Enter tunnel details
2. Click **Stop** button

### Restart Tunnel

When tunnel runs abnormally, click **Reconnect** button to restart.

---

## View Tunnel Details

### Enter Details

Click **View Details** button on tunnel card.

### Details Page Structure

#### 1. Basic Information

- **Tunnel Name**
- **App Type**
- **Edge Server**
- **Created At**
- **Updated At**

> 📸 ![Tunnel snapshot](/images/guide/snapshot-tunnel-status-03.png) Tunnel Details - Basic Info
> 
> Description: Shows name, app, Edge, timestamps and other info

#### 2. Remote Addresses

Shows available remote access addresses:

- **System-assigned Domain** - `xxx.myroxy.dev`
- **Custom Domain** - If configured
- **CNAME Status** - DNS verification status

> 📸 ![Tunnel snapshot](/images/guide/snapshot-tunnel-status-04.png) Tunnel Details - Remote Addresses
> 
> Description: Shows multiple addresses, copy buttons, CNAME status

#### 3. Channel List

Shows all channels under the tunnel:

| Channel Name | Protocol | Local Port | Remote Port | Status |
|--------------|----------|------------|-------------|--------|
| VNC Channel | TCP | 5900 | 12345 | Running |
| VNC Channel | UDP | 5900 | 12345 | Running |

> 📸 ![Tunnel snapshot](/images/guide/snapshot-tunnel-status-06.png) Tunnel Details - Channel List
> 
> Description: Shows channel key, protocol, port binding, status

#### 4. Participant Information

Shows participating devices' roles:

- **Device ID**
- **Role** - Publisher / Consumer / Controller
- **Status** - Online / Offline
- **Last Online Time**

#### 5. App Custom Tab

Some apps provide additional tabs:

**ARD Example**:
- **Connection Status** - Shows VNC service status
- **Remote Desktop Snapshot** - Shows remote desktop preview

> 📸 ![Tunnel snapshot](/images/guide/snapshot-tunnel-status-07.png) Tunnel Details - ARD Custom Tab
> 
> Description: Shows connection status, desktop snapshot

---

## Tunnel Sharing and Collaboration

### Sharing Modes

YAT supports two sharing modes:

#### Exclusive

- 🔒 Only creator device can use
- 🚫 Other devices cannot join
- ✅ Suitable for personal use

#### Shared

- 👥 Other devices with same account can join
- 🔄 Auto sync channel status
- ✅ Suitable for multi-device collaboration

### Set Sharing Mode

**Set during creation**:
Select shared or exclusive in tunnel creation configuration form.

**Modify after creation**:
Currently not supported, need to recreate tunnel.

### Multi-Device Collaboration

#### Scenario Example

**Scenario**: Access home NAS from office

**Setup Steps**:

1. **Home Device (Publisher)**
   - Create tunnel, set to **Shared**
   - Role: **Publisher**
   - Start tunnel

2. **Office Device (Consumer)**
   - See shared tunnel
   - Role: **Consumer**
   - View remote address, access service

> 📸  ![Tunnel snapshot](/images/guide/snapshot-tunnel-status-08.png) Multi-Device Collaboration Diagram
> 
> Description: Shows Publisher and Consumer devices, tunnel sharing relationship

### Role Description

| Role | Permissions | Description |
|------|-------------|-------------|
| **Publisher** | Start/Stop/Control | Service provider |
| **Consumer** | View/Access | Service user |
| **Controller** | Manage configuration | Administrator (reserved) |

---

## Delete Tunnel

### Delete Process

1. Find tunnel card
2. Click **Delete** button
3. Confirm delete

> ⚠️ **Warning**: Delete operation is irreversible!

### Pre-delete Check

Apps can define check logic before deletion:

```typescript
hooks: {
  onBeforeDelete(context) {
    // Check if there are running services
    if (context.tunnel.status === 'active') {
      alert('Please stop the tunnel first')
      return false
    }
    return true
  }
}
```

### After Deletion

- ❌ Tunnel removed from list
- ❌ Channels on Edge cleaned up
- ❌ Assigned domain released
- ❌ Cannot be recovered

---

## Tunnel Statistics

### Statistics Cards

Top of Tunnels page displays statistics:

- **Running** - Number of currently running tunnels
- **Stopped** - Number of stopped tunnels
- **Inbound Traffic** - Received data volume
- **Outbound Traffic** - Sent data volume

> 📸 ![Tunnel snapshot](/images/guide/snapshot-tunnel-list.png) Statistics Cards
> 
> Description: Shows 4 statistical metrics

### View Single Tunnel Traffic

In tunnel details, you can see that tunnel's traffic statistics.

---

## FAQ

### Q: Prompt "Port occupied" when creating tunnel

**Reason**: Local port is already occupied by another service.

**Solution**: 
1. Change local port
2. Or close the service occupying that port

```bash
# macOS/Linux check port usage
lsof -i :8080

# Windows check port usage
netstat -ano | findstr :8080
```

### Q: Tunnel stops immediately after starting

**Possible Reasons**:
1. Edge server offline
2. Local service not started
3. Network instability

**Solution**:
1. Check Edge status
2. Confirm local service running normally
3. Check error logs

### Q: How to view tunnel logs?

Currently log feature is under development. You can troubleshoot by:

1. Check tunnel status prompts
2. Check Edge server logs
3. Submit Issue with screenshots

### Q: How many tunnels can one Edge create?

Theoretically unlimited, but recommended:
- Single Edge not exceeding 20 tunnels
- Total bandwidth not exceeding Edge server capacity

### Q: Can tunnels migrate across Edges?

Currently not supported. To change Edge, need to:
1. Delete original tunnel
2. Recreate on new Edge

---

## 💡 Best Practices

### 1. Naming Convention

Use meaningful names:

```
✅ My NAS - HTTP
✅ Dev Server - TCP 3000
✅ Home Camera - UDP
❌ Tunnel 1
❌ test
```

### 2. Port Selection

- Use non-privileged ports (>1024)
- Avoid common port conflicts
- Record port purposes

### 3. Security Recommendations

- Choose **Exclusive** mode for personal use
- Choose **Shared** mode for team collaboration
- Regularly clean up unused tunnels

### 4. Performance Optimization

- Prioritize **P2P mode** (lower latency)
- Use **WireGuard mode** for large file transfers
- Use **HTTP/HTTPS** for web services

---

## 📚 Related Documentation

- [Quick Start](./quick-start.md) - Create your first tunnel
- [Edge Server Management](./edge-management.md) - Manage Edge servers
- [Apps and Extensions](./apps-and-extensions.md) - Use extension features
- [Transport Modes](./transport-modes.md) - Learn about transport modes

---

*YAT Team - Making intranet penetration simpler*
