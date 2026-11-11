---
layout: page
sidebar: false
outline: false
title: YAT — 零信任隧道与 WireGuard 组网
description: 构建基于身份的私有网络，通过认证隧道发布本地服务，或使用 WireGuard 组建设备互联虚拟局域网。
---

<HomeLanding
  badge="现已支持 WireGuard 组网"
  title="你的零信任网络。"
  titleAccent="隧道与虚拟局域网。"
  description="YAT 将基于身份的服务隧道与 WireGuard 组网结合：发布本地应用，把设备接入加密虚拟局域网，无需开放入站端口即可保持访问可控。"
  :primary-action="{ text: '免费开始', link: '/zh/guide/quick-start' }"
  :secondary-action="{ text: '下载客户端', link: '/zh/download' }"
  github-action="查看 GitHub"
  :hero-chips="['零信任身份', '服务隧道', 'WireGuard 虚拟局域网', 'mTLS 端到端']"
  capability-eyebrow="平台能力"
  capability-title="一套像生产基础设施一样可控的私有网络"
  :capabilities="[
    {
      icon: '🔐',
      title: '零信任连接',
      description: '设备和 Edge 节点使用 mTLS 双向认证；访问由身份决定，而不是由网络位置或开放端口决定。'
    },
    {
      icon: '🛰️',
      title: '隧道与虚拟局域网',
      description: '发布 HTTP、TCP 和桌面服务，或创建 WireGuard 网络，让多台设备安全互联。'
    },
    {
      icon: '🧩',
      title: '可扩展设计',
      description: '发布 HTTP、TCP 和远程桌面服务，并用自定义应用扩展客户端能力。'
    },
    {
      icon: '📦',
      title: '生产级部署',
      description: '在 Linux 上自托管 Edge，支持部署脚本、守护进程和运行状态可见。'
    },
    {
      icon: '🌐',
      title: '自定义域名',
      description: '携带自己的域名，配置 CNAME，让流量经过你掌控的 Edge 节点。'
    },
    {
      icon: '👥',
      title: '智能设备组网',
      description: 'WireGuard 自动分配子网 IP，识别局域网路径，并在直连和中继之间选择最佳路由。'
    }
  ]"
  workflow-eyebrow="工作方式"
  workflow-title="几分钟内，把本地服务变成可控公网入口"
  workflow-description="无需修改入站防火墙，也不需要重构基础设施。启动本地服务，连接 YAT，再通过认证 Edge 发布访问入口。"
  :workflow-steps="[
    {
      title: '安装并登录',
      description: '安装 YAT 客户端，并使用安全账号认证你的设备。'
    },
    {
      title: '接入 Edge',
      description: '订阅托管中继节点，或在公网服务器上部署私有 Edge。'
    },
    {
      title: '创建隧道',
      description: '选择本地服务、协议和 Edge，YAT 会生成可分享的远程地址。'
    },
    {
      title: '控制访问',
      description: '启动隧道、监控流量、分享入口，或继续限制给指定身份访问。'
    }
  ]"
  terminal-title="快速开始"
  :terminal-lines="[
    '$ python3 -m http.server 8080',
    '',
    '# 在 YAT 中',
    '# 隧道 → 创建隧道 → HTTP 代理',
    '# 本地端口：8080 · Edge：production',
    '',
    '$ curl https://api.example.myroxy.dev',
    '200 OK · mTLS verified'
  ]"
  use-case-eyebrow="应用场景"
  use-case-title="面向真实网络，而不只是演示环境"
  :use-cases="[
    {
      icon: '🏠',
      title: '家庭私有服务',
      description: '安全访问 NAS 面板、媒体工具和内网应用，不暴露家庭网络。'
    },
    {
      icon: '💻',
      title: '共享开发服务',
      description: '让团队成员或评审者按需访问本地 API 和预览环境。'
    },
    {
      icon: '🖥️',
      title: '远程桌面',
      description: '通过扩展安全访问 macOS 和 Windows 设备的 ARD 与 VNC。'
    },
    {
      icon: '🎮',
      title: '私人游戏服务器',
      description: '为小组运行多人联机服务，无需开放公网防火墙端口。'
    }
  ]"
  architecture-eyebrow="两种组网模式"
  architecture-title="一个应用，覆盖服务隧道与设备网络"
  architecture-description="YAT 把“发布单个服务”和“组建设备网络”分开建模，让你不必再维护另一套 VPN 工具。"
  :tunnel-mode="{
    icon: '🛣️',
    eyebrow: '服务访问',
    title: '隧道模式',
    description: '点对点隧道把本地服务转换成可控远程入口，只授权给指定访问者。',
    points: [
      '发布 HTTP、TCP、ARD 和 VNC 服务',
      '通过 mTLS 认证的 Edge 或 P2P 路由流量',
      '使用自定义域名，不开放入站防火墙',
      '分离发布者、访问者和控制者角色'
    ],
    guideLink: '/zh/guide/transport-modes',
    guideLabel: '阅读隧道指南'
  }"
  :wireguard-mode="{
    icon: '🛡️',
    eyebrow: '设备互联',
    title: 'WireGuard 组网',
    description: '创建加密虚拟局域网，让每台经过批准的设备获得同一子网中的地址。',
    points: [
      '自动分配虚拟子网 IP',
      'WireGuard 内核级端到端加密',
      '自动选择局域网、公网或中继路径',
      '文件传输和数据库访问接近原生性能'
    ],
    guideLink: '/zh/guide/wireguard-networking',
    guideLabel: '阅读 WireGuard 指南'
  }"
  cta-title="今天部署你的第一条安全隧道。"
  cta-description="下载 YAT，接入 Edge，几分钟内创建零信任入口或 WireGuard 虚拟局域网。"
  :cta-action="{ text: '立即开始', link: '/zh/guide/quick-start' }"
  :docs-action="{ text: '阅读文档', link: '/zh/guide/what-is-yat' }"
/>
