import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// Relative base so the build runs from any folder or static host.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1200,
    // INLINE_FONTS=1 embeds the web fonts in the CSS, for hosts that only serve
    // a page and its scripts (used for the hosted preview).
    assetsInlineLimit: process.env.INLINE_FONTS ? (file: string) => (file.endsWith('.woff2') ? true : undefined) : 4096,
  },
})
