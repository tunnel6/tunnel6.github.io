<template>
  <div class="download-wrapper">
    <div class="loading-state" v-if="loading">
      <div class="spinner"></div>
      <p>{{ t.loading }}</p>
    </div>

    <div class="error-state" v-else-if="error">
      <p>{{ t.error }}</p>
      <a :href="releasesUrl" target="_blank" class="fallback-link">{{ t.fallbackLink }}</a>
    </div>

    <div class="release-content" v-else-if="latestRelease">
      <div class="release-header">
        <h2>{{ t.latestVersion }} {{ latestRelease.tag_name }}</h2>
        <p class="release-date">{{ t.releasedAt }} {{ formatDate(latestRelease.published_at) }}</p>
      </div>

      <div class="release-notes" v-if="latestRelease.body" v-html="formatReleaseNotes(latestRelease.body)"></div>

      <div class="downloads-grid">
        <div class="platform-card">
          <div class="platform-icon">
            <svg width="48" height="48" viewBox="-0.5 0 257 257" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMidYMid">
                <g>
                    <path d="M0,36.3573818 L104.619084,22.1093454 L104.664817,123.02292 L0.0955693151,123.618411 L0,36.3573818 Z M104.569248,134.650129 L104.650452,235.651651 L0.0812046021,221.274919 L0.0753414539,133.972642 L104.569248,134.650129 Z M117.25153,20.2454506 L255.967753,6.21724894e-15 L255.967753,121.739477 L117.25153,122.840723 L117.25153,20.2454506 Z M256,135.599959 L255.96746,256.791232 L117.251237,237.213007 L117.056874,135.373055 L256,135.599959 Z" fill="#00ADEF">

            </path>
                </g>
            </svg>
          </div>
          <h3>Windows</h3>
          <div class="download-list">
            <div class="download-item" v-for="asset in getAssetsByPlatform('win')" :key="asset.id">
              <div class="asset-info">
                <div class="asset-name">{{ getCleanName(asset.name) }}</div>
                <div class="asset-meta">
                  <span class="asset-size">{{ formatSize(asset.size) }}</span>
                  <span class="asset-time">{{ getTimeAgo(asset.updated_at) }}</span>
                </div>
              </div>
              <a :href="asset.browser_download_url" class="download-btn" download>{{ t.download }}</a>
            </div>
          </div>
        </div>

        <div class="platform-card">
          <div class="platform-icon">
            <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
          </div>
          <h3>macOS</h3>
          <div class="download-list">
            <div class="download-item" v-for="asset in getAssetsByPlatform('mac')" :key="asset.id">
              <div class="asset-info">
                <div class="asset-name">{{ getCleanName(asset.name) }}</div>
                <div class="asset-meta">
                  <span class="asset-size">{{ formatSize(asset.size) }}</span>
                  <span class="asset-time">{{ getTimeAgo(asset.updated_at) }}</span>
                </div>
              </div>
              <a :href="asset.browser_download_url" class="download-btn" download>{{ t.download }}</a>
            </div>
          </div>
        </div>

        <div class="platform-card">
          <div class="platform-icon">
            <svg width="48px" height="48px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="none"><path fill="#202020" d="M13.338 12.033c-.1-.112-.146-.319-.197-.54-.05-.22-.107-.457-.288-.61v-.001a.756.756 0 00-.223-.134c.252-.745.153-1.487-.1-2.157-.312-.823-.855-1.54-1.27-2.03-.464-.586-.918-1.142-.91-1.963.014-1.254.138-3.579-2.068-3.582-.09 0-.183.004-.28.012-2.466.198-1.812 2.803-1.849 3.675-.045.638-.174 1.14-.613 1.764-.515.613-1.24 1.604-1.584 2.637-.162.487-.24.984-.168 1.454-.023.02-.044.041-.064.063-.151.161-.263.357-.388.489-.116.116-.282.16-.464.225-.183.066-.383.162-.504.395v.001a.702.702 0 00-.077.339c0 .108.016.217.032.322.034.22.068.427.023.567-.144.395-.163.667-.061.865.102.199.31.286.547.335.473.1 1.114.075 1.619.342l.043-.082-.043.082c.54.283 1.089.383 1.526.284a.99.99 0 00.706-.552c.342-.002.717-.146 1.318-.18.408-.032.918.145 1.503.113a.806.806 0 00.068.183l.001.001c.227.455.65.662 1.1.627.45-.036.928-.301 1.315-.762l-.07-.06.07.06c.37-.448.982-.633 1.388-.878.203-.123.368-.276.38-.499.013-.222-.118-.471-.418-.805z"/><path fill="#F8BF11" d="M13.571 12.828c-.007.137-.107.24-.29.35-.368.222-1.019.414-1.434.918-.362.43-.802.665-1.19.696-.387.03-.721-.13-.919-.526v-.002c-.123-.233-.072-.6.031-.987s.251-.785.271-1.108v-.001c.02-.415.044-.776.114-1.055.07-.28.179-.468.373-.575a.876.876 0 01.027-.014c.022.359.2.725.514.804.343.09.838-.204 1.047-.445l.122-.004c.184-.005.337.006.495.143v.001c.121.102.179.296.229.512.05.217.09.453.239.621.287.32.38.534.371.672zM6.592 13.843v.003c-.034.435-.28.672-.656.758-.377.086-.888 0-1.398-.266-.565-.3-1.237-.27-1.667-.36-.216-.045-.357-.113-.421-.238-.064-.126-.066-.345.071-.72v-.001l.001-.002c.068-.209.018-.438-.015-.653-.033-.214-.049-.41.024-.546l.001-.001c.094-.181.232-.246.403-.307.17-.062.373-.11.533-.27l.001-.001h.001c.148-.157.26-.353.39-.492.11-.117.22-.195.385-.196h.005a.61.61 0 01.093.008c.22.033.411.187.596.437l.533.971v.001c.142.296.441.622.695.954.254.333.45.666.425.921z"/><path fill="#D6A312" d="M9.25 4.788c-.043-.084-.13-.164-.28-.225-.31-.133-.444-.142-.617-.254-.28-.181-.513-.244-.706-.244a.834.834 0 00-.272.047c-.236.08-.392.25-.49.342-.02.019-.044.035-.104.08-.06.043-.15.11-.28.208-.117.086-.154.2-.114.332.04.132.167.285.4.417h.001c.145.085.244.2.358.291a.801.801 0 00.189.117c.072.031.156.052.26.058.248.015.43-.06.59-.151.16-.092.296-.204.452-.255h.001c.32-.1.548-.301.62-.493a.324.324 0 00-.008-.27z"/><path fill="#202020" d="M8.438 5.26c-.255.133-.552.294-.869.294-.316 0-.566-.146-.745-.289-.09-.07-.163-.142-.218-.193-.096-.075-.084-.181-.045-.178.066.008.076.095.117.134.056.052.126.12.211.187.17.135.397.266.68.266.284 0 .614-.166.816-.28.115-.064.26-.179.379-.266.09-.067.087-.147.162-.138.075.009.02.089-.085.18-.105.092-.27.214-.403.283z"/><path fill="#ffffff" d="M12.337 10.694a1.724 1.724 0 00-.104 0h-.01c.088-.277-.106-.48-.621-.713-.534-.235-.96-.212-1.032.265-.005.025-.009.05-.011.076a.801.801 0 00-.12.054c-.252.137-.389.386-.465.692-.076.305-.098.674-.119 1.09-.013.208-.099.49-.186.79-.875.624-2.09.894-3.122.19-.07-.11-.15-.22-.233-.328a13.85 13.85 0 00-.16-.205.65.65 0 00.268-.05.34.34 0 00.186-.192c.063-.17 0-.408-.202-.68-.201-.273-.542-.58-1.043-.888-.368-.23-.574-.51-.67-.814-.097-.305-.084-.635-.01-.96.143-.625.51-1.233.743-1.614.063-.046.023.086-.236.567-.232.44-.667 1.455-.072 2.248.016-.564.15-1.14.377-1.677.329-.747 1.018-2.041 1.072-3.073.029.02.125.086.169.11.126.075.221.184.344.283a.85.85 0 00.575.2c.24 0 .427-.079.582-.168.17-.096.304-.204.433-.245.27-.085.486-.235.608-.41.21.83.7 2.027 1.014 2.611.167.31.5.969.643 1.762.091-.002.191.01.299.038.375-.973-.319-2.022-.636-2.314-.128-.124-.135-.18-.07-.177.343.304.795.917.96 1.608.075.315.09.646.01.973.04.017.08.034.12.054.603.293.826.548.719.897z"/><path fill="#E6E6E6" d="M8.04 8.062c-.556.002-1.099.251-1.558.716-.46.464-.814 1.122-1.018 1.888l.061.038v.004c.47.298.805.598 1.012.878.219.296.316.584.223.834a.513.513 0 01-.27.283l-.041.015c.074.097.146.197.213.3.944.628 2.042.396 2.867-.172.08-.278.153-.536.163-.698.021-.415.042-.792.124-1.12.082-.33.242-.63.544-.795.017-.01.034-.015.051-.023a.756.756 0 01.022-.094c-.242-.622-.591-1.14-1.01-1.5-.42-.36-.897-.551-1.382-.554zm2.37 2.155l-.002.005v-.002l.001-.004z"/><path fill="#ffffff" d="M9.278 3.833a1.05 1.05 0 01-.215.656 4.119 4.119 0 00-.218-.09l-.127-.045c.029-.035.085-.075.107-.127a.669.669 0 00.05-.243l.001-.01a.673.673 0 00-.035-.236.434.434 0 00-.108-.184.223.223 0 00-.156-.07H8.57a.228.228 0 00-.151.06.434.434 0 00-.122.175.676.676 0 00-.05.243v.01a.718.718 0 00.009.14 1.773 1.773 0 00-.354-.12 1.196 1.196 0 01-.01-.133v-.013a1.035 1.035 0 01.088-.447.793.793 0 01.25-.328.554.554 0 01.346-.123h.006c.125 0 .232.036.342.116a.78.78 0 01.257.324c.063.138.094.273.097.433l.001.012zM7.388 3.997a1.05 1.05 0 00-.277.125.623.623 0 00.002-.15v-.008a.651.651 0 00-.048-.192.37.37 0 00-.096-.141.158.158 0 00-.119-.045c-.042.004-.077.024-.11.065a.372.372 0 00-.07.156.626.626 0 00-.013.205v.008a.634.634 0 00.048.193.367.367 0 00.116.156l-.102.08-.078.056a.706.706 0 01-.16-.24c-.053-.12-.082-.24-.09-.381v-.001a1.071 1.071 0 01.045-.39.668.668 0 01.167-.292.359.359 0 01.264-.118c.084 0 .158.028.235.09a.68.68 0 01.199.271c.053.12.08.24.089.382v.001c.003.06.003.115-.002.17z"/><path fill="#202020" d="M7.806 4.335c.01.034.065.029.097.045.027.014.05.045.08.046.03.001.076-.01.08-.04.005-.038-.052-.063-.088-.077-.047-.019-.107-.028-.151-.003-.01.005-.021.018-.018.03zM7.484 4.335c-.01.034-.065.029-.096.045-.028.014-.05.045-.081.046-.03.001-.076-.01-.08-.04-.005-.038.052-.063.088-.077.047-.019.108-.028.152-.003.01.005.02.018.017.03z"/></svg>
          </div>
          <h3>Linux</h3>
          <div class="download-list">
            <div class="download-item" v-for="asset in getAssetsByPlatform('linux')" :key="asset.id">
              <div class="asset-info">
                <div class="asset-name">{{ getCleanName(asset.name) }}</div>
                <div class="asset-meta">
                  <span class="asset-size">{{ formatSize(asset.size) }}</span>
                  <span class="asset-time">{{ getTimeAgo(asset.updated_at) }}</span>
                </div>
              </div>
              <a :href="asset.browser_download_url" class="download-btn" download>{{ t.download }}</a>
            </div>
          </div>
        </div>
      </div>

      <div class="checksum-section">
        <details>
          <summary>{{ t.viewChecksum }}</summary>
          <div class="checksum-list">
            <div class="checksum-item" v-for="asset in validAssets" :key="'sha-' + asset.id">
              <code>{{ asset.name }}: {{ asset.sha256 || 'N/A' }}</code>
            </div>
          </div>
        </details>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useData } from 'vitepress'

