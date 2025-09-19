// file: frontend/src/api/axiosInstance.ts
import axios from 'axios';

const apiClient = axios.create({
  // --- PERUBAHAN DI SINI ---
  // Kita tidak lagi menunjuk langsung ke 'http://localhost:8080'.
  // Sebagai gantinya, kita menunjuk ke '/api' yang akan ditangani
  // oleh proxy Vite yang sudah kita siapkan.
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menambahkan token otorisasi tetap sama
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;