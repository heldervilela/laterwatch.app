import { en } from './locales/en'
import { pt } from './locales/pt'
import type { LocaleStructure } from './types'

export type SupportedLocale = 'pt' | 'en'

const locales: Record<SupportedLocale, LocaleStructure> = {
  pt,
  en,
}

/**
 * Thread-safe translation function
 * @param locale - The locale to use for translation
 * @param key - The key path to translate (e.g., 'auth.errors.invalidEmail')
 * @returns The translated string or the key if not found
 */
export function translate(locale: SupportedLocale, key: string): string {
  const keys = key.split('.')
  let value: any = locales[locale]

  for (const k of keys) {
    value = value?.[k]
  }

  if (typeof value === 'string') {
    return value
  }

  // Fallback to key if translation not found
  console.warn(`Translation not found for key: ${key} in locale: ${locale}`)
  return key
}

/**
 * Create a translator function bound to a specific locale
 * @param locale - The locale to bind to
 * @returns A function that translates keys using the bound locale
 */
export function createTranslator(locale: SupportedLocale) {
  return (key: string) => translate(locale, key)
}

/**
 * Get available locales
 */
export function getAvailableLocales(): SupportedLocale[] {
  return Object.keys(locales) as SupportedLocale[]
}

/**
 * Check if a locale is supported
 */
export function isValidLocale(locale: string): locale is SupportedLocale {
  return locale in locales
}

/**
 * Parse Accept-Language header and return best matching locale
 */
export function parseAcceptLanguage(acceptLanguage: string | null): SupportedLocale {
  if (!acceptLanguage) {
    return 'pt' // Default to Portuguese (Portugal)
  }

  // Parse Accept-Language header and prioritize languages
  const languages = acceptLanguage.toLowerCase().split(',')

  for (const lang of languages) {
    const code = lang.split(';')[0].trim()

    // Check for English variants
    if (code.startsWith('en')) {
      return 'en'
    }

    // Check for Portuguese variants (prioritize pt-PT, but accept any pt)
    if (code.startsWith('pt')) {
      return 'pt'
    }
  }

  return 'pt' // Default fallback to Portuguese (Portugal)
}

// Export additional types
export type { LocaleStructure }
