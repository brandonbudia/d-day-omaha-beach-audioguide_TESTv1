import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';
import {createOfflineShellBuild} from './scripts/offlineShellBuild';

export default defineConfig((environment) => {
  const offlineShell = environment?.command === 'build' ? createOfflineShellBuild() : undefined;
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
          ...offlineShell?.workbox,
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
                plugins: [{
                  // Workbox serializes these callbacks. Keep them independent of the Vite scope.
                  cacheWillUpdate: async ({response}) => {
                    // Only the explicit pack download writes bytes after size and SHA-256 verification.
                    void response.body?.cancel().catch(() => {});
                    return null;
                  },
                  cachedResponseWillBeUsed: async ({request, cachedResponse, state}) => {
                    const range = request.headers.get('range')?.trim();
                    if (state && cachedResponse?.status === 200 && range && !range.includes(',')) {
                      state.mediaRange = range;
                      // For an open range, Workbox's 206 already reports the source length.
                      if (!/^bytes=\d+-$/i.test(range)) state.mediaSource = cachedResponse.clone();
                    }
                    return cachedResponse;
                  },
                  handlerWillRespond: async ({response, state}) => {
                    const range = state?.mediaRange as string | undefined;
                    if (!range) return response;
                    const source = state?.mediaSource as Response | undefined;
                    const bounds = /^bytes=(\d*)-(\d*)$/i.exec(range);
                    const first = bounds?.[1] ? BigInt(bounds[1]) : undefined;
                    const last = bounds?.[2] ? BigInt(bounds[2]) : undefined;
                    const invalid = (first === undefined && last === undefined)
                      || (first !== undefined && last !== undefined && last < first);
                    if (invalid && response.status === 206 && source) return source;

                    try {
                      if (invalid || (response.status !== 206 && response.status !== 416)) return response;
                      const reportedSize = response.status === 206
                        ? /\/(\d+)$/.exec(response.headers.get('content-range') ?? '')?.[1]
                        : undefined;
                      const file = reportedSize === undefined ? await source?.blob() : undefined;
                      if (reportedSize === undefined && !file) return response;
                      const size = BigInt(reportedSize ?? file!.size);
                      if (size === 0n || (first !== undefined ? first >= size : last === 0n)) {
                        return new Response(null, {
                          status: 416,
                          headers: {'Content-Range': `bytes */${size}`, 'Content-Length': '0'},
                        });
                      }
                      const start = first ?? (last! < size ? size - last! : 0n);
                      const end = first !== undefined && last !== undefined && last < size ? last : size - 1n;
                      const contentRange = `bytes ${start}-${end}/${size}`;
                      const length = String(end - start + 1n);
                      if (response.status === 206 && response.headers.get('content-range') === contentRange
                        && response.headers.get('content-length') === length) return response;

                      // Any replacement body comes from the original cache hit, never a new lookup.
                      const original = file ?? await source?.blob();
                      if (!original || BigInt(original.size) !== size) return Response.error();
                      const headers = new Headers(source?.headers);
                      headers.set('Content-Range', contentRange);
                      headers.set('Content-Length', length);
                      return new Response(original.slice(Number(start), Number(end + 1n)), {status: 206, headers});
                    } finally {
                      if (source && !source.bodyUsed) void source.body?.cancel().catch(() => {});
                    }
                  },
                }],
                rangeRequests: true,
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
      offlineShell?.plugin,
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
