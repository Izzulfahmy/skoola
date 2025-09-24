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
import TahunAjaranPage from './pages/TahunAjaranPage';
import MataPelajaranPage from './pages/MataPelajaranPage';
import KurikulumPage from './pages/KurikulumPage';
import RombelPage from './pages/RombelPage';

import SuperAdminLayout from './layouts/SuperAdminLayout';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import ManajemenSekolahPage from './pages/superadmin/ManajemenSekolahPage';
import ManajemenNaunganPage from './pages/superadmin/ManajemenNaunganPage';

import TeacherLayout from './layouts/TeacherLayout';
import TeacherDashboardPage from './pages/teacher/TeacherDashboardPage';
// --- IMPOR HALAMAN BIODATA BARU ---
import TeacherBiodataPage from './pages/teacher/TeacherBiodataPage';

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
          <Route path="tahun-ajaran" element={<TahunAjaranPage />} />
          <Route path="kurikulum" element={<KurikulumPage />} />
          <Route path="mata-pelajaran" element={<MataPelajaranPage />} />
          <Route path="teachers" element={<TeachersPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="rombel" element={<RombelPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Rute Panel Guru */}
        <Route path="/teacher" element={<ProtectedRoute><TeacherLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/teacher/dashboard" replace />} />
          <Route path="dashboard" element={<TeacherDashboardPage />} />
          {/* --- TAMBAHKAN RUTE BIODATA DI SINI --- */}
          <Route path="biodata" element={<TeacherBiodataPage />} />
        </Route>

        {/* Rute Superadmin */}
        <Route path="/superadmin" element={<ProtectedRoute><SuperAdminLayout /></ProtectedRoute>}>
          <Route index element={<SuperAdminDashboard />} />
          <Route path="naungan" element={<ManajemenNaunganPage />} /> 
          <Route path="naungan/:naunganId" element={<ManajemenSekolahPage />} /> 
          <Route path="sekolah" element={<ManajemenSekolahPage />} />
        </Route>

        {/* Rute untuk URL yang tidak cocok */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;