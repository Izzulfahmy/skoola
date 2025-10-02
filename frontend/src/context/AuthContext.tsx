// frontend/src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'; // <-- PERBAIKAN DI SINI
import { jwtDecode } from 'jwt-decode';
import type { AuthUser } from '../types';

// Definisikan tipe data yang ada di dalam token JWT Anda
interface DecodedToken {
  sub: string;
  role: 'admin' | 'teacher' | 'superadmin';
  sch?: string; // ID Sekolah/Tenant (opsional, untuk admin sekolah & guru)
  name?: string;
  email?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  user: AuthUser | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('authToken'));

  useEffect(() => {
    // Saat aplikasi dimuat, coba ambil token dari local storage
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        setUser({
          id: decoded.sub,
          role: decoded.role,
          name: decoded.name || 'Pengguna',
          email: decoded.email || '',
          username: decoded.email || '',
        });
        setIsAuthenticated(true);
      } catch (error) {
        // Jika token tidak valid, hapus
        console.error("Token tidak valid, sesi dihapus:", error);
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
      }
    }
  }, []);

  const login = (token: string) => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      localStorage.setItem('authToken', token);
      setUser({
        id: decoded.sub,
        role: decoded.role,
        name: decoded.name || 'Pengguna',
        email: decoded.email || '',
        username: decoded.email || '',
      });
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Gagal melakukan decode token saat login:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setIsAuthenticated(false);
    // Arahkan ke halaman login setelah logout untuk pengalaman pengguna yang lebih baik
    window.location.href = '/login';
  };
  
  const value = {
    isAuthenticated,
    login,
    logout,
    user, 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
};