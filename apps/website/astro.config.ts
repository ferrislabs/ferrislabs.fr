import react from '@astrojs/react'
import icon from 'astro-icon'
import { thumbnailIntegration } from '@explainer/thumbnail/integration'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

export default defineConfig({
  site: process.env.PUBLIC_WEBSITE_URL || undefined,
  integrations: [
    react(),
    // Icônes résolues au build depuis les paquets @iconify-json locaux :
    // aucun appel réseau à l'exécution, le SVG est dans le HTML livré.
    icon({ include: { mdi: ['*'], lucide: ['*'] } }),
    thumbnailIntegration({
      appName: 'FerrisLabs',
      primaryColor: 'oklch(70.5% 0.213 47.604)',
      content: {
        type: 'static',
        pages: [
          {
            path: '/',
            title: 'FerrisLabs',
            description: 'Logiciel open source pour les entreprises qui veulent une stack cohérente.',
          },
        ],
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    envDir: '../../',
  },
})
