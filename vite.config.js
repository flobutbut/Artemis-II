import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const horizonsProxy = {
  '/jpl-horizons': {
    target: 'https://ssd.jpl.nasa.gov',
    changeOrigin: true,
    rewrite: (path) =>
      '/api/horizons.api' + (path.includes('?') ? path.slice(path.indexOf('?')) : ''),
  },
}

export default defineConfig({
  plugins: [vue()],
  server: { proxy: horizonsProxy },
  preview: { proxy: horizonsProxy },
})
