// file: src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';

// New interface for props
// Fix: 2322 - Menambahkan allowedRoles di props
interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[]; 
}

// Update the component definition
const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth(); // Get user for role check

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Logic to check role
  const userRole = user?.role;
  if (userRole && !allowedRoles.includes(userRole)) {
    // Jika authenticated tapi role tidak diizinkan, redirect ke base path yang benar
    if(userRole === 'superadmin') return <Navigate to="/superadmin" replace />;
    if(userRole === 'teacher') return <Navigate to="/teacher" replace />;
    // Default fallback
    return <Navigate to="/" replace />; 
  }
  
  // Jika authenticated dan role diizinkan, render children
  return <>{children}</>;
};

export default ProtectedRoute;