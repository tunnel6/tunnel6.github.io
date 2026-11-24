export const WIKI_LOCALE_STORAGE_KEY = 'app_locale'

export function normalizeWikiLocale(value) {
  if (value === 'zh-CN' || value === 'zh' || value === 'zh-Hans-CN') return 'zh-CN'
  if (value === 'zh-TW' || value === 'zh-Hant' || value === 'zh-Hant-TW') return 'zh-TW'
  if (value === 'es' || value === 'es-ES' || value === 'es-419') return 'es'
  if (value === 'ja' || value === 'ja-JP') return 'ja'
  if (value === 'en') return 'en'
  return null
}

export function readStoredWikiLocale() {
  try {
    return normalizeWikiLocale(localStorage.getItem(WIKI_LOCALE_STORAGE_KEY))
  } catch {
    return null
  }
}

export function writeStoredWikiLocale(locale) {
  const normalizedLocale = normalizeWikiLocale(locale)
  if (!normalizedLocale) return

  try {
    localStorage.setItem(WIKI_LOCALE_STORAGE_KEY, normalizedLocale)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('yat:wiki-locale-change', { detail: normalizedLocale })
      )
    }
  } catch {
    // Language preference is best-effort storage. URL parameters remain the
    // cross-domain transport between wiki and dashboard.
  }
}