const { lang } = useData()
const latestRelease = ref(null)
const loading = ref(true)
const error = ref(null)
const releasesUrl = 'https://github.com/tunnel6/yat/releases'

// 多语言配置
const translations = {
  zh: {
    loading: '正在获取最新版本信息...',
    error: '无法获取版本信息，请直接访问 GitHub Releases',
    fallbackLink: '直接访问 GitHub Releases →',
    latestVersion: '最新版本:',
    releasedAt: '发布于',
    download: '下载',
    viewChecksum: '查看 SHA256 校验和',
    minutesAgo: '分钟前',
    hoursAgo: '小时前',
    daysAgo: '天前',
    justNow: '刚刚'
  },
  en: {
    loading: 'Fetching latest version...',
    error: 'Failed to fetch version info. Please visit GitHub Releases directly.',
    fallbackLink: 'Visit GitHub Releases →',
    latestVersion: 'Latest Version:',
    releasedAt: 'Released',
    download: 'Download',
    viewChecksum: 'View SHA256 Checksums',
    minutesAgo: 'minutes ago',
    hoursAgo: 'hours ago',
    daysAgo: 'days ago',
    justNow: 'just now'
  }
}

// 获取当前语言的翻译
const t = computed(() => {
  const currentLang = lang.value === 'zh-CN' || lang.value === 'zh' ? 'zh' : 'en'
  return translations[currentLang]
})

