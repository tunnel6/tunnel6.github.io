<template>
  <DefaultTheme.Layout>
    <template #nav-bar-content-after>
      <HeaderCommunityLinks />
      <HeaderGetStartedButton />
    </template>
    <template #nav-screen-content-after>
      <div class="nav-screen-community">
        <HeaderCommunityLinks />
        <HeaderGetStartedButton block />
      </div>
    </template>
  </DefaultTheme.Layout>
</template>

<script setup>
import { onBeforeUnmount, onMounted, watch } from 'vue'
import DefaultTheme from 'vitepress/theme'
import { useRoute, useRouter } from 'vitepress'
import HeaderCommunityLinks from './components/HeaderCommunityLinks.vue'
import HeaderGetStartedButton from './components/HeaderGetStartedButton.vue'
import { blogLanguageByWikiLocale } from './components/blogLanguages.js'
import {
  normalizeWikiLocale,
  readStoredWikiLocale,
  writeStoredWikiLocale
} from './utils/localeStorage'

const route = useRoute()
const router = useRouter()

let observedLocale = null

const localePathPrefixes = {
  'zh-CN': '/zh',
  'zh-TW': '/zh-TW',
  es: '/es',
  ja: '/ja'
}

function localeFromPath(pathname) {
  if (isBlogPath(pathname)) return readStoredWikiLocale() ?? 'en'

  return (
    Object.entries(localePathPrefixes).find(([, prefix]) =>
      pathname === prefix || pathname.startsWith(`${prefix}/`)
    )?.[0] ?? 'en'
  )
}

function isBlogPath(pathname) {
  return pathname === '/blog' || pathname.startsWith('/blog/')
}

function localizedPath(pathname, locale) {
  const prefix = localePathPrefixes[locale]
  if (!prefix) return pathname === '/' ? '/' : pathname.replace(/^\/(?:zh|zh-TW|es|ja)(?:\/|$)/, '/')

  if (pathname === '/') return `${prefix}/`
  return `${prefix}${pathname.replace(/^\/(?:zh|zh-TW|es|ja)(?:\/|$)/, '/')}`
}

function persistLanguageSwitch(event) {
  const target = event.target
  if (!(target instanceof Element)) return

  const languageLink = target.closest('.VPNavBarTranslations a[href], .VPNavScreenTranslations a[href]')
  if (!languageLink) return

  const url = new URL(languageLink.getAttribute('href'), window.location.origin)
  writeStoredWikiLocale(localeFromPath(url.pathname))
}

function applyRequestedLocale() {
  const requestedLocale = normalizeWikiLocale(new URLSearchParams(window.location.search).get('locale'))
  if (!requestedLocale) return

  writeStoredWikiLocale(requestedLocale)

  const url = new URL(window.location.href)
  url.searchParams.delete('locale')

  if (isBlogPath(url.pathname)) {
    const blogLanguage = blogLanguageByWikiLocale[requestedLocale] ?? 'en'
    if (blogLanguage === 'en') url.searchParams.delete('lang')
    else url.searchParams.set('lang', blogLanguage)

    window.history.replaceState(
      window.history.state,
      '',
      `${url.pathname}${url.search}${url.hash}`
    )
    return
  }

  if (localeFromPath(url.pathname) !== requestedLocale) {
    router.go(`${localizedPath(url.pathname, requestedLocale)}${url.hash}`)
  } else {
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
  }
}

function applyStoredLocaleOnHomepage(path = route.path) {
  const preferredLocale = readStoredWikiLocale()
  if (!preferredLocale || path !== '/') return false

  const currentLocale = localeFromPath(path)
  if (preferredLocale === currentLocale) return false

  observedLocale = preferredLocale
  router.go(localizedPath(path, preferredLocale))
  return true
}

onMounted(() => {
  observedLocale = localeFromPath(route.path)
  document.addEventListener('click', persistLanguageSwitch, true)
  applyRequestedLocale()
  if (!new URLSearchParams(window.location.search).get('locale')) {
    applyStoredLocaleOnHomepage()
  }
})

watch(() => route.path, (path) => {
  if (applyStoredLocaleOnHomepage(path)) return

  const nextLocale = localeFromPath(path)
  if (observedLocale !== null && nextLocale !== observedLocale) {
    writeStoredWikiLocale(nextLocale)
  }
  observedLocale = nextLocale
})

onBeforeUnmount(() => {
  document.removeEventListener('click', persistLanguageSwitch, true)
})
</script>

<style scoped>
.nav-screen-community {
  display: grid;
  gap: 12px;
  padding-top: 12px;
}

.nav-screen-community :deep(.header-community-links) {
  justify-self: center;
}
</style>
