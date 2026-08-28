import { defineConfig, build as viteBuild } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    {
      name: 'build-extension-scripts',
      apply: 'build',
      async closeBundle() {
        // 1. Build self-contained Content Script (IIFE - zero external chunk imports)
        await viteBuild({
          configFile: false,
          publicDir: false,
          build: {
            copyPublicDir: false,
            outDir: resolve(__dirname, 'dist/content'),
            emptyOutDir: false,
            lib: {
              entry: resolve(__dirname, 'src/content/index.ts'),
              name: 'VariaContentScript',
              formats: ['iife'],
              fileName: () => 'index.js',
            },
            rollupOptions: {
              output: {
                extend: true,
                inlineDynamicImports: true,
              },
            },
          },
        });

        // 2. Build self-contained Background Service Worker (ES Module)
        await viteBuild({
          configFile: false,
          publicDir: false,
          build: {
            copyPublicDir: false,
            outDir: resolve(__dirname, 'dist/background'),
            emptyOutDir: false,
            lib: {
              entry: resolve(__dirname, 'src/background/index.ts'),
              formats: ['es'],
              fileName: () => 'index.js',
            },
            rollupOptions: {
              output: {
                inlineDynamicImports: true,
              },
            },
          },
        });
      },
    },
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
});