const fetchLatestRelease = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await fetch('https://api.github.com/repos/tunnel6/yat/releases/latest')
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const data = await response.json()
    data.assets = data.assets.map(asset => ({
      ...asset,
      sha256: extractSha256(asset.name, data.body)
    }))
    latestRelease.value = data
  } catch (err) {
    console.error('Failed to fetch release:', err)
    error.value = '无法获取版本信息，请直接访问 GitHub Releases'
  } finally {
    loading.value = false
  }
}

const extractSha256 = (filename, body) => {
  if (!body) return null
  const lines = body.split('\n')
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(filename) && i + 1 < lines.length) {
      const shaLine = lines[i + 1]
      const match = shaLine.match(/sha256:([a-f0-9]{64})/i)
      if (match) return match[1]
    }
  }
  return null
}

const getAssetsByPlatform = (platform) => {
  if (!latestRelease.value) return []
  return latestRelease.value.assets.filter(asset => {
    const name = asset.name.toLowerCase()
    if (name.includes('.blockmap') || name.includes('.yml')) return false
    if (platform === 'win') return name.includes('win') && (name.endsWith('.exe') || name.endsWith('.msi'))
    if (platform === 'mac') return name.includes('mac') && name.endsWith('.dmg')
    if (platform === 'linux') return name.includes('linux') && (name.endsWith('.appimage') || name.endsWith('.deb'))
    return false
  })
}

