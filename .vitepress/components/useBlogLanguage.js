import { onMounted, onUnmounted, ref } from 'vue'
import {
  blogLanguageByWikiLocale,
  supportedBlogLanguages,
  wikiLocaleByBlogLanguage
} from './blogLanguages.js'
import {
  WIKI_LOCALE_STORAGE_KEY,
  readStoredWikiLocale,
  writeStoredWikiLocale
} from '../utils/localeStorage.js'

const blogLanguage = ref('en')

function normalizeLanguage(language) {
  return supportedBlogLanguages.includes(language) ? language : 'en'
}

function syncLanguageFromLocation() {
  if (typeof window === 'undefined') return

  const requestedLanguage = new URLSearchParams(window.location.search).get('lang')
  if (requestedLanguage) {
    const nextLanguage = normalizeLanguage(requestedLanguage)
    blogLanguage.value = nextLanguage
    writeStoredWikiLocale(
      nextLanguage === 'zh' && readStoredWikiLocale() === 'zh-TW'
        ? 'zh-TW'
        : wikiLocaleByBlogLanguage[nextLanguage]
    )
    return
  }

  const storedLocale = readStoredWikiLocale()
  blogLanguage.value = storedLocale
    ? blogLanguageByWikiLocale[storedLocale] ?? 'en'
    : 'en'
}

function syncLanguageFromStorage(event) {
  if (event.key !== WIKI_LOCALE_STORAGE_KEY) return
  if (new URLSearchParams(window.location.search).get('lang')) return

  syncLanguageFromLocation()
}

function syncLanguageFromWikiLocale(event) {
  const locale = readStoredWikiLocale()
  if (!locale || locale !== event.detail) return

  blogLanguage.value = blogLanguageByWikiLocale[locale] ?? 'en'
}

export function useBlogLanguage() {
  function setBlogLanguage(language) {
    const nextLanguage = normalizeLanguage(language)
    blogLanguage.value = nextLanguage

    if (typeof window === 'undefined') return

  const url = new URL(window.location.href)
  if (nextLanguage === 'en') url.searchParams.delete('lang')
  else url.searchParams.set('lang', nextLanguage)

  window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`)

  writeStoredWikiLocale(
    nextLanguage === 'zh' && readStoredWikiLocale() === 'zh-TW'
      ? 'zh-TW'
      : wikiLocaleByBlogLanguage[nextLanguage]
  )
  }

  onMounted(() => {
    syncLanguageFromLocation()
    window.addEventListener('popstate', syncLanguageFromLocation)
    window.addEventListener('storage', syncLanguageFromStorage)
    window.addEventListener('yat:wiki-locale-change', syncLanguageFromWikiLocale)
  })

  onUnmounted(() => {
    window.removeEventListener('popstate', syncLanguageFromLocation)
    window.removeEventListener('storage', syncLanguageFromStorage)
    window.removeEventListener('yat:wiki-locale-change', syncLanguageFromWikiLocale)
  })

  return { currentLang: blogLanguage, setBlogLanguage }
}
