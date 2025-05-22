// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', '**/*.json', '**/*.bin'], // model files
      manifest: {
        name: 'YOLOv8 Object Detection',
        short_name: 'YOLOv8',
        description: 'Offline-enabled object detection using YOLOv8 + TensorFlow.js',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,bin}'],
        runtimeCaching: [
          {
            urlPattern: /.*\.json|.*\.bin$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'model-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
              },
            },
          },
        ],
        maximumFileSizeToCacheInBytes: 5000000,
      },
    }),
  ],
  server: {
    proxy: {
      '/api/semaphore': {
        target: 'https://api.semaphore.co/api/v4',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/semaphore/, ''),
        secure: false,
      }
    }
  }
});
