import { defineConfig } from '@explainer/config'

export const siteConfig = defineConfig({
  name: 'FerrisLabs',
  titleTemplate: '%s',
  favicon: '/favicon.svg',
  description: 'FerrisLabs builds Ferriskey, an open source IAM platform, and Mestier, an open source alternative to Google Workspace for companies.',
  logo: '/logo.svg',
  github: 'https://github.com/ferrislabs',
  locales: ['en'],
  defaultLocale: 'en',
})
