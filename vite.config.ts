import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        // An update waits for a later visit instead of refreshing an active narration.
        registerType: 'prompt',
        includeAssets: [
          'manifest.json',
          'icons/audioguide.svg',
          'icons/audioguide-apple-touch.png',
          'icons/audioguide-192.png',
          'icons/audioguide-512.png',
          'icons/audioguide-maskable-512.png',
        ],
        // public/manifest.json is the one canonical manifest linked by index.html.
        manifest: false,
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,webp,jpg,jpeg}'],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          skipWaiting: false,
          clientsClaim: false,
          cleanupOutdatedCaches: false,
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
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: ({url}) => url.origin === self.location.origin && url.pathname.startsWith('/audio/') && url.pathname.endsWith('.mp3') && !url.searchParams.has('__dday_download'),
              handler: 'CacheFirst',
              options: {
                cacheName: 'dday-verified-media-v1',
                rangeRequests: true,
                cacheableResponse: {
                  statuses: [200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(fileURLToPath(new URL('.', import.meta.url))),
      },
    },
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [{ name: 'transcripts-en', test: /[\\/]src[\\/]data[\\/]english-transcripts\.en\.json$/ }],
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
