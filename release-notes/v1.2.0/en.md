# YAT Desktop v1.2.0

## What's New

### Networking — WireGuard Private Network

Create and manage your own WireGuard-based private networks directly from YAT. Connect multiple devices into one private network, with automatic subnet assignment and real-time link health monitoring.

- **Create & manage networks** — pick a coordinator Edge node, define a subnet (e.g. `10.24.0.0/24`), and choose a relay mode (disabled / optional / force) to fit your connectivity needs.
- **Device members** — view who has joined, add or remove devices, rename hostnames, and edit assigned IPs from a dedicated detail page.
- **Link state & diagnostics** — inspect peer session status (gathering → punching → connected), path type (direct / relay), and endpoint observations to troubleshoot connectivity.
- **Local config preview** — review the generated WireGuard config before syncing it to the local adapter, with one-click apply.
- **Real-time health** — network cards show online member count, active links, and a health banner (healthy / partial / offline / error) at a glance.

### Bug Fixes

- Fixed a missing-translation fallback warning in the Static File Service panels when running under a non-Simplified-Chinese locale.
- General stability improvements and performance optimizations.

---

Thank you for using YAT — happy tunneling!
