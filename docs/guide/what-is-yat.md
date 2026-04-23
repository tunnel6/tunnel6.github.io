# What is YAT

> Learn about YAT's core features, use cases, and system architecture

---

## 📌 One-Sentence Introduction

**YAT (Yet Another Tunnel)** is a powerful **intranet penetration and application extension platform** that enables you to securely and quickly access internal network services from anywhere.

---
## 🔥 Features
- **Private Deployment:** Allows users to build dedicated edge nodes, controlling data sovereignty and network performance
- **Zero-Trust Full Chain:** Abandon traditional perimeter defense, build end-to-end encryption and dynamic verification security防线
- **Full-Stack Network Extension:** Provide layer 4/7 network capabilities based on YAT framework, meeting high-performance forwarding and complex business routing needs

## 🎯 Core Features

### 1. Intranet Penetration (Tunnel Service)

Expose internal network services to the public network without configuring router port forwarding.

**Supported Protocols**:
- ✅ **HTTP/HTTPS** - Web services, API interfaces
- ✅ **TCP** - Databases, SSH, custom services
- ✅ **UDP** - Game servers, DNS services
- ✅ **WireGuard** - VPN networking (coming soon)

**Typical Scenarios**:
```
Home NAS → Public network access
Local development server → Customer demo
Internal database → Remote work
IoT devices → Cloud management
```

### 2. Edge Server Network

YAT uses **Edge servers** as relay nodes to provide stable connection services.

**Features**:
- **🌍 Wide Network Coverage:** Official multi-region nodes, support nearest access, and allow building exclusive Edge nodes
- **🔄 Smart High Availability:** Auto failover and load balancing between nodes, ensuring continuous service
- **🔐 Mutual Authentication Security:** mTLS-based mutual authentication and encrypted transmission, ensuring trusted communication
- **📡 Observable Status:** Real-time node health monitoring and traffic statistics, supporting operational visualization
- **🤝 Sharing and Autonomy:** Use official or community shared nodes, or deploy private nodes with自主 control

### 3. Application Extension System

Through the extension mechanism, YAT can support various remote access scenarios.

**Built-in Extensions**:
- 🖥️ **HTTP Proxy** - HTTP Proxy service
- 🔧 **TCP Forward** - TCP forwarding capability
- ☁️ **UDP Forward** - UDP protocol forwarding capability
- 📁 **File Server** - File server

**Third-party Extensions**:
Developers can create their own extensions and publish to the marketplace.

### 4. Multi-Device Collaboration

Support multiple devices working together, each playing different roles:

- **Publisher** - Device providing the service
- **Consumer** - Device using the service
- **Controller** - Device managing configuration

---

