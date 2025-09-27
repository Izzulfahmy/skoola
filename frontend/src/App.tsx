// file: frontend/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { App as AntApp } from 'antd'; // Impor komponen App dan beri alias

// Layouts
import AdminLayout from './layouts/AdminLayout';
import SuperAdminLayout from './layouts/SuperAdminLayout';
import TeacherLayout from './layouts/TeacherLayout';

// General Pages
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin Pages
import DashboardPage from './pages/DashboardPage';
import TeachersPage from './pages/TeachersPage';
import StudentsPage from './pages/StudentsPage';
import SchoolProfilePage from './pages/SchoolProfilePage';
import SettingsPage from './pages/SettingsPage';
import TahunAjaranPage from './pages/TahunAjaranPage';
import MataPelajaranPage from './pages/MataPelajaranPage';
import KurikulumPage from './pages/KurikulumPage';
import RombelPage from './pages/RombelPage';

// Superadmin Pages
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import ManajemenSekolahPage from './pages/superadmin/ManajemenSekolahPage';
import ManajemenNaunganPage from './pages/superadmin/ManajemenNaunganPage';

// Teacher Pages
import TeacherDashboardPage from './pages/teacher/TeacherDashboardPage';
import TeacherBiodataPage from './pages/teacher/TeacherBiodataPage';
import KelasSayaPage from './pages/teacher/KelasSayaPage';
import MateriAjarPage from './pages/teacher/MateriAjarPage';
import PenilaianPage from './pages/teacher/PenilaianPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AntApp> {/* <-- Tambahkan pembungkus ini */}
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
            <Route path="rombel/:kelasId" element={<RombelPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Rute Panel Guru */}
          <Route path="/teacher" element={<ProtectedRoute><TeacherLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/teacher/dashboard" replace />} />
            <Route path="dashboard" element={<TeacherDashboardPage />} />
            <Route path="biodata" element={<TeacherBiodataPage />} />
            <Route path="my-classes" element={<KelasSayaPage />} />
            <Route path="materials" element={<MateriAjarPage />} />
            <Route path="assessments" element={<PenilaianPage />} />
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
    </AntApp> /* <-- Tambahkan penutup ini */
  );
}

export default App;
