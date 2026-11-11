---
layout: page
sidebar: false
outline: false
title: YAT — Zero-trust tunnels and WireGuard networking
description: Build an identity-aware private network, publish local services through authenticated tunnels, or create WireGuard virtual LANs for device-to-device access.
---

<HomeLanding
  badge="Now supporting WireGuard networking"
  title="Your zero-trust network."
  titleAccent="Tunnels and virtual LANs."
  description="YAT combines identity-aware service tunnels with WireGuard networking. Expose local applications, connect devices into an encrypted virtual LAN, and keep access under your control—without opening inbound ports."
  :primary-action="{ text: 'Start for free', link: '/guide/quick-start' }"
  :secondary-action="{ text: 'Download client', link: '/download' }"
  github-action="View on GitHub"
  :hero-chips="['Zero-trust identity', 'Service tunnels', 'WireGuard virtual LAN', 'mTLS end to end']"
  capability-eyebrow="Platform capabilities"
  capability-title="A private network that behaves like production infrastructure"
  :capabilities="[
    {
      icon: '🔐',
      title: 'Zero-trust connectivity',
      description: 'Authenticate devices and Edge nodes with mTLS. Access follows identity instead of network location or open ports.'
    },
    {
      icon: '🛰️',
      title: 'Tunnels and virtual LANs',
      description: 'Publish HTTP, TCP, and desktop services, or build WireGuard networks for multi-device connectivity.'
    },
    {
      icon: '🧩',
      title: 'Extensible by design',
      description: 'Publish HTTP, TCP, and desktop services, then extend the client with custom applications.'
    },
    {
      icon: '📦',
      title: 'Production deployment',
      description: 'Install a self-hosted Edge on Linux with system scripts, daemon mode, and health visibility.'
    },
    {
      icon: '🌐',
      title: 'Domains that stay yours',
      description: 'Bring your own domain, map CNAME records, and terminate traffic through your controlled Edge.'
    },
    {
      icon: '👥',
      title: 'Smart device networking',
      description: 'WireGuard assigns subnet IPs, detects LAN paths, and selects direct or relay routes automatically.'
    }
  ]"
  workflow-eyebrow="How YAT works"
  workflow-title="From localhost to a controlled public endpoint in minutes"
  workflow-description="No inbound firewall rules or infrastructure rewrites. Start a local service, connect through YAT, and publish it through an authenticated Edge."
  :workflow-steps="[
    {
      title: 'Install and sign in',
      description: 'Install the YAT client and authenticate your device with a secure account.'
    },
    {
      title: 'Connect an Edge',
      description: 'Subscribe to a managed relay or deploy your own private Edge on a public server.'
    },
    {
      title: 'Create the tunnel',
      description: 'Select the local service, protocol, and Edge. YAT generates a ready-to-share remote address.'
    },
    {
      title: 'Control access',
      description: 'Start the tunnel, monitor traffic, share the endpoint, or keep it restricted to your identities.'
    }
  ]"
  terminal-title="Quick start"
  :terminal-lines="[
    '$ python3 -m http.server 8080',
    '',
    '# In YAT',
    '# Tunnels → Create Tunnel → HTTP Proxy',
    '# Local port: 8080 · Edge: production',
    '',
    '$ curl https://api.example.myroxy.dev',
    '200 OK · mTLS verified'
  ]"
  use-case-eyebrow="Use cases"
  use-case-title="Built for real networks, not just demos"
  :use-cases="[
    {
      icon: '🏠',
      title: 'Private home services',
      description: 'Reach NAS dashboards, media tools, and LAN applications without exposing your network.'
    },
    {
      icon: '💻',
      title: 'Share development servers',
      description: 'Give teammates or reviewers controlled access to local APIs and preview environments.'
    },
    {
      icon: '🖥️',
      title: 'Remote desktop',
      description: 'Extend secure ARD and VNC access to macOS and Windows machines.'
    },
    {
      icon: '🎮',
      title: 'Private game servers',
      description: 'Run multiplayer sessions for your group without opening public firewall ports.'
    }
  ]"
  architecture-eyebrow="Two networking models"
  architecture-title="One app for service tunnels and device networks"
  architecture-description="YAT separates exposing a service from building a network, so you can choose the right model without managing another VPN tool."
  :tunnel-mode="{
    icon: '🛣️',
    eyebrow: 'Service access',
    title: 'Tunnel mode',
    description: 'Point-to-point tunnels turn a local service into a controlled remote endpoint for selected visitors.',
    points: [
      'Publish HTTP, TCP, ARD, and VNC services',
      'Route traffic through mTLS-authenticated Edge or P2P',
      'Use custom domains without inbound firewall rules',
      'Separate publisher, consumer, and controller roles'
    ],
    guideLink: '/guide/transport-modes',
    guideLabel: 'Read the tunnel guide'
  }"
  :wireguard-mode="{
    icon: '🛡️',
    eyebrow: 'Device interconnection',
    title: 'WireGuard networking',
    description: 'Create an encrypted virtual LAN where every approved device receives an address in the same subnet.',
    points: [
      'Automatic virtual subnet IP assignment',
      'Kernel-level end-to-end WireGuard encryption',
      'Automatic LAN, public, or relay path selection',
      'Near-native performance for file transfer and databases'
    ],
    guideLink: '/guide/wireguard-networking',
    guideLabel: 'Read the WireGuard guide'
  }"
  cta-title="Deploy your first secure tunnel today."
  cta-description="Download YAT, connect an Edge, and create a zero-trust endpoint or WireGuard virtual LAN in minutes."
  :cta-action="{ text: 'Get started now', link: '/guide/quick-start' }"
  :docs-action="{ text: 'Read the docs', link: '/guide/what-is-yat' }"
/>
