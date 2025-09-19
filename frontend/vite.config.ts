// file: frontend/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // --- TAMBAHKAN BAGIAN DI BAWAH INI ---
  server: {
    proxy: {
      // Setiap request ke path yang diawali '/api'
      // akan diteruskan ke target di bawah ini.
      '/api': {
        target: 'http://localhost:8080',
        // 'changeOrigin: true' diperlukan untuk virtual host
        changeOrigin: true,
        // Hapus '/api' dari path sebelum meneruskan request
        // Contoh: /api/login -> /login
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})