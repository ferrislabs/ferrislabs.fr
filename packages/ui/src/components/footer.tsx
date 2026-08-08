import { defaultConfig, resolveHref, t, type SiteConfig } from '@explainer/config'
import { Icon } from '@iconify/react'
import * as React from 'react'

export interface FooterProps {
  config?: SiteConfig
  locale?: string
  appUrlOverrides?: Partial<Record<string, string>>
}

function detectLocale(config: SiteConfig): string {
  if (typeof document === 'undefined') return config.defaultLocale

  const match = document.cookie.match(/(?:^|; )locale=([^;]*)/)
  if (match?.[1] && config.locales.includes(match[1])) return match[1]

  const browser = (navigator.language || '').split('-')[0]
  if (config.locales.includes(browser)) return browser

  return config.defaultLocale
}

export function Footer({ config = defaultConfig, locale: localeProp, appUrlOverrides }: FooterProps) {
  const [locale, setLocale] = React.useState(localeProp ?? config.defaultLocale)

  React.useEffect(() => {
    if (!localeProp) {
      setLocale(detectLocale(config))
    }
  }, [localeProp, config])

  const docsUrl = (appUrlOverrides?.docs ?? '').replace(/\/$/, '')
  const blogUrl = appUrlOverrides?.blog ?? '/'
  const { footer, name } = config

  const copyrightText = t(locale, footer.copyright).replace('{year}', String(new Date().getFullYear()))
  const builtWithParts = t(locale, footer.builtWith).split('{icon}')

  return (
    <footer className="border-t mt-12 pt-10 pb-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Icon icon="lucide:book-open" className="size-4 text-primary" />
            <span className="font-semibold text-sm text-foreground">{name}</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t(locale, footer.description)}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">{t(locale, footer.columns.documentation)}</h4>
          <ul className="space-y-2">
            {footer.links.documentation.map((link) => (
              <li key={link.href}>
                <a href={`${docsUrl}${resolveHref(link.href, locale)}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t(locale, link.label)}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">{t(locale, footer.columns.resources)}</h4>
            <ul className="space-y-2">
              {footer.links.resources.map((link) => {
                const href = link.appId === 'blog' ? blogUrl : link.href
                return (
                  <li key={link.label}>
                    <a
                      href={href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                      {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      {t(locale, link.label)}
                      {link.external && <Icon icon="lucide:external-link" className="size-3" />}
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">{t(locale, footer.columns.community)}</h4>
            <ul className="space-y-2">
              {footer.links.community.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t(locale, link.label)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
        <p>{copyrightText}</p>
        <p className="flex items-center gap-1">
          {builtWithParts[0]}<Icon icon="lucide:heart" className="size-3 text-red-500 fill-red-500" />{builtWithParts[1]}
        </p>
      </div>
    </footer>
  )
}
