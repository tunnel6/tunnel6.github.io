import { defineConfig } from 'vitepress'

function guideSidebar(prefix, text) {
  return [
    {
      text: text.gettingStarted,
      items: [
        { text: text.whatIsYat, link: `${prefix}/guide/what-is-yat` },
        { text: text.quickStart, link: `${prefix}/guide/quick-start` },
        { text: text.macosInstall, link: `${prefix}/guide/macos-unsigned-install` }
      ]
    },
    {
      text: text.coreFeatures,
      items: [
        { text: text.tunnelManagement, link: `${prefix}/guide/tunnel-management` },
        {
          text: text.edgeManagement,
          link: `${prefix}/guide/edge/`,
          collapsed: true,
          items: [
            { text: text.edgeServerManagement, link: `${prefix}/guide/edge/management` },
            { text: text.deployEdge, link: `${prefix}/guide/edge/deploy` },
            { text: text.edgeMarket, link: `${prefix}/guide/edge/market` },
            { text: text.wireguardConfiguration, link: `${prefix}/guide/edge/wireguard` },
            { text: text.configReference, link: `${prefix}/guide/edge/config-reference` },
            { text: text.cliReference, link: `${prefix}/guide/edge/cli-reference` },
            { text: text.startupParameters, link: `${prefix}/guide/edge/startup-params` },
            { text: text.edgeFaq, link: `${prefix}/guide/edge/faq` }
          ]
        },
        { text: text.appsAndExtensions, link: `${prefix}/guide/apps-and-extensions` },
        { text: text.customDomains, link: `${prefix}/guide/custom-domains` }
      ]
    },
    {
      text: text.advanced,
      items: [
        { text: text.transportModes, link: `${prefix}/guide/transport-modes` },
        { text: text.wireguardNetworking, link: `${prefix}/guide/wireguard-networking` },
        { text: text.multiDeviceRoles, link: `${prefix}/guide/multi-device-roles` },
        { text: text.accountSettings, link: `${prefix}/guide/account-settings` },
        { text: text.faq, link: `${prefix}/guide/faq` }
      ]
    },
    {
      text: text.references,
      items: [
        { text: text.releaseNotes, link: `${prefix}/release-notes/` }
      ]
    }
  ]
}

