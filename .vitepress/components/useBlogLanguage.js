import { onMounted, onUnmounted, ref } from 'vue'
import { supportedBlogLanguages } from './blogLanguages.js'

const blogLanguage = ref('en')

function normalizeLanguage(language) {
  return supportedBlogLanguages.includes(language) ? language : 'en'
}

function syncLanguageFromLocation() {
  if (typeof window === 'undefined') return

  const language = new URLSearchParams(window.location.search).get('lang')
  blogLanguage.value = normalizeLanguage(language)
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
  }

  onMounted(() => {
    syncLanguageFromLocation()
    window.addEventListener('popstate', syncLanguageFromLocation)
  })

  onUnmounted(() => {
    window.removeEventListener('popstate', syncLanguageFromLocation)
  })

  return { currentLang: blogLanguage, setBlogLanguage }
}
