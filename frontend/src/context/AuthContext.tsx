// file: src/context/AuthContext.tsx
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react'; // <-- Perubahan ada di sini

// 1. Definisikan "bentuk" dari data yang akan kita simpan di context
interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

// 2. Buat Context dengan bentuk yang sudah kita definisikan
const AuthContext = createContext<AuthContextType | null>(null);

// 3. Buat "Provider", komponen yang akan menyediakan state ke seluruh aplikasi
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Ambil token dari localStorage saat pertama kali aplikasi dimuat
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));

  const login = (newToken: string) => {
    setToken(newToken);
    // Simpan token ke localStorage agar tetap ada saat halaman di-refresh
    localStorage.setItem('authToken', newToken);
  };

  const logout = () => {
    setToken(null);
    // Hapus token dari localStorage saat logout
    localStorage.removeItem('authToken');
  };
  
  // Nilai yang akan dibagikan ke semua komponen di bawahnya
  const value = {
    token,
    isAuthenticated: !!token, // konversi string (atau null) menjadi boolean
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 4. Buat custom hook untuk mempermudah penggunaan context ini
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
};