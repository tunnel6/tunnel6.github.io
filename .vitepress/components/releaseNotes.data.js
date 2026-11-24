import { createContentLoader } from 'vitepress'

const releaseSummaries = {
  en: {
    'v1.4.0': 'Snap / deb packages for Linux and a refreshed native title bar.',
    'v1.3.0': 'Invite codes, path controls, and richer peer diagnostics.',
    'v1.2.1-native': 'Native networking architecture for faster, more stable connections.',
    'v1.2.1': 'Network sharing to CLI and more reliable WireGuard handshakes.',
    'v1.2.0': 'WireGuard private networks with subnet assignment and link health.'
  },
  'zh-CN': {
    'v1.4.0': 'Linux Snap / deb 安装包与更贴合系统的标题栏。',
    'v1.3.0': '邀请码入网、路径控制和对等体诊断增强。',
    'v1.2.1-native': '原生网络层重构，连接更快、更稳定。',
    'v1.2.1': '支持网络分享到 CLI，WireGuard 握手更可靠。',
    'v1.2.0': '支持 WireGuard 私有网络、子网分配和链路健康监控。'
  },
  ja: {
    'v1.4.0': 'Linux 向け Snap / deb パッケージとシステムに馴染むタイトルバー。',
    'v1.3.0': '招待コード、パス制御、ピア診断の強化。',
    'v1.2.1-native': 'より高速で安定したネイティブネットワーク層。',
    'v1.2.1': 'CLI へのネットワーク共有と WireGuard ハンドシェイクの安定化。',
    'v1.2.0': 'WireGuard プライベートネットワーク、サブネット割り当て、リンク健全性監視。'
  },
  'zh-TW': {
    'v1.4.0': 'Linux Snap / deb 安裝包與更貼合系統的標題欄。',
    'v1.3.0': '邀請碼入網、路徑控制和對等體診斷增強。',
    'v1.2.1-native': '原生網路層重構，連線更快、更穩定。',
    'v1.2.1': '支援網路分享到 CLI，WireGuard 握手更可靠。',
    'v1.2.0': '支援 WireGuard 私有網路、子網分配和鏈路健康監控。'
  },
  es: {
    'v1.4.0': 'Paquetes Snap / deb para Linux y una barra de título más integrada con el sistema.',
    'v1.3.0': 'Códigos de invitación, control de rutas y diagnósticos de pares mejorados.',
    'v1.2.1-native': 'Arquitectura de red nativa para conexiones más rápidas y estables.',
    'v1.2.1': 'Uso compartido de redes con la CLI y handshakes de WireGuard más fiables.',
    'v1.2.0': 'Redes privadas WireGuard con asignación de subred y salud de enlaces.'
  }
}

function parseVersion(value) {
  const match = value.match(/^v(\d+)\.(\d+)\.(\d+)(?:-(.*))?$/)
  if (!match) return { major: 0, minor: 0, patch: 0, suffix: value }
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    suffix: match[4] ?? ''
  }
}

function compareVersions(left, right) {
  const leftVersion = parseVersion(left)
  const rightVersion = parseVersion(right)
  const numericResult =
    rightVersion.major - leftVersion.major ||
    rightVersion.minor - leftVersion.minor ||
    rightVersion.patch - leftVersion.patch
  if (numericResult) return numericResult

  const rank = value => (value.endsWith('-native') ? 1 : 0)
  return rank(right) - rank(left) || right.localeCompare(left)
}

function extractTitle(source) {
  return source.match(/^#\s+(.+)$/m)?.[1]?.trim()
}

function extractSummary(source, version, locale) {
  const fallback = releaseSummaries[locale]?.[version]
  if (fallback) return fallback

  const firstParagraph = source
    .replace(/^#.+\r?\n/, '')
    .split(/\r?\n\r?\n/)
    .find(block => block.trim() && !block.startsWith('#'))

  return firstParagraph?.replace(/[#>*`[\]()]/g, '').slice(0, 120) ?? ''
}

function parseNote({ url, frontmatter, src, html }) {
  const match = url.match(/^\/(?:zh\/)?release-notes\/([^/]+)\/([^/]+)\.html$/)
  if (!match) return null

  const version = frontmatter.version ?? match[1]
  const locale = frontmatter.locale ?? match[2]
  const source = src ?? ''

  return {
    version,
    locale,
    title: frontmatter.title ?? extractTitle(source) ?? version,
    summary: frontmatter.summary ?? extractSummary(source, version, locale),
    html: (html ?? '').replace(/<h1[^>]*>[\s\S]*?<\/h1>/, '').trim()
  }
}

function buildLink(locale, version, index) {
  const prefixes = {
    en: '',
    'zh-CN': '/zh',
    'zh-TW': '/zh-TW',
    es: '/es',
    ja: '/ja'
  }
  const prefix = prefixes[locale] ?? ''
  return index === 0
    ? `${prefix}/release-notes/`
    : `${prefix}/release-notes/${version}.html`
}

export default createContentLoader('release-notes/*/*.md', {
  includeSrc: true,
  render: true,
  transform: data => {
    const sorted = data
      .map(parseNote)
      .filter(Boolean)
      .sort((left, right) => compareVersions(left.version, right.version))
    const latestVersion = sorted[0]?.version

    return sorted.map(note => ({
      ...note,
      link: buildLink(
        note.locale,
        note.version,
        note.version === latestVersion ? 0 : 1
      )
    }))
  }
})
