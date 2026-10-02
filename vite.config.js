import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Installable, offline-capable app. A new version is picked up on the next
    // load rather than forcing a reload, so running timers aren't interrupted.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Complete Sourdough Helper',
        short_name: 'Sourdough',
        description: 'Sourdough and focaccia recipes with timers, plus a bulk fermentation calculator',
        theme_color: '#7e22ce',
        background_color: '#faf5ff',
        display: 'standalone',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  base: '/sourdough-helper/',
  build: {
    outDir: 'dist',
  },
})
