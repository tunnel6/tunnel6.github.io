---
layout: home

hero:
  name: "YAT"
  tagline: YAT (Yet Another Tunnel) 是一个功能强大的内网穿透与应用扩展平台，让您能够安全、快速地从任何地方访问内网服务。
  image:
    src: /images/yat.png
    style: "max-width: 580px; max-height: 580px; padding-top:50px"
    alt: YAT Logo
  actions:
    - theme: brand
      text: 开始
      link: /zh/guide/quick-start
    - theme: alt
      text: 项目
      link: https://github.com/tunnel6/yat
    - theme: alt
      text: 下载
      link: /zh/download

# features:
#   - icon: 🔒
#     title: Zero-Trust Security
#     details: mTLS mutual authentication, end-to-end encryption, ensuring secure data transmission
#   - icon: 🚀
#     title: High Performance
#     details: P2P direct connection, WireGuard support, ultra-low latency and high bandwidth
#   - icon: 🌍
#     title: Global Deployment
#     details: Edge nodes worldwide, intelligent routing, optimal connection quality
#   - icon: 🔌
#     title: Extensible
#     details: Rich extension ecosystem, custom apps, support Vue/React development
#   - icon: 👥
#     title: Multi-Device
#     details: Actor model role management, seamless collaboration across multiple devices
#   - icon: 🎯
#     title: Easy to Use
#     details: Beautiful desktop client, one-click deployment, zero configuration required
---

<script setup>
import { ref } from 'vue'

const stats = ref([
  { value: '10K+', label: 'Active Users' },
  { value: '50+', label: 'Edge Nodes' },
  { value: '99.9%', label: 'Uptime' },
  { value: '24/7', label: 'Support' }
])

const useCases = ref([
  {
    icon: '🏠',
    title: '家庭NAS接入',
    description: '随时随地安全访问您的家庭文件'
  },
  {
    icon: '💻',
    title: '开发共享',
    description: '与团队成员共享本地开发服务器'
  },
  {
    icon: '🖥️',
    title: '远程桌面',
    description: '使用 ARD/VNC 扩展远程控制 Mac/Windows'
  },
  {
    icon: '🎮',
    title: '游戏服务器',
    description: '为朋友们搭建私人游戏服务器'
  }
])
</script>

## 预览

<div class="app-preview">
  <div class="preview-card preview-card--back">
    <img src="/images/snapshot-index-02.png" alt="YAT ARD Running" />
  </div>
  <div class="preview-card preview-card--front">
    <img src="/images/snapshot-index-01.png" alt="YAT My Tunnels" />
  </div>
</div>

<!-- ## Trusted by Developers Worldwide

<div class="stats-section">
  <div v-for="stat in stats" :key="stat.label" class="stat-item">
    <div class="stat-value">{{ stat.value }}</div>
    <div class="stat-label">{{ stat.label }}</div>
  </div>
</div> -->

## 解决方案

<div class="use-cases">
  <div v-for="useCase in useCases" :key="useCase.title" class="use-case-card">
    <div class="use-case-icon">{{ useCase.icon }}</div>
    <h3>{{ useCase.title }}</h3>
    <p>{{ useCase.description }}</p>
  </div>
</div>

<style scoped>
@keyframes breathe-front {
  0%, 100% { transform: scale(1) translateY(0); box-shadow: 0 20px 60px rgba(0,0,0,0.18); }
  50%       { transform: scale(1.04) translateY(-8px); box-shadow: 0 36px 80px rgba(0,0,0,0.28); }
}

@keyframes breathe-back {
  0%, 100% { transform: scale(1.04) translateY(-6px); box-shadow: 0 28px 70px rgba(0,0,0,0.22); }
  50%       { transform: scale(1) translateY(0); box-shadow: 0 16px 50px rgba(0,0,0,0.15); }
}

.app-preview {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 520px;
  margin: 20px 0 60px;
}

.preview-card {
  position: absolute;
  width: 58%;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
}

.preview-card--back {
  right: 4%;
  top: 80px;
  z-index: 2;
  opacity: 0.88;
  animation: breathe-back 4s ease-in-out infinite;
}

.preview-card--front {
  left: 4%;
  top: 0;
  z-index: 1;
  animation: breathe-front 4s ease-in-out infinite;
}

.preview-card img {
  width: 100%;
  display: block;
  border-radius: 18px;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
  margin: 60px 0;
  padding: 40px;
  background: var(--vp-c-bg-soft);
  border-radius: 16px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 3em;
  font-weight: bold;
  color: var(--vp-c-brand);
  margin-bottom: 10px;
}

.stat-label {
  font-size: 1.1em;
  color: var(--vp-c-text-2);
}

.use-cases {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin: 60px 0;
}

.use-case-card {
  padding: 30px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  text-align: center;
  transition: all 0.3s ease;
}

.use-case-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.use-case-icon {
  font-size: 3em;
  margin-bottom: 16px;
}

.use-case-card h3 {
  margin: 16px 0;
  color: var(--vp-c-text-1);
}

.use-case-card p {
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .app-preview {
    height: 360px;
    margin: 0 0 40px;
  }

  .preview-card {
    width: 75%;
  }

  .preview-card--back {
    right: 2%;
    top: 20px;
  }

  .preview-card--front {
    left: 2%;
    top: 0;
  }

  .stats-section {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
