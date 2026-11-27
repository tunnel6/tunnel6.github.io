---
layout: page
title: Features
---

<script setup>
import { ref } from 'vue'

const coreFeatures = ref([
  {
    icon: '🔒',
    title: 'Zero-Trust Security',
    description: 'mTLS mutual authentication ensures both client and server verify each other identity',
    items: [
      'End-to-end encryption',
      'Certificate auto-renewal',
      'Revocation support',
      'No middleman attacks'
    ]
  },
  {
    icon: '🚀',
    title: 'High Performance',
    description: 'Multiple transport modes optimized for different scenarios',
    items: [
      'P2P direct connection (5-50ms)',
      'WireGuard VPN mode',
      'Auto fallback mechanism',
      'Bandwidth up to 2Gbps'
    ]
  },
  {
    icon: '🌐',
    title: 'Protocol Support',
    description: 'Support all major network protocols',
    items: [
      'HTTP/HTTPS proxy',
      'TCP forwarding',
      'UDP forwarding',
      'WireGuard VPN'
    ]
  },
  {
    icon: '🖥️',
    title: 'Edge Network',
    description: 'Deploy Edge servers globally for optimal performance',
    items: [
      'One-click deployment',
      'Auto health monitoring',
      'Custom domain support',
      'Shared marketplace'
    ]
  }
])

const extensionFeatures = ref([
  {
    icon: '🔌',
    title: 'Extension System',
    description: 'Extensible architecture for custom remote access scenarios',
    items: [
      'Vue/React support',
      'Custom configuration forms',
      'Lifecycle hooks',
      'Host API access'
    ]
  },
  {
    icon: '👥',
    title: 'Multi-Device Collaboration',
    description: 'Actor model for clear role management',
    items: [
      'Publisher/Consumer roles',
      'Auto role assignment',
      'Session management',
      'Permission control'
    ]
  },
  {
    icon: '🎨',
    title: 'Beautiful UI',
    description: 'Modern desktop application with excellent UX',
    items: [
      'Light/Dark themes',
      'Multi-language support',
      'Real-time status',
      'Traffic statistics'
    ]
  },
  {
    icon: '🛡️',
    title: 'Reliability',
    description: 'Enterprise-grade stability and monitoring',
    items: [
      'Auto reconnection',
      'Heartbeat monitoring',
      'Error recovery',
      '99.9% uptime'
    ]
  }
])
</script>

# Features

Discover what makes YAT the best choice for intranet penetration.

## Core Features

<div class="features-grid">
  <div v-for="feature in coreFeatures" :key="feature.title" class="feature-card">
    <div class="feature-icon">{{ feature.icon }}</div>
    <h3>{{ feature.title }}</h3>
    <p>{{ feature.description }}</p>
    <ul>
      <li v-for="item in feature.items">{{ item }}</li>
    </ul>
  </div>
</div>

## Extension & Collaboration

<div class="features-grid">
  <div v-for="feature in extensionFeatures" :key="feature.title" class="feature-card">
    <div class="feature-icon">{{ feature.icon }}</div>
    <h3>{{ feature.title }}</h3>
    <p>{{ feature.description }}</p>
    <ul>
      <li v-for="item in feature.items">{{ item }}</li>
    </ul>
  </div>
</div>

<style scoped>
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin: 40px 0;
}

.feature-card {
  padding: 30px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 3em;
  margin-bottom: 16px;
}

.feature-card h3 {
  font-size: 1.5em;
  margin: 16px 0;
  color: var(--vp-c-text-1);
}

.feature-card p {
  color: var(--vp-c-text-2);
  margin-bottom: 20px;
  line-height: 1.6;
}

.feature-card ul {
  list-style: none;
  padding: 0;
}

.feature-card li {
  padding: 8px 0;
  padding-left: 24px;
  position: relative;
  color: var(--vp-c-text-2);
}

.feature-card li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--vp-c-brand);
  font-weight: bold;
}
</style>
