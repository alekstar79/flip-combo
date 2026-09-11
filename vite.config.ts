/// <reference types="vitest/config" />

import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

const src = (path: string) =>
  fileURLToPath(new URL(`./src/${path}`, import.meta.url))

/**
 * GitHub Pages serves this project at /flip-combo/.
 * When `GH_PAGES=true` (set in the GH Actions workflow) we emit
 * absolute asset URLs, otherwise relative ones for local development.
 */
const isGhPages = process.env.GH_PAGES === 'true'

export default defineConfig({
  base: isGhPages ? '/flip-combo/' : './',
  resolve: {
    alias: [
      // style.css → aggregated src/style.scss
      {
        find: /^@alekstar79\/flip-combo\/style\.css$/,
        replacement: src('style.scss'),
      },

      // subpath entries — long paths first
      { find: /^@alekstar79\/flip-combo\/calc$/, replacement: src('calc/index.ts') },
      { find: /^@alekstar79\/flip-combo\/calendar$/, replacement: src('calendar/index.ts') },
      { find: /^@alekstar79\/flip-combo\/flipper$/, replacement: src('flipper/index.ts') },
      { find: /^@alekstar79\/flip-combo\/host$/, replacement: src('host/index.ts') },
      { find: /^@alekstar79\/flip-combo\/utils$/, replacement: src('utils/index.ts') },

      // root entry — must be last
      { find: /^@alekstar79\/flip-combo$/, replacement: src('index.ts') },

      // internal @/ alias
      { find: /^@\/(.*)$/, replacement: src('$1') },
    ]
  },
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/variables" as *;`,
      },
    },
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    cssMinify: 'lightningcss',

    // outDir: isGhPages ? 'demo-dist/flip-combo' : 'demo-dist',
    outDir: 'demo-dist',

    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        calc: fileURLToPath(new URL('./examples/calc/index.html', import.meta.url)),
        calendar: fileURLToPath(new URL('./examples/calendar/index.html', import.meta.url)),
        combo: fileURLToPath(new URL('./examples/combo/index.html', import.meta.url)),
      }
    }
  },
  test: {
    environment: 'node',
    include: ['__tests__/**/*.test.ts'],
    reporters: ['default']
  }
})
