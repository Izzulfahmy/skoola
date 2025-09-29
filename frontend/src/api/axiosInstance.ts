import axios from 'axios';

const getApiBaseUrl = () => {
  const { protocol, hostname } = window.location;

  // 1. Jika diakses dari IP jaringan lokal (saat development)
  //    Contoh: 192.168.x.x, 10.x.x.x, 172.16.x.x
  const isLocalIp = /^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(hostname);
  if (import.meta.env.DEV && isLocalIp) {
    // Bangun URL backend secara dinamis menggunakan IP yang sama
    // tetapi dengan port backend (8080).
    return `${protocol}//${hostname}:8080`;
  }
  
  // 2. Untuk semua kasus lain (localhost, domain tunnel seperti skoola.my.id,
  //    atau saat production build), gunakan path relatif.
  //    Ini akan membuat request dikirim ke domain yang sama dengan frontend.
  //    Contoh: https://skoola.my.id/api/login
  return '/api';
};

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menambahkan token (tidak perlu diubah)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Hapus '/api' dari awal URL jika baseURL bukan '/api' (untuk kasus IP lokal)
    if (config.baseURL !== '/api' && config.url?.startsWith('/api')) {
       config.url = config.url.substring(4);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;