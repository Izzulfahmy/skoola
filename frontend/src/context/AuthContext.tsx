// frontend/src/context/AuthContext.tsx

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { AuthUser, TahunAjaran } from '../types';
import { getAllTahunAjaran } from '../api/tahunAjaran';

interface DecodedToken {
  sub: string;
  role: 'admin' | 'teacher' | 'superadmin';
  sch?: string;
  name?: string;
  email?: string;
}

// 1. TAMBAHKAN 'loading' KE DALAM TIPE CONTEXT
interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean; // <-- TAMBAHKAN INI
  login: (token: string) => void;
  logout: () => void;
  user: AuthUser | null;
  activeTahunAjaran: TahunAjaran | null;
  setActiveTahunAjaran: (tahunAjaran: TahunAjaran | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false); // Default ke false
  const [loading, setLoading] = useState<boolean>(true); // <-- 2. BUAT STATE 'loading', default ke true
  const [activeTahunAjaran, setActiveTahunAjaranState] = useState<TahunAjaran | null>(() => {
    const stored = localStorage.getItem('activeTahunAjaran');
    return stored ? JSON.parse(stored) : null;
  });

  const setActiveTahunAjaran = (tahunAjaran: TahunAjaran | null) => {
    setActiveTahunAjaranState(tahunAjaran);
    if (tahunAjaran) {
      localStorage.setItem('activeTahunAjaran', JSON.stringify(tahunAjaran));
    } else {
      localStorage.removeItem('activeTahunAjaran');
    }
  };

  const initializeSession = useCallback(async (token: string) => {
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

      if (decoded.role === 'admin' || decoded.role === 'teacher') {
        const listTahunAjaran = await getAllTahunAjaran();
        const currentlyActive = listTahunAjaran.find(ta => ta.status === 'Aktif');
        if (currentlyActive) {
          setActiveTahunAjaran(currentlyActive);
        } else if (!activeTahunAjaran && listTahunAjaran.length > 0) {
          setActiveTahunAjaran(listTahunAjaran[0]);
        }
      }
    } catch (error) {
      console.error("Token tidak valid, sesi dihapus:", error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('activeTahunAjaran');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
        setLoading(false); // <-- 3. SET 'loading' KE FALSE SETELAH SELESAI
    }
  }, [activeTahunAjaran]);


  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      initializeSession(token);
    } else {
        setLoading(false); // <-- 4. JIKA TIDAK ADA TOKEN, SELESAIKAN LOADING
    }
  }, [initializeSession]);

  const login = (token: string) => {
    setLoading(true); // Mulai loading saat login
    localStorage.setItem('authToken', token);
    initializeSession(token);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('activeTahunAjaran');
    setUser(null);
    setActiveTahunAjaranState(null);
    setIsAuthenticated(false);
    window.location.href = '/login';
  };
  
  const value = {
    isAuthenticated,
    loading, // <-- 5. SEDIAKAN 'loading' DI VALUE
    login,
    logout,
    user,
    activeTahunAjaran,
    setActiveTahunAjaran,
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