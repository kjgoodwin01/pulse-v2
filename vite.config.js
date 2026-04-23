import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/pulse-v2/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['sqlocal']
  }
})
