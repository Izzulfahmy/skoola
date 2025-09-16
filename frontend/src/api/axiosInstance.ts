// file: src/api/axiosInstance.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080', // URL base dari API backend Anda
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;