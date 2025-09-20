// file: frontend/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import TeachersPage from './pages/TeachersPage';
import StudentsPage from './pages/StudentsPage';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import SchoolProfilePage from './pages/SchoolProfilePage';
import SettingsPage from './pages/SettingsPage'; // <-- 1. IMPOR HALAMAN BARU

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Rute Induk Admin Sekolah */}
        <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="profile" element={<SchoolProfilePage />} />
          <Route path="teachers" element={<TeachersPage />} />
          <Route path="students" element={<StudentsPage />} />
          {/* --- 2. TAMBAHKAN RUTE BARU DI SINI --- */}
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Rute Induk Superadmin */}
        <Route path="/superadmin" element={<ProtectedRoute><SuperAdminDashboard /></ProtectedRoute>} />

        {/* Rute untuk URL yang tidak cocok */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;