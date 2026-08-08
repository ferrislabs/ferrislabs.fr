export interface Sponsor {
  id: string
  name: string
  href: string
  logoUrl: string
  tier: 'gold' | 'silver' | 'bronze'
}

export interface FooterLink {
  /** i18n key for the label */
  label: string
  /** URL — use {locale} as placeholder */
  href: string
  external?: boolean
  appId?: string
}

export interface SiteConfig {
  /** Project name displayed in navbar, footer, etc. */
  name: string
  /** Title template — use %s as placeholder for the page title */
  titleTemplate: string
  /** Path to the favicon */
  favicon: string
  /** Path to the logo (used in navbar) */
  logo: string
  /** Default OG image / thumbnail path */
  thumbnail: string
  /** Twitter card type */
  twitterCard: 'summary' | 'summary_large_image'
  /** OG type */
  ogType: string
  /** GitHub repository URL */
  github: string
  /** Sponsors list */
  sponsors: Sponsor[]
  /** Default locale */
  defaultLocale: string
  /** Supported locales */
  locales: string[]
  /** Footer configuration — labels are i18n keys */
  footer: {
    /** i18n key for footer description */
    description: string
    columns: {
      documentation: string
      resources: string
      community: string
    }
    /** i18n key — supports {year} placeholder */
    copyright: string
    /** i18n key — supports {icon} placeholder */
    builtWith: string
    links: {
      documentation: FooterLink[]
      resources: FooterLink[]
      community: FooterLink[]
    }
  }
}

export type I18nMessages = Record<string, string>
