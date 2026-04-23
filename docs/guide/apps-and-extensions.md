# Apps and Extensions

> Learn about YAT's application ecosystem and extension system

---

## 📋 Table of Contents

- [App Overview](#app-overview)
- [Built-in Apps](#built-in-apps)
- [Extension System](#extension-system)
- [Install Extensions](#install-extensions)
- [Use ARD Remote Desktop](#use-ard-remote-desktop)
- [Develop Extensions](#develop-extensions)
- [FAQ](#faq)

---

## App Overview

### What is an App?

In YAT, an **App** is a definition of specific remote access capabilities, including:

- 📝 **Configuration Form** - Configuration UI when creating tunnels
- 🎨 **UI Components** - Custom display in tunnel details
- 🔘 **Action Buttons** - Definitions for start, stop and other operations
- 🪝 **Lifecycle Hooks** - Pre-start and post-start processing logic

### App vs Extension

| Concept | Description | Relationship |
|---------|-------------|--------------|
| **App** | Remote access capability definition | Abstract concept |
| **Extension** | Carrier of App | Contains App definition + metadata |

**Example**:
- ARD Extension contains ARD app definition
- One extension can contain multiple apps (future support)

---

## Built-in Apps

### HTTP Proxy

**Purpose**: Expose local HTTP services to public network

**Features**:
- ✅ Automatic HTTPS
- ✅ Custom domains
- ✅ Path rewriting

**Configuration Items**:
```
- Tunnel name
- Local port (e.g., 3000, 8080)
- Local host (default 127.0.0.1)
- Transport mode
- Sharing settings
```

> 📸 ![Edge snapshot](/images/guide/snapshot-ext-http.png) HTTP Proxy Configuration Form
> 
> Description: Shows port input, transport mode selection

**Use Cases**:
- Local development server demo
- Webhook testing
- API debugging

### TCP Forward

**Purpose**: Forward any TCP protocol

**Features**:
- ✅ Transparent transmission
- ✅ Long connection support
- ✅ Auto reconnect

**Configuration Items**:
```
- Tunnel name
- Local port
- Remote port (optional)
- Local host
```

**Use Cases**:
- SSH remote access
- Database connection
- Custom TCP services

### UDP Forward

**Purpose**: Forward UDP protocol

**Features**:
- ✅ Low latency
- ✅ No connection state
- ✅ Broadcast support

**Use Cases**:
- DNS service
- Game servers
- Audio/video streaming

---

## Extension System

### Extension Architecture

```
┌─────────────────────────────────┐
│         YAT Client               │
│  ┌───────────────────────────┐  │
│  │   Extension Runtime Host  │  │
│  │  - Extension Loader       │  │
│  │  - Host API Bridge        │  │
│  │  - Lifecycle Management   │  │
│  └───────────┬───────────────┘  │
│              │                   │
│  ┌───────────▼───────────────┐  │
│  │    Extension               │  │
│  │  - App Definition         │  │
│  │  - Vue/React Components   │  │
│  │  - Lifecycle Hooks        │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

### Extension Capabilities

Extensions can:

- ✅ Customize configuration forms
- ✅ Customize detail pages
- ✅ Define action buttons
- ✅ Implement lifecycle hooks
- ✅ Call Host API (start/stop channels)
- ✅ Customize remote address resolution

### Extension Restrictions

For security reasons, extensions **cannot**:

- ❌ Directly access file system
- ❌ Execute system commands
- ❌ Access unauthorized APIs
- ❌ Modify other extensions' data

---

## Install Extensions

### Method 1: Install from Marketplace (In Development)

1. Click **Apps** > **Marketplace**
2. Browse available extensions
3. Click **Install**
4. Wait for installation to complete

### Method 2: Local Installation

1. Download extension package (`.yat` or directory)
2. Place in extension directory:

**macOS**:
```
~/Library/Application Support/yat/extensions/
```

**Windows**:
```
%APPDATA%/yat/extensions/
```

**Linux**:
```
~/.config/yat/extensions/
```

3. Restart YAT client
4. Extension auto-loads

### Verify Installation

1. Click **Apps**
2. View installed extensions list
3. Confirm extension status is **Enabled**

> 📸 ![Edge snapshot](/images/guide/snapshot-ext-01.png)  Extension Management Page
> 
> Description: Shows installed extensions, enable/disable toggles, uninstall buttons

### Uninstall Extension

1. Find installed extension
2. Click **Uninstall**
3. Confirm uninstall

> ⚠️ **Note**: Uninstalling extension will delete all tunnels created by that extension

---

## Use ARD Remote Desktop

ARD (Apple Remote Desktop) extension is YAT's first official extension for macOS remote desktop access.

### Features

- 🖥️ **VNC Remote Desktop** - Standard VNC protocol
- 🔐 **Secure Transmission** - mTLS encryption
- 🌐 **Multiple Transport Modes** - Relay / P2P / WireGuard
- 👥 **Role Separation** - Publisher / Consumer
- 📸 **Desktop Snapshot** - Real-time preview

### Prerequisites

**Publisher (Server Side)**:
- ✅ macOS system
- ✅ Screen sharing or remote management enabled
- ✅ YAT client + ARD extension

**Consumer (Client Side)**:
- ✅ Any system (macOS/Windows/Linux)
- ✅ YAT client + ARD extension
- ✅ VNC client (e.g., RealVNC, TightVNC)

### Configure Publisher

#### Step 1: Enable macOS Screen Sharing

1. Open **System Settings** > **General** > **Sharing**
2. Enable **Screen Sharing** or **Remote Management**
3. Set access permissions

> 📸 ![Tunnel snapshot](/images/guide/snapshot-ext-ard-tunrnon.png) macOS Screen Sharing Settings
> 
> Description: Shows sharing toggle, permission settings

#### Step 2: Create ARD Tunnel

1. Click **Tunnels** > **Create Tunnel**
2. Select **Mac Remote Desktop**
3. Fill in configuration:
   - **Tunnel Name**: My Mac
   - **Target Host**: 127.0.0.1 or LAN IP
   - **Role**: Server (Publisher)
4. Click **Create**


> Description: Shows hostname input, role selection, transport mode

#### Step 3: Start Tunnel

1. Find created tunnel
2. Click **Connect** button
3. Wait for status to change to **Running**

**Pre-start Checklist**:
- ✅ Local port 5900 reachable
- ✅ Edge online
- ✅ Role is Publisher

### Configure Consumer

#### Step 1: View Shared Tunnel

On Consumer device:
1. Open **Tunnels** page
2. See shared tunnel created by Publisher
3. Role auto-identified as **Consumer**

#### Step 2: Connect to Remote Desktop

**Method 1: Through YAT Client**

1. Click **Connect Remote Desktop** button
2. VNC client auto-launches
3. Enter password (if required)

**Method 2: Manual Connection**

1. Copy remote address (e.g., `vnc://edge.myroxy.dev:12345`)
2. Open VNC client
3. Paste address and connect

> 📸 ![Tunnel snapshot](/images/guide/snapshot-ext-ard-vncconnect.png) VNC Client Connection Interface
> 
> Description: Shows VNC client, address input, connect button

### Role Description

#### Publisher (Server)

- 🔧 **Permissions**: Start/stop/control tunnel
- 📡 **Responsibilities**: Provide VNC service
- 💻 **Device**: Controlled Mac

#### Consumer (Client)

- 👁️ **Permissions**: View status, connect to remote desktop
- 🖱️ **Responsibilities**: Use remote desktop
- 💻 **Device**: Controlling device

### Advanced Configuration

#### Transport Mode Selection

| Mode | Latency | Bandwidth | Use Case |
|------|---------|-----------|----------|
| **Relay** | Medium | Medium | General scenarios |
| **P2P** | Low | High | Same network/low latency |
| **WireGuard** | Low | High | Large file transfers |

#### Custom Port

Default uses port 5900. To modify:

1. Change VNC listen port in macOS
2. Fill custom port when creating tunnel

---

## Develop Extensions

### Quick Start

For detailed extension development guide, refer to: [EXTENSION_DEVELOPER_GUIDE.md](../EXTENSION_DEVELOPER_GUIDE.md)

### Development Steps Overview

#### 1. Initialize Project

```bash
mkdir my-extension
cd my-extension
npm init -y
npm install @hilow/extension-types vue typescript vite
```

#### 2. Create Entry File

```typescript
// src/index.ts
import type { AppExtensionPackage } from '@hilow/extension-types'

export const extension: AppExtensionPackage = {
  metadata: {
    id: 'app-my-extension',
    name: 'My Extension',
    version: '1.0.0',
    description: 'My custom extension',
    author: 'Developer'
  },
  appDefinition: {
    id: 'app-my-extension',
    i18n: { /* ... */ },
    actions: [ /* ... */ ],
    hooks: { /* ... */ }
  }
}
```

#### 3. Develop Components

Create Vue/React components for configuration forms and detail pages.

#### 4. Test Extension

```bash
npm run build
# Copy dist directory to extension directory
# Restart YAT client
```

#### 5. Publish Extension

Package extension and publish to marketplace (coming soon).

### Example Projects

- **ARD Extension**: `extensions/ard/`
- **React Example**: `extensions/react-example/`
- **Basic Example**: `extensions/example/`

---

## FAQ

### Q: Extension not showing after installation?

**Checklist**:
1. Is extension directory structure correct
2. Does it contain `index.js` entry file
3. Did you restart YAT client
4. Check developer tools console for errors

### Q: ARD extension connection failed?

**Possible Reasons**:
1. macOS screen sharing not enabled
2. Port 5900 occupied
3. Firewall blocking connection
4. Edge offline

**Resolution Steps**:
```bash
# Check port
lsof -i :5900

# Check screen sharing status
defaults read /var/db/launchd.db/com.apple.launchd/overrides.plist com.apple.screensharing
```

### Q: How to develop custom extensions?

Read [Extension Development Guide](../EXTENSION_DEVELOPER_GUIDE.md), including:
- Type system explanation
- Host API documentation
- Complete example code
- Packaging and publishing process

### Q: Can extensions access my data?

Extensions can only access:
- ✅ Their own tunnel data
- ✅ Interfaces exposed by Host API
- ✅ Configurations provided by users

Extensions **cannot** access:
- ❌ Other extensions' data
- ❌ System files
- ❌ Unauthorized network resources

### Q: Will extensions auto-update?

Currently doesn't support auto-update. Need to:
1. Download new version
2. Replace old version
3. Restart YAT

Auto-update feature in development.

---

## 💡 Best Practices

### 1. Choose Appropriate Transport Mode

- **Web services**: HTTP/HTTPS + Relay
- **Remote desktop**: TCP/UDP + P2P
- **Database**: TCP + WireGuard

### 2. Security Recommendations

- Only start tunnels when needed
- Use exclusive mode (personal use)
- Regularly check tunnel list
- Keep extensions updated

### 3. Performance Optimization

- Prioritize P2P mode
- Use WireGuard for large file transfers
- Avoid running too many tunnels simultaneously

---

## 📚 Related Documentation

- [Extension Development Guide](../EXTENSION_DEVELOPER_GUIDE.md) - Complete extension development documentation
- [Tunnel Management](./tunnel-management.md) - Create and manage tunnels
- [Transport Modes](./transport-modes.md) - Learn about transport mode differences
- [Multi-Device Collaboration](./multi-device-roles.md) - Publisher/Consumer roles

---

*YAT Team - Making intranet penetration simpler*
