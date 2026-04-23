import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'YAT',
  description: 'Yet Another Tunnel - Making intranet penetration simpler',
  base: '/',
  
  // 忽略死链检查（允许文档中存在暂时未实现的链接）
  ignoreDeadLinks: true,
  
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
          { text: 'Download', link: '/download' }
          // { text: 'Pricing', link: '/pricing' },
          // { text: 'Blog', link: '/blog' }
        ],
        sidebar: {
          '/guide/': [
            {
              text: 'Getting Started',
              items: [
                { text: 'What is YAT', link: '/guide/what-is-yat' },
                { text: 'Quick Start', link: '/guide/quick-start' }
              ]
            },
            {
              text: 'Core Features',
              items: [
                { text: 'Tunnel Management', link: '/guide/tunnel-management' },
                { text: 'Edge Management', link: '/guide/edge-management' },
                { text: 'Apps & Extensions', link: '/guide/apps-and-extensions' },
                { text: 'Custom Domains', link: '/guide/custom-domains' }
              ]
            },
            {
              text: 'Advanced',
              items: [
                { text: 'Transport Modes', link: '/guide/transport-modes' },
                { text: 'Multi-Device & Roles', link: '/guide/multi-device-roles' },
                { text: 'Account & Settings', link: '/guide/account-settings' },
                { text: 'FAQ', link: '/guide/faq' }
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
        footer: {
          message: 'Released under the MIT License.',
          copyright: 'Copyright © 2026 YAT Team',
          links: [
            { text: 'About', link: '/about' },
            { text: 'Privacy Policy', link: '/privacy' },
            { text: 'Terms of Service', link: '/terms' },
            { text: 'Changelog', link: '/changelog' }
          ]
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
          // { text: '功能', link: '/zh/features' },
          { text: '下载', link: '/zh/download' },
          { text: '文档', link: '/zh/guide/what-is-yat' }
          // { text: '定价', link: '/zh/pricing' },
          // { text: '博客', link: '/zh/blog' }
        ],
        sidebar: {
          '/zh/guide/': [
            {
              text: '快速开始',
              items: [
                { text: 'YAT 是什么', link: '/zh/guide/what-is-yat' },
                { text: '快速上手', link: '/zh/guide/quick-start' }
              ]
            },
            {
              text: '核心功能',
              items: [
                { text: '隧道管理', link: '/zh/guide/tunnel-management' },
                { text: 'Edge 管理', link: '/zh/guide/edge-management' },
                { text: '应用与扩展', link: '/zh/guide/apps-and-extensions' },
                { text: '自定义域名', link: '/zh/guide/custom-domains' }
              ]
            },
            {
              text: '高级功能',
              items: [
                { text: '传输模式', link: '/zh/guide/transport-modes' },
                { text: '多设备与角色', link: '/zh/guide/multi-device-roles' },
                { text: '账户与设置', link: '/zh/guide/account-settings' },
                { text: '常见问题', link: '/zh/guide/faq' }
              ]
            }
          ],
          '/zh/developer/': [
            {
              text: '开发者指南',
              items: [
                { text: '架构设计', link: '/zh/developer/architecture' },
                { text: '快速开始', link: '/zh/developer/getting-started' }
              ]
            },
            {
              text: '扩展开发',
              items: [
                { text: '概述', link: '/zh/developer/extension-overview' },
                { text: '类型系统', link: '/zh/developer/type-system' },
                { text: 'Host API', link: '/zh/developer/host-api' },
                { text: '示例', link: '/zh/developer/examples' }
              ]
            }
          ]
        },
        footer: {
          message: '基于 MIT 许可证发布。',
          copyright: '版权所有 © 2026 YAT Team',
          links: [
            { text: '关于', link: '/zh/about' },
            { text: '隐私政策', link: '/zh/privacy' },
            { text: '服务条款', link: '/zh/terms' },
            { text: '更新日志', link: '/zh/changelog' }
          ]
        }
      }
    }
  },
  
  // 主题配置
  themeConfig: {
    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/tunnel6/yat-client' }
    ],
    
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
