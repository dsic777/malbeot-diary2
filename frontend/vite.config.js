import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/malbeot/',
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/malbeot/api': {
        target: 'http://127.0.0.1:8000',
        rewrite: (path) => path.replace(/^\/malbeot/, ''),
      },
    },
  },
})
