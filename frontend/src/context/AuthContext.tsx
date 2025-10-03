// file: frontend/src/context/AuthContext.tsx
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

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
  user: AuthUser | null;
  activeTahunAjaran: TahunAjaran | null;
  setActiveTahunAjaran: (tahunAjaran: TahunAjaran | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTahunAjaran, setActiveTahunAjaranState] = useState<TahunAjaran | null>(() => {
    const stored = localStorage.getItem('activeTahunAjaran');
    try {
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
  });

  const setActiveTahunAjaran = (tahunAjaran: TahunAjaran | null) => {
    setActiveTahunAjaranState(tahunAjaran);
    if (tahunAjaran) {
      localStorage.setItem('activeTahunAjaran', JSON.stringify(tahunAjaran));
    } else {
      localStorage.removeItem('activeTahunAjaran');
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('activeTahunAjaran');
    setUser(null);
    setActiveTahunAjaranState(null);
    setIsAuthenticated(false);
    // Redirect ke halaman login untuk memastikan state bersih
    window.location.href = '/login';
  }, []);

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

      // Hanya fetch tahun ajaran jika role-nya admin atau teacher
      if (decoded.role === 'admin' || decoded.role === 'teacher') {
        const listTahunAjaran = await getAllTahunAjaran();
        const storedTA = localStorage.getItem('activeTahunAjaran');
        
        if (!storedTA) { // Hanya set jika di localStorage kosong
            const currentlyActive = listTahunAjaran.find(ta => ta.status === 'Aktif');
            if (currentlyActive) {
              setActiveTahunAjaran(currentlyActive);
            } else if (listTahunAjaran.length > 0) {
              setActiveTahunAjaran(listTahunAjaran[0]);
            }
        }
      }
    } catch (error) {
      console.error("Token tidak valid, sesi dihapus:", error);
      logout();
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logout]); // <-- DEPENDENCY 'activeTahunAjaran' DIHAPUS

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      initializeSession(token);
    } else {
      setLoading(false);
    }
  }, [initializeSession]);

  const login = (token: string) => {
    setLoading(true);
    localStorage.setItem('authToken', token);
    initializeSession(token);
  };

  const value = {
    isAuthenticated,
    loading,
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