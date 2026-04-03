import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const horizonsProxy = {
  '/jpl-horizons': {
    target: 'https://ssd.jpl.nasa.gov',
    changeOrigin: true,
    rewrite: (path) =>
      '/api/horizons.api' + (path.includes('?') ? path.slice(path.indexOf('?')) : ''),
  },
  '/nasa-missions-blog-feed': {
    target: 'https://www.nasa.gov',
    changeOrigin: true,
    rewrite: () => '/blogs/missions/feed/',
  },
}

export default defineConfig({
  plugins: [vue()],
  server: { proxy: horizonsProxy },
  preview: { proxy: horizonsProxy },
})
