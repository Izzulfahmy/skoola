import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import 'antd/dist/reset.css';
import './index.css';
import { AuthProvider } from './context/AuthContext.tsx';
// --- PERBAIKAN: Impor QueryClient dan QueryClientProvider ---
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; 

// Inisialisasi Query Client di luar komponen
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* --- PERBAIKAN: Bungkus App dengan QueryClientProvider --- */}
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);