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

/** GitHub Pages project sites use `/<repo>/`; set `VITE_BASE` in CI (see `.github/workflows/deploy-pages.yml`). */
const base = process.env.VITE_BASE ?? '/'

export default defineConfig({
  base,
  plugins: [vue()],
  server: { proxy: horizonsProxy },
  preview: { proxy: horizonsProxy },
})
