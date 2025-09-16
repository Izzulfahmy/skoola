// file: src/api/axiosInstance.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080', // URL base dari API backend Anda
  headers: {
    'Content-Type': 'application/json',
  },
});
// TAMBAHKAN BLOK INTERCEPTOR DI BAWAH INI
apiClient.interceptors.request.use(
  (config) => {
    // Ambil token dari localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      // Jika token ada, tambahkan ke header Authorization
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Lakukan sesuatu dengan error permintaan
    return Promise.reject(error);
  }
);

export default apiClient;