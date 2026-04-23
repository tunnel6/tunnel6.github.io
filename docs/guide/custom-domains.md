# Custom Domains

> Configure custom domains for tunnels to enhance professional image

---

## 📋 Table of Contents

- [Overview](#overview)
- [System-Assigned Domain](#system-assigned-domain)
- [Configure Custom Domain](#configure-custom-domain)
- [DNS Record Setup](#dns-record-setup)
- [Certificate Management](#certificate-management)
- [CNAME Verification](#cname-verification)
- [FAQ](#faq)

---

## Overview

### Why Need Custom Domains?

**System-assigned domain**:
```
https://abc123-def456.edge.myroxy.dev
```

**Custom domain**:
```
https://api.yourcompany.com
```

**Advantages**:
- ✅ More professional appearance
- ✅ Easy to remember
- ✅ Brand consistency
- ✅ SEO friendly

---

## System-Assigned Domain

### Domain Format

Each tunnel is automatically assigned a domain:

```
Format: {subdomain}.{base-domain}
Example: abc123.edge.myroxy.dev
```

### Subdomain Generation Rules

- Uses base36 encoding
- Based on Edge auto-increment ID
- Lifecycle remains unchanged

---

## Configure Custom Domain

### Step 1: Prepare Domain

Ensure you own a domain, e.g., `yourcompany.com`

### Step 2: Add DNS Record

#### HTTP/HTTPS Tunnel

Add **CNAME** record:

```
Type: CNAME
Name: api (or @)
Value: abc123-def456.edge.myroxy.dev
TTL: 300
```

> 📸 ![Tunnel snapshot](/images/guide/snapshot-tunnel-alias-domain.png) DNS Configuration Example
> 
> Description: Shows DNS provider backend, CNAME record configuration

#### TCP/UDP Tunnel

TCP/UDP tunnels **do not support** custom domains, can only use IP:Port.

### Step 3: Configure in YAT

1. Open tunnel details
2. Find **Custom Domain** section
3. Click **Add Domain**
4. Enter your domain
5. Click **Save**

> 📸 ![Tunnel snapshot](/images/guide/snapshot-tunnel-alias-domain-setup.png) YAT Custom Domain Configuration
> 
> Description: Shows domain input, save button, verification status

### Step 4: Verify DNS

YAT will automatically verify DNS configuration:

- ✅ **Verification Passed** - Domain available, auto-apply certificate
- ⏳ **Verifying** - Waiting for DNS propagation
- ❌ **Verification Failed** - Check DNS record

---

## DNS Record Setup

### Common DNS Providers

#### Cloudflare

1. Login to Cloudflare Dashboard
2. Select domain
3. Click **DNS**
4. Add CNAME record


#### Alibaba Cloud

1. Login to Alibaba Cloud Console
2. Go to **DNS Resolution**
3. Select domain
4. Add record

#### Tencent Cloud

1. Login to Tencent Cloud Console
2. Go to **DNS Resolution**
3. Select domain
4. Add record

### DNS Propagation Time

- **Typical**: 1-5 minutes
- **Maximum**: 48 hours
- **TTL Setting**: Recommended 300 seconds (5 minutes)

### Verify DNS Configuration

```bash
# Using dig
dig api.yourcompany.com CNAME

# Using nslookup
nslookup -type=CNAME api.yourcompany.com

# Test with curl
curl -I https://api.yourcompany.com
```

---

## Certificate Management

### Automatic Certificate Issuance

After verification passes, YAT will automatically:

1. **DNS-01 Challenge** - Verify domain ownership
2. **Apply Certificate** - Let's Encrypt free certificate
3. **Configure TLS** - Auto-enable HTTPS
4. **Certificate Renewal** - Auto-renew before expiration

### Certificate Status

| Status | Description | Action |
|--------|-------------|--------|
| **Normal** | Certificate valid | No action needed |
| **Expiring Soon** | Expires within 30 days | Wait for auto-renewal |
| **Expired** | Certificate expired | Manually trigger renewal |
| **Application Failed** | Challenge failed | Check DNS |

### Manually Renew Certificate

1. Enter tunnel details
2. Click **Renew Certificate** button
3. Wait for completion

---

## CNAME Verification

### Verification Process

```
1. YAT checks DNS record
   ↓
2. Resolve CNAME target
   ↓
3. Compare with system-assigned domain
   ↓
4. Return verification result
```

### Verification Failure Troubleshooting

#### Issue 1: DNS Record Not Effective

**Symptom**: Verification failed, DNS record mismatch

**Solution**:
```bash
# Wait for DNS propagation
# Or flush local DNS cache

# macOS
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

# Linux
sudo systemd-resolve --flush-caches

# Windows
ipconfig /flushdns
```

#### Issue 2: Incorrect CNAME Value

**Symptom**: CNAME target address incorrect

**Solution**:
1. Check if CNAME value is system-assigned domain
2. Copy correct domain
3. Update DNS record

#### Issue 3: Using A Record Instead of CNAME

**Symptom**: Configured A record

**Solution**:
- Must use **CNAME** record
- Cannot use A record pointing to IP

---

## FAQ

### Q: Can one tunnel configure multiple custom domains?

Currently **does not support** multiple domains. One tunnel can only configure one custom domain.

### Q: Do custom domains require additional payment?

**No**. YAT provides free certificates and domain configuration.

### Q: Are wildcard domains supported?

Currently **does not support** wildcard domains (e.g., `*.example.com`).

### Q: Do TCP/UDP tunnels support custom domains?

**No**. TCP/UDP tunnels can only use IP:Port.

### Q: Will certificate auto-renew after expiration?

**Yes**. YAT will auto-renew 30 days before expiration.

### Q: How to view certificate information?

In tunnel details' **Domain Status** section, you can see:
- Certificate issuer
- Validity period
- Status

---

## 💡 Best Practices

### 1. Choose Subdomain

```
✅ api.yourcompany.com     - API service
✅ app.yourcompany.com     - Web application
✅ dev.yourcompany.com     - Development environment
❌ yourcompany.com         - Root domain (not recommended)
```

### 2. Set Reasonable TTL

- **Development**: 60 seconds (quick switching)
- **Production**: 300 seconds (balance performance and flexibility)

### 3. Monitor Certificate Status

Regularly check certificate status to ensure auto-renewal works properly.

### 4. Use HTTPS

Always use HTTPS to avoid mixed content warnings.

---

## 📚 Related Documentation

- [Tunnel Management](./tunnel-management.md) - Create and manage tunnels
- [Edge Server Management](./edge-management.md) - Edge domain configuration
- [FAQ](./faq.md) - Solve domain-related issues

---

*YAT Team - Making intranet penetration simpler*