export default defineConfig({
  title: 'YAT(Yet Another Tunnel)',
  description: 'Yet Another Tunnel - Making intranet penetration simpler',
  base: '/',
  head: [
    [
      'script',
      { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=G-7PLNTDZKVT' }
    ],
    [
      'script',
      {},
      ` window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-7PLNTDZKVT');`
    ],
    ['link', { rel: 'icon', href: '/images/favicon.png' }]
  ],
  // 忽略死链检查（允许文档中存在暂时未实现的链接）
  ignoreDeadLinks: true,
  // Root-level page files (index/download/about/features/pricing and their
  // translations) live under pages/ but keep their original /, /download,
  // /zh/... URLs. Guide translations live under guide/<locale>/ and are
  // exposed under /<locale>/guide/...
  rewrites: {
    'pages/:path*': ':path*',
    'guide/zh/:path*': 'zh/guide/:path*',
    'guide/zh-TW/:path*': 'zh-TW/guide/:path*',
    'guide/es/:path*': 'es/guide/:path*',
    'guide/ja/:path*': 'ja/guide/:path*'
  },
  srcExclude: [
    'blog/en/**',
    'blog/zh/**',
    'blog/es/**',
    'blog/ja/**',
    'release-notes/*/*.md'
  ],

  // 多语言配置
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      link: '/',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/' },
          // { text: 'Features', link: '/features' },
          { text: 'Docs', link: '/guide/what-is-yat' },
          { text: 'Download', link: '/download' },
          { text: 'Blog', link: '/blog/' }
          // { text: 'Pricing', link: '/pricing' },
        ],
        sidebar: {
          '/guide/': [
            {
              text: 'Getting Started',
              items: [
                { text: 'What is YAT', link: '/guide/what-is-yat' },
                { text: 'Quick Start', link: '/guide/quick-start' },
                { text: 'macOS Install (Unsigned)', link: '/guide/macos-unsigned-install' }
              ]
            },
            {
              text: 'Core Features',
              items: [
                { text: 'Tunnel Management', link: '/guide/tunnel-management' },
                {
                  text: 'Edge Management',
                  link: '/guide/edge/',
                  collapsed: true,
                  items: [
                    { text: 'Edge Server Management', link: '/guide/edge/management' },
                    { text: 'Deploy Edge', link: '/guide/edge/deploy' },
                    { text: 'Edge Marketplace and Sharing', link: '/guide/edge/market' },
                    { text: 'WireGuard Configuration', link: '/guide/edge/wireguard' },
                    { text: 'Config Reference', link: '/guide/edge/config-reference' },
                    { text: 'CLI Reference', link: '/guide/edge/cli-reference' },
                    { text: 'Startup Parameters', link: '/guide/edge/startup-params' },
                    { text: 'FAQ', link: '/guide/edge/faq' }
                  ]
                },
                { text: 'Apps & Extensions', link: '/guide/apps-and-extensions' },
                { text: 'Custom Domains', link: '/guide/custom-domains' }
              ]
            },
            {
              text: 'Advanced',
              items: [
                { text: 'Transport Modes', link: '/guide/transport-modes' ,},
                { text: 'WireGuard Networking', link: '/guide/wireguard-networking' },
                { text: 'Multi-Device & Roles', link: '/guide/multi-device-roles' },
                { text: 'Account & Settings', link: '/guide/account-settings' },
                { text: 'FAQ', link: '/guide/faq' }
              ]
            },
            {
              text: 'References',
              items: [
                { text: 'Release Notes', link: '/release-notes/' }
              ]
            }
          ],
          '/developer/': [
            {
              text: 'Developer Guide',
              items: [
                { text: 'Architecture', link: '/developer/architecture' },
                { text: 'Getting Started', link: '/developer/getting-started' }
              ]
            },
            {
              text: 'Extension Development',
              items: [
                { text: 'Overview', link: '/developer/extension-overview' },
                { text: 'Type System', link: '/developer/type-system' },
                { text: 'Host API', link: '/developer/host-api' },
                { text: 'Examples', link: '/developer/examples' }
              ]
            }
          ]
        },
        '/blog/': [
          {
            text: 'Blog',
            items: [
              { text: 'All Posts', link: '/blog/' }
            ]
          }
        ],
        footer: {
          message: 'Released under the MIT License.',
          copyright: 'Copyright © 2026 YAT Team · <a href="/legal/privacy">Privacy Policy</a> · <a href="/legal/eula">Terms of Service</a>'
        }
      }
    },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      link: '/zh/',
      themeConfig: {
        nav: [
          { text: '首页', link: '/zh/' },
          // { text: '功能', link: '/guide/zh/features' },
          { text: '下载', link: '/zh/download' },
          { text: '文档', link: '/zh/guide/what-is-yat' },
          { text: '博客', link: '/blog/?lang=zh' }
          // { text: '定价', link: '/zh/pricing' },
        ],
        sidebar: {
          '/zh/guide/': [
            {
              text: '快速开始',
              items: [
                { text: 'YAT 是什么', link: '/zh/guide/what-is-yat' },
                { text: '快速上手', link: '/zh/guide/quick-start' },
                { text: 'macOS 安装指南（未签名）', link: '/zh/guide/macos-unsigned-install' }
              ]
            },
            {
              text: '核心功能',
              items: [
                { text: '隧道管理', link: '/zh/guide/tunnel-management' },
                {
                  text: 'Edge 管理',
                  link: '/zh/guide/edge/',
                  collapsed: true,
                  items: [
                    { text: 'Edge 服务器管理', link: '/zh/guide/edge/management' },
                    { text: '部署 Edge', link: '/zh/guide/edge/deploy' },
                    { text: 'WireGuard 配置', link: '/zh/guide/edge/wireguard' },
                    { text: '配置参数参考', link: '/zh/guide/edge/config-reference' },
                    { text: 'CLI 命令参考', link: '/zh/guide/edge/cli-reference' },
                    { text: '启动参数参考', link: '/zh/guide/edge/startup-params' },
                    { text: 'Edge 市场与共享', link: '/zh/guide/edge/market' },
                    { text: '常见问题', link: '/zh/guide/edge/faq' }
                  ]
                },
                { text: '应用与扩展', link: '/zh/guide/apps-and-extensions' },
                { text: '自定义域名', link: '/zh/guide/custom-domains' }
              ]
            },
            {
              text: '高级功能',
              items: [
                { text: '传输模式', link: '/zh/guide/transport-modes' },
                { text: 'WireGuard 组网', link: '/zh/guide/wireguard-networking' },
                { text: '多设备与角色', link: '/zh/guide/multi-device-roles' },
                { text: '账户与设置', link: '/zh/guide/account-settings' },
                { text: '常见问题', link: '/zh/guide/faq' }
              ]
            },
            {
              text: '参考资料',
              items: [
                { text: '更新说明', link: '/zh/release-notes/' }
              ]
            }
          ],
          '/zh/developer/': [
            {
              text: '开发者指南',
              items: [
                { text: '架构设计', link: '/guide/zh/developer/architecture' },
                { text: '快速开始', link: '/guide/zh/developer/getting-started' }
              ]
            },
            {
              text: '扩展开发',
              items: [
                { text: '概述', link: '/guide/zh/developer/extension-overview' },
                { text: '类型系统', link: '/guide/zh/developer/type-system' },
                { text: 'Host API', link: '/guide/zh/developer/host-api' },
                { text: '示例', link: '/guide/zh/developer/examples' }
              ]
            }
          ]
        },
        footer: {
          message: '基于 MIT 许可证发布。',
          copyright: '版权所有 © 2026 YAT Team · <a href="/zh/legal/privacy">隐私政策</a> · <a href="/zh/legal/eula">服务条款</a>'
        }
      }
    },
    'zh-TW': {
      label: '繁體中文',
      lang: 'zh-TW',
      link: '/zh-TW/',
      themeConfig: {
        nav: [
          { text: '首頁', link: '/zh-TW/' },
          { text: '下載', link: '/zh-TW/download' },
          { text: '文件', link: '/zh-TW/guide/what-is-yat' },
          { text: '部落格', link: '/blog/?lang=zh' }
        ],
        sidebar: {
          '/zh-TW/guide/': guideSidebar('/zh-TW', {
            gettingStarted: '快速開始',
            whatIsYat: 'YAT 是什麼',
            quickStart: '快速上手',
            macosInstall: 'macOS 安裝指南（未簽名）',
            coreFeatures: '核心功能',
            tunnelManagement: '隧道管理',
            edgeManagement: 'Edge 管理',
            edgeServerManagement: 'Edge 伺服器管理',
            deployEdge: '部署 Edge',
            edgeMarket: 'Edge 市場與共享',
            wireguardConfiguration: 'WireGuard 配置',
            configReference: '配置參數參考',
            cliReference: 'CLI 命令參考',
            startupParameters: '啟動參數參考',
            edgeFaq: '常見問題',
            appsAndExtensions: '應用與擴充功能',
            customDomains: '自訂網域',
            advanced: '進階功能',
            transportModes: '傳輸模式',
            wireguardNetworking: 'WireGuard 組網',
            multiDeviceRoles: '多設備與角色',
            accountSettings: '帳戶與設定',
            faq: '常見問題',
            references: '參考資料',
            releaseNotes: '更新說明'
          })
        },
        footer: {
          message: '以 MIT 授權條款發布。',
          copyright: '版權所有 © 2026 YAT Team'
        }
      }
    },
    es: {
      label: 'Español',
      lang: 'es',
      link: '/es/',
      themeConfig: {
        nav: [
          { text: 'Inicio', link: '/es/' },
          { text: 'Descargar', link: '/es/download' },
          { text: 'Documentación', link: '/es/guide/what-is-yat' },
          { text: 'Blog', link: '/blog/?lang=es' }
        ],
        sidebar: {
          '/es/guide/': guideSidebar('/es', {
            gettingStarted: 'Primeros pasos',
            whatIsYat: 'Qué es YAT',
            quickStart: 'Inicio rápido',
            macosInstall: 'Guía de instalación de macOS (sin firmar)',
            coreFeatures: 'Funciones principales',
            tunnelManagement: 'Gestión de túneles',
            edgeManagement: 'Gestión de Edge',
            edgeServerManagement: 'Gestión de servidores Edge',
            deployEdge: 'Desplegar Edge',
            edgeMarket: 'Mercado de Edge',
            wireguardConfiguration: 'Configuración de WireGuard',
            configReference: 'Referencia de configuración',
            cliReference: 'Referencia de CLI',
            startupParameters: 'Parámetros de arranque',
            edgeFaq: 'Preguntas frecuentes',
            appsAndExtensions: 'Apps y extensiones',
            customDomains: 'Dominios personalizados',
            advanced: 'Avanzado',
            transportModes: 'Modos de transporte',
            wireguardNetworking: 'Redes WireGuard',
            multiDeviceRoles: 'Multidispositivo y roles',
            accountSettings: 'Cuenta y ajustes',
            faq: 'Preguntas frecuentes',
            references: 'Referencias',
            releaseNotes: 'Notas de la versión'
          })
        },
        footer: {
          message: 'Publicado bajo la licencia MIT.',
          copyright: 'Copyright © 2026 YAT Team'
        }
      }
    },
    ja: {
      label: '日本語',
      lang: 'ja',
      link: '/ja/',
      themeConfig: {
        nav: [
          { text: 'ホーム', link: '/ja/' },
          { text: 'ダウンロード', link: '/ja/download' },
          { text: 'ドキュメント', link: '/ja/guide/what-is-yat' },
          { text: 'ブログ', link: '/blog/?lang=ja' }
        ],
        sidebar: {
          '/ja/guide/': guideSidebar('/ja', {
            gettingStarted: 'はじめに',
            whatIsYat: 'YAT とは',
            quickStart: 'クイックスタート',
            macosInstall: 'macOS インストールガイド（未署名）',
            coreFeatures: '主要機能',
            tunnelManagement: 'トンネル管理',
            edgeManagement: 'Edge 管理',
            edgeServerManagement: 'Edge サーバー管理',
            deployEdge: 'Edge のデプロイ',
            edgeMarket: 'Edge マーケット',
            wireguardConfiguration: 'WireGuard 設定',
            configReference: '設定リファレンス',
            cliReference: 'CLI リファレンス',
            startupParameters: '起動パラメーター',
            edgeFaq: 'FAQ',
            appsAndExtensions: 'アプリと拡張機能',
            customDomains: 'カスタムドメイン',
            advanced: '高度な機能',
            transportModes: 'トランスポートモード',
            wireguardNetworking: 'WireGuard ネットワーキング',
            multiDeviceRoles: '複数デバイスとロール',
            accountSettings: 'アカウントと設定',
            faq: 'FAQ',
            references: 'リファレンス',
            releaseNotes: 'リリースノート'
          })
        },
        footer: {
          message: 'MIT ライセンスで公開。',
          copyright: 'Copyright © 2026 YAT Team'
        }
      }
    }
  },
  
  // 主题配置
  themeConfig: {
    // 搜索
    search: {
      provider: 'local'
    },
    
    // 编辑链接
    editLink: {
      pattern: 'https://github.com/tunnel6/tunnel6.github.io/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },
    
    // 上次更新
    lastUpdated: {
      text: 'Last updated',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium'
      }
    },
    
    // 上下篇导航
    docFooter: {
      prev: 'Previous page',
      next: 'Next page'
    }
  },
  
  // Markdown 配置
  markdown: {
    lineNumbers: true,
  },
  
  // 构建配置
  build: {
    outDir: 'dist'
  }
})