const validAssets = computed(() => {
  if (!latestRelease.value) return []
  return latestRelease.value.assets.filter(asset => {
    const name = asset.name.toLowerCase()
    return !name.includes('.blockmap') && !name.includes('.yml')
  })
})

const getCleanName = (name) => name.replace(/YAT-/i, '').replace(/-\d+\.\d+\.\d+[^.]*/g, '').replace(/\.(exe|dmg|AppImage|deb)$/i, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

const formatSize = (bytes) => {
  if (!bytes) return 'Unknown'
  const mb = bytes / (1024 * 1024)
  return mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(1)} MB`
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const getTimeAgo = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return t.justNow
  if (diffMins < 60) return `${diffMins} ${t.minutesAgo}`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} ${t.hoursAgo}`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} ${t.daysAgo}`
}

const formatReleaseNotes = (body) => body.split('\n').filter(line => !line.includes('sha256:') && !line.match(/\d+\.\d+ (MB|GB)/) && !line.includes('minutes ago') && !line.includes('hours ago')).join('\n')

onMounted(() => fetchLatestRelease())
</script>

<style scoped>
.download-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.loading-state, .error-state {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  margin: 0 auto 20px;
  border: 4px solid var(--vp-c-divider);
  border-top-color: var(--vp-c-brand);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.fallback-link {
  display: inline-block;
  margin-top: 16px;
  color: var(--vp-c-brand);
  text-decoration: none;
  font-weight: 600;
}

.release-header {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid var(--vp-c-divider);
}

.release-header h2 {
  font-size: 2em;
  color: var(--vp-c-text-1);
  margin: 0 0 12px;
}

.release-date {
  color: var(--vp-c-text-3);
  margin: 0;
}

.release-notes {
  padding: 24px;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  margin-bottom: 40px;
  line-height: 1.8;
}

.downloads-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.platform-card {
  padding: 24px;
  border: 2px solid var(--vp-c-divider);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.platform-card:hover {
  border-color: var(--vp-c-brand);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.platform-icon {
  font-size: 3em;
  margin-bottom: 12px;
}

.platform-card h3 {
  margin: 0 0 20px;
  font-size: 1.5em;
  color: var(--vp-c-text-1);
}

.download-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.download-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
}

.asset-info {
  flex: 1;
}

.asset-name {
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 6px;
}

.asset-meta {
  display: flex;
  gap: 12px;
  font-size: 0.85em;
  color: var(--vp-c-text-3);
}

.download-btn {
  display: inline-block;
  padding: 10px 24px;
  background: var(--vp-c-brand);
  color: #ffffff !important;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.download-btn:hover {
  background: var(--vp-c-brand-dark);
  color: #ffffff !important;
  transform: scale(1.05);
}

.checksum-section {
  margin-top: 40px;
  padding: 20px;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
}

.checksum-section summary {
  cursor: pointer;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.checksum-list {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checksum-item code {
  display: block;
  padding: 12px;
  background: var(--vp-c-bg);
  border-radius: 6px;
  font-size: 0.85em;
  word-break: break-all;
}

@media (max-width: 768px) {
  .download-wrapper {
    padding: 16px;
  }
  
  .downloads-grid {
    grid-template-columns: 1fr;
  }
  
  .download-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .download-btn {
    width: 100%;
    text-align: center;
  }
}
</style>
