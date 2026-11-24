---
layout: page
sidebar: false
outline: false
title: YAT — 零信任隧道與 WireGuard 組網
description: 建立以身份為基礎的私有網路，透過認證隧道發布本地服務，或使用 WireGuard 組建設備互聯虛擬區域網路。
---

<HomeLanding
  badge="現已支援 WireGuard 組網"
  title="你的零信任網路。"
  titleAccent="隧道與虛擬區域網路。"
  description="YAT 結合以身份為基礎的服務隧道與 WireGuard 組網：發布本地應用、將設備接入加密虛擬區域網路，無需開放入站連接埠即可維持可控存取。"
  :primary-action="{ text: '免費開始', link: 'https://dash.tunnel6.com/login?redirect=%2F&source=wiki&locale=zh-TW', target: '_blank' }"
  :secondary-action="{ text: '下載用戶端', link: '/zh-TW/download.html' }"
  github-action="查看 GitHub"
  :hero-chips="['零信任身份', '服務隧道', 'WireGuard 虛擬區域網路', 'mTLS 端對端']"
  capability-eyebrow="平台能力"
  capability-title="一套像生產基礎設施一樣可控的私有網路"
  :capabilities="[
    {
      icon: '🔐',
      title: '零信任連線',
      description: '設備與 Edge 節點使用 mTLS 雙向認證；存取由身份決定，而不是由網路位置或開放連接埠決定。'
    },
    {
      icon: '🛰️',
      title: '隧道與虛擬區域網路',
      description: '發布 HTTP、TCP 與桌面服務，或建立 WireGuard 網路，讓多台設備安全互聯。'
    },
    {
      icon: '🧩',
      title: '可擴充設計',
      description: '發布 HTTP、TCP 與遠端桌面服務，並用自訂應用擴充用戶端能力。'
    },
    {
      icon: '📦',
      title: '生產級部署',
      description: '在 Linux 上自架 Edge，支援部署腳本、常駐服務與執行狀態可見。'
    },
    {
      icon: '🌐',
      title: '自訂網域',
      description: '攜帶自己的網域、設定 CNAME，讓流量經過你掌控的 Edge 節點。'
    },
    {
      icon: '👥',
      title: '智慧設備組網',
      description: 'WireGuard 自動分配子網 IP，識別區域網路路徑，並在直連與中繼之間選擇最佳路由。'
    }
  ]"
  workflow-eyebrow="運作方式"
  workflow-title="幾分鐘內，把本地服務變成可控公網入口"
  workflow-description="無需修改入站防火牆，也不需要重構基礎設施。啟動本地服務、連接 YAT，再透過認證 Edge 發布存取入口。"
  :workflow-steps="[
    { title: '安裝並登入', description: '安裝 YAT 用戶端，並使用安全帳號認證你的設備。' },
    { title: '接入 Edge', description: '訂閱託管中繼節點，或在公網伺服器上部署私有 Edge。' },
    { title: '建立隧道', description: '選擇本地服務、協議與 Edge，YAT 會生成可分享的遠端地址。' },
    { title: '控制存取', description: '啟動隧道、監控流量、分享入口，或繼續限制給指定身份存取。' }
  ]"
  terminal-title="快速開始"
  :terminal-lines="[
    '$ python3 -m http.server 8080',
    '',
    '# 在 YAT 中',
    '# 隧道 → 建立隧道 → HTTP 代理',
    '# 本地連接埠：8080 · Edge：production',
    '',
    '$ curl https://api.example.myroxy.dev',
    '200 OK · mTLS verified'
  ]"
  use-case-eyebrow="應用場景"
  use-case-title="面向真實網路，而不只是展示環境"
  :use-cases="[
    { icon: '🏠', title: '家庭私有服務', description: '安全存取 NAS 面板、媒體工具與內網應用，不暴露家庭網路。' },
    { icon: '💻', title: '共享開發服務', description: '讓團隊成員或審查者按需存取本地 API 與預覽環境。' },
    { icon: '🖥️', title: '遠端桌面', description: '透過擴充功能安全存取 macOS 與 Windows 設備的 ARD 和 VNC。' },
    { icon: '🎮', title: '私人遊戲伺服器', description: '為小組執行多人連線服務，無需開放公網防火牆連接埠。' }
  ]"
  architecture-eyebrow="兩種組網模式"
  architecture-title="一個應用，涵蓋服務隧道與設備網路"
  architecture-description="YAT 將「發布單一服務」與「組建設備網路」分開建模，讓你不必再維護另一套 VPN 工具。"
  :tunnel-mode="{
    icon: '🛣️',
    eyebrow: '服務存取',
    title: '隧道模式',
    description: '點對點隧道把本地服務轉換成可控遠端入口，只授權給指定存取者。',
    points: [
      '發布 HTTP、TCP、ARD 與 VNC 服務',
      '透過 mTLS 認證的 Edge 或 P2P 路由流量',
      '使用自訂網域，不開放入站防火牆',
      '分離發布者、存取者與控制者角色'
    ],
    guideLink: '/zh-TW/guide/transport-modes.html',
    guideLabel: '閱讀隧道指南'
  }"
  :wireguard-mode="{
    icon: '🛡️',
    eyebrow: '設備互聯',
    title: 'WireGuard 組網',
    description: '建立加密虛擬區域網路，讓每台經過批准的設備取得同一子網中的地址。',
    points: [
      '自動分配虛擬子網 IP',
      'WireGuard 核心層端對端加密',
      '自動選擇區域網路、公網或中繼路徑',
      '檔案傳輸與資料庫存取接近原生效能'
    ],
    guideLink: '/zh-TW/guide/wireguard-networking.html',
    guideLabel: '閱讀 WireGuard 指南'
  }"
  cta-title="今天部署你的第一條安全隧道。"
  cta-description="下載 YAT、接入 Edge，幾分鐘內建立零信任入口或 WireGuard 虛擬區域網路。"
  :cta-action="{ text: '立即開始', link: 'https://dash.tunnel6.com/login?redirect=%2F&source=wiki&locale=zh-TW', target: '_blank' }"
  :docs-action="{ text: '閱讀文件', link: '/zh-TW/guide/what-is-yat.html' }"
/>
