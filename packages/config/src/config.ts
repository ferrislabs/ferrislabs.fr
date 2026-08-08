import type { SiteConfig } from './contracts'

export const defaultConfig: SiteConfig = {
  name: 'Explainer',
  titleTemplate: '%s — Explainer',
  favicon: '/favicon.svg',
  logo: '/logo.svg',
  thumbnail: '/thumbnail.png',
  twitterCard: 'summary_large_image',
  ogType: 'website',
  github: 'https://github.com/LeadcodeDev/explainer_v2',
  sponsors: [
    {
      id: 'mineral',
      name: 'Mineral',
      href: 'https://mineral-dart.dev/',
      logoUrl: 'https://mineral-dart.dev/logo.svg',
      tier: 'silver',
    },
  ],
  defaultLocale: 'en',
  locales: ['en', 'fr'],
  footer: {
    description: 'footer.description',
    columns: {
      documentation: 'footer.columns.documentation',
      resources: 'footer.columns.resources',
      community: 'footer.columns.community',
    },
    copyright: 'footer.copyright',
    builtWith: 'footer.builtWith',
    links: {
      documentation: [
        { label: 'footer.links.gettingStarted', href: '/{locale}/explainer/getting-started' },
        { label: 'footer.links.mdxComponents', href: '/{locale}/explainer/mdx-components/callout' },
        { label: 'footer.links.customization', href: '/{locale}/explainer/features/theme-customization' },
        { label: 'footer.links.deployment', href: '/{locale}/explainer/deployment/docker' },
      ],
      resources: [
        { label: 'footer.links.github', href: 'https://github.com/LeadcodeDev/explainer_v2', external: true },
        { label: 'footer.links.blog', href: '', appId: 'blog' },
        { label: 'footer.links.changelog', href: 'https://github.com/LeadcodeDev/explainer_v2/releases', external: true },
      ],
      community: [
        { label: 'footer.links.issues', href: 'https://github.com/LeadcodeDev/explainer_v2/issues', external: true },
        { label: 'footer.links.discussions', href: 'https://github.com/LeadcodeDev/explainer_v2/discussions', external: true },
        { label: 'footer.links.contributing', href: 'https://github.com/LeadcodeDev/explainer_v2/blob/main/CONTRIBUTING.md', external: true },
      ],
    },
  },
}
