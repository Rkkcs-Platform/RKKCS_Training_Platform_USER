import { createI18n } from 'vue-i18n'
import en from './locales/en'
import ja from './locales/ja'
import vi from './locales/vi'

const STORAGE_KEY = 'rkkcs-locale'

function getSavedLocale(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || 'vi'
  } catch {
    return 'vi'
  }
}

export type AppLocale = 'vi' | 'en' | 'ja'

export const SUPPORTED_LOCALES: { code: AppLocale; flag: string; label: string }[] = [
  { code: 'vi', flag: '🇻🇳', label: 'Tiếng Việt' },
  { code: 'en', flag: '🇺🇸', label: 'English' },
  { code: 'ja', flag: '🇯🇵', label: '日本語' },
]

const i18n = createI18n({
  legacy: false,
  locale: getSavedLocale(),
  fallbackLocale: 'en',
  messages: { vi, en, ja },
})

export function setLocale(locale: AppLocale) {
  i18n.global.locale.value = locale
  try {
    localStorage.setItem(STORAGE_KEY, locale)
    sessionStorage.setItem('rkkcs-lang-initialized', 'true')
  } catch {
    // storage unavailable
  }
  document.documentElement.lang = locale
}

export default i18n
