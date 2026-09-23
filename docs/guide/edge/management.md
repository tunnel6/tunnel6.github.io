# Edge Server Management

> Understand Edge server concepts, architecture, and daily management

---

## What is Edge Server

Edge server is YAT network's **core node**, responsible for:

- 🔄 **Traffic Forwarding** — Relay traffic between clients and servers
- 🔐 **mTLS Authentication** — Mutual TLS verification
- 📊 **Status Sync** — Real-time tunnel status synchronization
- 🌐 **Domain Management** — Assign and manage tunnel domains

### Why Need Edge?

```
Traditional solution (requires public IP + port forwarding):
  External users → Router configuration → Internal service

YAT solution (no configuration needed):
  External users → Edge server → Internal service
```

**Advantages**: No public IP required, no router configuration, automatic encryption, global deployment

### Edge Types

| Type | Description | Use Case |
|------|-------------|----------|
| **Self-built Edge** | Edge you deploy yourself | Production environment, private deployment |
| **Shared Edge** | Edge shared by others | Testing, personal use |

---

## Architecture & Startup

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
└── Binary (edge)
```

### Startup Process

```
1. Bootstrap - Initialize configuration
2. RegisterNode - Register with Captain
3. Subscribe - Subscribe to control flow
4. Heartbeat - Heartbeat keep-alive
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

- **Name** — Edge name
- **Status** — Online/Offline (with icon)
- **Public IP** — Edge's public IP address
- **Domain** — System-assigned domain
- **Tunnel Count** — Number of tunnels on this Edge
- **Service Status** — Status of various services

### Edge Operations

#### View Details

Click **Details** button to view:

- Basic information
- Network information (IP, domain)
- Domain health status
- Service running status
- Tunnel list

> 📸 ![Edge snapshot](/images/guide/snapshot-edge-manage.png) Edge Details Page

#### Manage Configuration

Click **Manage** button (self-built Edge only):

- Modify name
- Modify description
- Restart Edge
- View deployment commands

#### Delete Edge

Click **Delete** button:

> ⚠️ **Warning**:
> - Deleting Edge will clean up all related tunnels
> - Certificates will be revoked
> - Domains will be released

### Monitor Edge Status

- 🟢 **Online** — Edge running normally
- 🔴 **Offline** — Edge unreachable
- 🟡 **Abnormal** — Some services abnormal

---

## Domain & Health Check

### System-Assigned Domain

Each Edge is automatically assigned a domain:

```
Format: {edge-id}.edge.myroxy.dev
Example: abc123.edge.myroxy.dev
```

### Custom Domain

You can configure custom domain for Edge:

1. Add custom domain in Edge management (e.g., `edge.example.com`)
2. Add CNAME record pointing to the system-assigned domain
3. YAT automatically verifies DNS configuration
4. After verification, Let's Encrypt certificate is applied automatically

### Health Check

YAT checks Edge domain health every 5 minutes:

| Status | Description | Action |
|--------|-------------|--------|
| **Normal** | DNS and certificate both normal | No action needed |
| **DNS Abnormal** | DNS record has issues | Check DNS configuration |
| **Certificate Abnormal** | Certificate expired or invalid | Regenerate certificate |
| **Unknown** | Cannot detect | Check Edge connection |

---

## 📚 Related Documentation

- [Deploy Edge Server](./deploy.md) — Quick deploy your Edge node
- [WireGuard Configuration](./wireguard.md) — Enable WireGuard networking
- [Config Reference](./config-reference.md) — config.yaml complete reference
- [CLI Reference](./cli-reference.md) — Command-line tool reference
- [FAQ](./faq.md) — Edge deployment and runtime issues
- [Custom Domains](./custom-domains.md) — Domain configuration details
- [WireGuard Networking](./wireguard-networking.md) — Build virtual LANs

---

*YAT Team - Making intranet penetration simpler*
