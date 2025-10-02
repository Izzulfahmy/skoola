// file: src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
// Import AuthUser type
import type { AuthUser } from '../types'; 

// 1. Definisikan "bentuk" dari data yang akan kita simpan di context
interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  user: AuthUser | null; 
}

// 2. Buat Context dengan bentuk yang sudah kita definisikan
const AuthContext = createContext<AuthContextType | null>(null);

// 3. Buat "Provider", komponen yang akan menyediakan state ke seluruh aplikasi
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [user, setUser] = useState<AuthUser | null>(null); 

  // Fungsi utilitas untuk mendapatkan data user dari token (minimal)
  // Fix 6133: Variabel 't' dihapus dari parameter karena tidak digunakan.
  const decodeAndSetUser = () => { 
      // NOTE: Logic real-world harus meng-decode JWT
      setUser({ 
          id: 'dummy-id-from-token', 
          email: 'admin@sekolah.com', 
          name: 'Admin Sekolah', 
          role: 'admin', 
          username: 'admin' 
      });
  }

  // Effect untuk menginisialisasi user dari token yang sudah ada
  useEffect(() => {
    if (token) {
        decodeAndSetUser(); 
    }
  }, [token]);

  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('authToken', newToken);
    decodeAndSetUser();
  };

  const logout = () => {
    setToken(null);
    setUser(null); 
    localStorage.removeItem('authToken');
  };
  
  const value = {
    token,
    isAuthenticated: !!token, 
    login,
    logout,
    user, 
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