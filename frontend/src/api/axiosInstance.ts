// file: frontend/src/api/axiosInstance.ts
import axios from 'axios';

// Secara dinamis menentukan baseURL
// Saat di localhost, kita gunakan '/api' agar ditangani oleh proxy Vite.
// Saat online (diakses via skoola.my.id), kita gunakan URL lengkap
// agar request API dikirim ke domain yang benar.
const getApiBaseUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return '/api';
  }
  // Jika diakses dari domain lain, gunakan domain tersebut sebagai basis
  return `${window.location.protocol}//${window.location.hostname}/api`;
};

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menambahkan token otorisasi (tetap sama)
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