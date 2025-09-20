// file: frontend/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import TeachersPage from './pages/TeachersPage';
import StudentsPage from './pages/StudentsPage';
import SchoolProfilePage from './pages/SchoolProfilePage';
import SettingsPage from './pages/SettingsPage';

// --- 1. IMPOR HALAMAN DAN LAYOUT BARU ---
import SuperAdminLayout from './layouts/SuperAdminLayout';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import ManajemenSekolahPage from './pages/superadmin/ManajemenSekolahPage';


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
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* --- 2. PERBARUI RUTE SUPERADMIN --- */}
        <Route path="/superadmin" element={<ProtectedRoute><SuperAdminLayout /></ProtectedRoute>}>
          <Route index element={<SuperAdminDashboard />} />
          <Route path="sekolah" element={<ManajemenSekolahPage />} />
        </Route>

        {/* Rute untuk URL yang tidak cocok */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;