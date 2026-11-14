<template>
  <DefaultTheme.Layout>
    <template #nav-bar-title-after>
      <HeaderGitHubLink />
    </template>
    <template #nav-bar-content-after>
      <HeaderGetStartedButton />
    </template>
    <template #nav-screen-content-after>
      <HeaderGetStartedButton block />
    </template>
  </DefaultTheme.Layout>
</template>

<script setup>
import { onBeforeUnmount, onMounted, watch } from 'vue'
import DefaultTheme from 'vitepress/theme'
import { useData, useRoute, useRouter } from 'vitepress'
import HeaderGitHubLink from './components/HeaderGitHubLink.vue'
import HeaderGetStartedButton from './components/HeaderGetStartedButton.vue'
import {
  normalizeWikiLocale,
  readStoredWikiLocale,
  writeStoredWikiLocale
} from './utils/localeStorage'

const { localeIndex } = useData()
const route = useRoute()
const router = useRouter()

let observedLocale = null

function localeFromPath(pathname) {
  return pathname === '/zh' || pathname.startsWith('/zh/') ? 'zh-CN' : 'en'
}

function localizedPath(pathname, locale) {
  if (locale === 'zh-CN') {
    return pathname === '/' ? '/zh/' : `/zh${pathname.startsWith('/') ? pathname : `/${pathname}`}`
  }

  return pathname.replace(/^\/zh(?:\/|$)/, '/') || '/'
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

  if (localeFromPath(url.pathname) !== requestedLocale) {
    router.go(`${localizedPath(url.pathname, requestedLocale)}${url.hash}`)
  } else {
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
  }
}

function applyStoredLocaleOnHomepage() {
  const preferredLocale = readStoredWikiLocale()
  if (!preferredLocale || route.path !== '/') return

  const currentLocale = localeIndex.value === 'zh' ? 'zh-CN' : 'en'
  if (preferredLocale === currentLocale) return

  router.go(localizedPath(route.path, preferredLocale))
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
