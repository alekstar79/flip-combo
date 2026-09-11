import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  plugins: [
    dts({
      // Generate declarations from all ts files in src, except the demo entry
      include: ['src/**/*.ts'],
      exclude: ['src/main.ts', '__tests__/**'],

      // entryRoot = 'src' - preserves the directory structure:
      //   src/calc/index.ts → dist/calc/index.d.ts
      entryRoot: 'src',

      // Use the build tsconfig (with emit).
      tsconfigPath: './tsconfig.build.json'
    })
  ],
  css: {
    preprocessorOptions: {
      scss: {
        // Variables are available in all SCSS files without explicit @use.
        additionalData: `@use "@/styles/variables" as *;`
      }
    }
  },
  build: {
    lib: {
      entry: {
        'index': fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        'calc/index': fileURLToPath(new URL('./src/calc/index.ts', import.meta.url)),
        'calendar/index': fileURLToPath(new URL('./src/calendar/index.ts', import.meta.url)),
        'flipper/index': fileURLToPath(new URL('./src/flipper/index.ts', import.meta.url)),
        'host/index': fileURLToPath(new URL('./src/host/index.ts', import.meta.url)),
        'utils/index': fileURLToPath(new URL('./src/utils/index.ts', import.meta.url)),
      },

      formats: ['es'],

      // Fixed CSS file name. Without this, Vite uses the package name.
      cssFileName: 'style'
    },
    rolldownOptions: {
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
        assetFileNames: '[name][extname]'
      },
      external: []
    },

    copyPublicDir: false,

    // CSS - one file, do not split by modules
    cssCodeSplit: false,

    // Source maps for debugging by the consumer
    sourcemap: true,

    // Leave minification to the consumer - they minify their bundle
    minify: false,

    // Clean dist before building
    emptyOutDir: true,

    // Target standard
    target: 'es2022'
  }
})
