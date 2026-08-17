import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendHost = env.VITE_BACKEND_HOST || 'localhost'
  const backendPort = env.VITE_BACKEND_PORT || '8081'
  const backendUrl = `http://${backendHost}:${backendPort}`

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'pwa-icon.svg'],
        manifest: {
          name: 'Mutuelle ENSPY',
          short_name: 'Mutuelle',
          description:
            'Épargne, solidarité et assistances pour la communauté ENSPY.',
          theme_color: '#0d1f3c',
          background_color: '#f9fafb',
          display: 'standalone',
          orientation: 'portrait-primary',
          scope: '/',
          start_url: '/',
          lang: 'fr',
          icons: [
            {
              src: 'pwa-192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: 'pwa-512-maskable.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api/],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      allowedHosts: true,
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on('proxyRes', (proxyRes, req) => {
              if (req.url?.includes('/events/stream')) {
                proxyRes.headers['cache-control'] = 'no-cache'
                proxyRes.headers['connection'] = 'keep-alive'
              }
            })
          },
        },
      },
    },
    preview: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      allowedHosts: true,
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on('proxyRes', (proxyRes, req) => {
              if (req.url?.includes('/events/stream')) {
                proxyRes.headers['cache-control'] = 'no-cache'
                proxyRes.headers['connection'] = 'keep-alive'
              }
            })
          },
        },
      },
    },
  }
})