## 🏗️ System Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────┐
│                   YAT Ecosystem                        │
│                                                      │
│  ┌──────────────┐      ┌──────────────┐             │
│  │  yat-fe      │      │   Edge       │             │
│  │  Desktop     │◄────►│   Server     │              │
│  │  Client      │ mTLS │              │             │
│  └──────────────┘      └──────┬───────┘             │
│         │                     │                     │
│         │                     │                     │
│         ▼                     ▼                     │
│  ┌──────────────────────────────────────┐           │
│  │        Control Plane                  │           │
│  │  - User Authentication                │           │
│  │  - Edge Registration Management       │           │
│  │  - Certificate Issuance & Revocation  │           │
│  │  - DNS Management                     │           │ 
│  └──────────────────────────────────────┘           │
└─────────────────────────────────────────────────────┘
```

### Component Description

#### 1. YAT (Desktop Client)

- **Features**:
  - Manage tunnels (create, start, stop)
  - Manage Edge servers (deploy, subscribe)
  - Load and run extensions
  - Display tunnel status and statistics

#### 2. Edge (Edge Server)

- **Features**:
  - Tunnel runtime coordination
  - mTLS connection management
  - Channel status maintenance
  - Real-time sync with client

**Deployment Locations**:
- Public VPS (recommended)
- Home router (requires public IP)
- Cloud servers (AWS, GCP, Alibaba Cloud, etc.)

---

## 🔑 Core Concepts

### Tunnel

Tunnel is YAT's core working unit, representing a remote access connection.

**Properties**:
- **Name**: User-defined
- **Protocol**: HTTP/HTTPS/TCP/UDP
- **Status**: active / inactive / stopped
- **Sharing State**: shared / exclusive

**Example**:
```
Tunnel Name: My NAS
Protocol: HTTP
Local Port: 5000
Remote Address: https://nas-abc123.myroxy.dev
Status: Running
```

### Channel

Channel is a specific forwarding rule under a tunnel. One tunnel can have multiple channels.

**Example**:
```
Channel: VNC Channel
Rule 1: TCP 5900 → Remote 5900
Rule 2: UDP 5900 → Remote 5900
```

### Edge Server

Edge server is a node in the YAT network, responsible for traffic forwarding, service coordination, etc.

**Properties**:
- **ID**: Unique identifier
- **Name**: User-defined
- **Status**: online / offline
- **Public IP**: Edge's public IP address
- **Domain**: System-assigned domain
- **Owner**: Creator or sharer

---

## 🆚 Comparison with Other Tools

| Feature | YAT | frp | ngrok | Cloudflare Tunnel |
|---------|-----|-----|-------|-------------------|
| **GUI Client** | ✅ Electron desktop app | ❌ CLI | ✅ Web | ✅ Web |
| **Extension System** | ✅ Plugin architecture | ❌ | ❌ | ❌ |
| **Multi-Device Collaboration** | ✅ Actor model | ❌ | ❌ | ❌ |
| **mTLS Encryption** | ✅ Mutual authentication | ⚠️ One-way | ✅ | ✅ |
| **Custom Edge** | ✅ Self-deploy | ✅ | ❌ | ❌ |
| **Edge Marketplace** | ✅ Shared subscription | ❌ | ❌ | ❌ |
| **WireGuard** | ✅ In progress | ❌ | ❌ | ❌ |
| **Open Source** | ✅ | ✅ | ❌ | ❌ |

---

## 🎨 Interface Preview

### Main Interface

> 📸 **![Tunnel snapshot](/images/guide/snapshot-tunnel-list.png)** Main interface screenshot
> 
> Description: Shows tunnel list, statistics cards, create button

### Tunnel Details

> 📸  **Tunnel details page**
> ![Tunnel snapshot](/images/guide/snapshot-tunnel-detail.png)
> Description: Shows tunnel status, remote addresses, channel list, action buttons

### Edge Management

> 📸  Edge management page
> [![Edge manage snapshot](/images/guide/snapshot-edge-manage.png)](/images/guide/snapshot-edge-manage.png)
> Description: Shows Edge list, deployment dialog, subscription marketplace

---

## 💡 Use Cases

### Personal Users

- 🏠 **Home NAS Remote Access** - Access home files anytime, anywhere
- 💻 **Development Environment Sharing** - Expose local dev server to team members
- 🎮 **Game Server** - Build private game server
- 📹 **Security Camera** - Remotely view home surveillance

### Team Users

- 🏢 **Internal Service Exposure** - Expose internal APIs to external partners
- 🔧 **Remote Operations** - SSH remote server management
- 🖥️ **Remote Desktop** - ARD/VNC remote assistance
- 📊 **Data Sync** - Cross-office data synchronization

### Developers

- 🚀 **App Demo** - Showcase locally developed apps to clients
- 🔌 **Webhook Testing** - Receive webhook callbacks from external services
- 🧪 **API Debugging** - Debug APIs requiring public network access

---

## 🔐 Security Features

### 1. mTLS Mutual Authentication

All connections use mTLS (Mutual TLS), ensuring:
- ✅ Client verifies Edge server identity
- ✅ Edge server verifies client identity
- ✅ Prevents man-in-the-middle attacks

### 2. Certificate Management

- 📜 Automatic certificate issuance
- 🔄 Automatic certificate renewal
- ❌ Certificate revocation (CRL)
- 🔒 Edge sub-CA mechanism

### 3. Access Control

- 👤 User authentication (OAuth)
- 🔑 Device ID management
- 👥 Sharing permission control
- 🚫 Subscription revocation mechanism

---

## 🚀 Next Steps

Now that you understand what YAT is, let's start using it!

👉 **Read the [Quick Start Guide](./quick-start.md)**

---

## 📚 Related Documentation

- [Quick Start](./quick-start.md) - Get started with YAT in 5 minutes
- [Tunnel Management](./tunnel-management.md) - Learn core features
- [Edge Server Management](./edge-management.md) - Deploy and manage Edge
- [Developer Documentation](../DEVELOPER_GUIDE.md) - Understand technical architecture

---

*YAT Team - Making intranet penetration simpler*
