import type { SiteConfig, I18nMessages } from './contracts'
import { defaultConfig } from './config'
import { i18n } from './i18n/footer'

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}

function deepMerge(base: Record<string, any>, overrides: Record<string, any>): Record<string, any> {
  const result = { ...base }
  for (const key of Object.keys(overrides)) {
    const val = overrides[key]
    if (val !== undefined && typeof val === 'object' && !Array.isArray(val) && val !== null) {
      result[key] = deepMerge(base[key] ?? {}, val)
    } else if (val !== undefined) {
      result[key] = val
    }
  }
  return result
}

export function defineConfig(overrides: DeepPartial<SiteConfig> = {}): SiteConfig {
  return deepMerge(defaultConfig, overrides) as SiteConfig
}

export function formatTitle(config: SiteConfig, pageTitle: string): string {
  return config.titleTemplate.replace('%s', pageTitle)
}

export function getMessages(locale?: string): I18nMessages {
  const lang = locale ?? defaultConfig.defaultLocale
  return i18n[lang] ?? i18n[defaultConfig.defaultLocale]
}

export function t(locale: string | undefined, key: string): string {
  const messages = getMessages(locale)
  const fallback = i18n[defaultConfig.defaultLocale]
  return messages[key] ?? fallback[key] ?? key
}

export function resolveHref(href: string, locale?: string): string {
  return href.replace('{locale}', locale ?? defaultConfig.defaultLocale)
}
