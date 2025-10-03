// frontend/src/components/ProtectedRoute.tsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spin, Layout } from 'antd';

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { isAuthenticated, user, loading } = useAuth(); // 1. AMBIL 'loading' DARI CONTEXT

  // 2. TAMPILKAN SPINNER JIKA SEDANG LOADING
  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" />
      </Layout>
    );
  }

  // 3. JIKA SUDAH TIDAK LOADING, LANJUTKAN LOGIKA SEPERTI BIASA
  if (!isAuthenticated) {
    // Redirect ke halaman login jika tidak terotentikasi
    return <Navigate to="/login" replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    // Redirect ke 404 jika role tidak diizinkan
    // Ini lebih baik daripada ke login, karena user sudah login tapi tidak punya hak akses
    return <Navigate to="/404" replace />;
  }

  // Jika children (layout) diberikan, render layout tersebut.
  // Outlet di dalam layout akan menangani rute-rute nested.
  if (children) {
    return children;
  }

  // Jika tidak ada children (untuk rute tunggal), gunakan Outlet.
  return <Outlet />;
};

export default ProtectedRoute;