import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Listen on all IPv4 interfaces
    port: 5173,
    strictPort: true, // Don't try other ports if 5173 is taken
    // Tambahkan URL ngrok Anda ke dalam daftar host yang diizinkan
    allowedHosts: [
      'skoola.my.id',
      'localhost',
      '127.0.0.1'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api/, '')
      }
    }
  }
})