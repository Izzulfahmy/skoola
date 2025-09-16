// file: src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react'; // <-- Perubahan ada di sini

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Jika pengguna tidak terotentikasi, arahkan ke halaman login
    return <Navigate to="/login" replace />;
  }

  // Jika terotentikasi, tampilkan halaman yang diminta
  return <>{children}</>;
};

export default ProtectedRoute;