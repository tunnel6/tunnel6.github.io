# Edge FAQ

> Frequently asked questions about Edge server deployment and operation

---

## 📋 Table of Contents

- [Connection & Status](#connection--status)
- [Logging & Monitoring](#logging--monitoring)
- [Configuration & Deployment](#configuration--deployment)
- [System & Performance](#system--performance)

---

## Connection & Status

### Q: What to do when Edge shows offline?

**Checklist**:
1. Is server running normally
2. Is firewall blocking port 443
3. Is Edge process running
4. Is network connection normal

**Resolution Steps**:

```bash
# 1. Check Edge process
ps aux | grep edge

# 2. Check port
netstat -tlnp | grep 443

# 3. View logs
journalctl -u edge -n 100

# 4. Restart service
sudo systemctl restart edge
```

### Q: Can Edge change IP?

Yes, but need to:
1. Update DNS record
2. Regenerate certificate
3. Restart Edge

---

## Logging & Monitoring

### Q: How to view Edge logs?

```bash
# systemd method
sudo journalctl -u edge -f

# Direct log file
tail -f /var/log/edge.log
```

---

## Configuration & Deployment

### Q: How many Edges can one account create?

Currently no limit, but recommended:
- Personal users: 1-3 Edges
- Team users: 5-10 Edges

---

## System & Performance

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

## 🔗 Related Documentation

- [Edge Server Management](./management.md) — Deploy and manage Edge
- [Startup Parameters](./startup-params.md) — Complete command-line parameter list
- [Config Reference](./config-reference.md) — YAML configuration reference
- [FAQ](../faq.md) — Global FAQ

---

*YAT Team - Making intranet penetration simpler*
