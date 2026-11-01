import react from '@astrojs/react'
import icon from 'astro-icon'
import { thumbnailIntegration } from '@explainer/thumbnail/integration'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import { pixelCard } from './src/lib/social-card'

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
      // La carte de partage reprend le hero du site : titre, crabe et chantier.
      pixelCard: pixelCard(),
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
