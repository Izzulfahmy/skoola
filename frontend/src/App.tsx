// frontend/src/App.tsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
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
import PresensiPage from './pages/PresensiPage';
import EkstrakurikulerPage from './pages/EkstrakurikulerPage';
import PrestasiPage from './pages/PrestasiPage';
import UjianPage from './pages/UjianPage';
import RaporPage from './pages/RaporPage'; // <-- Import halaman baru

// Teacher Pages
import TeacherLayout from './layouts/TeacherLayout';
import TeacherDashboardPage from './pages/teacher/TeacherDashboardPage';
import TeacherBiodataPage from './pages/teacher/TeacherBiodataPage';
import KelasSayaPage from './pages/teacher/KelasSayaPage';
import MateriAjarPage from './pages/teacher/MateriAjarPage';
import PenilaianPage from './pages/teacher/PenilaianPage';

// Superadmin Pages
import SuperAdminLayout from './layouts/SuperAdminLayout';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import ManajemenSekolahPage from './pages/superadmin/ManajemenSekolahPage';
import ManajemenNaunganPage from './pages/superadmin/ManajemenNaunganPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/404" element={<NotFoundPage />} />

        {/* Admin/Sekolah Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="teachers" element={<TeachersPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="admin/profile" element={<SchoolProfilePage />} />
          <Route path="settings/:tab?" element={<SettingsPage />} />
          <Route path="tahun-ajaran" element={<TahunAjaranPage />} />
          <Route path="mata-pelajaran" element={<MataPelajaranPage />} />
          <Route path="kurikulum" element={<KurikulumPage />} />
          <Route path="rombel" element={<RombelPage />} />
          <Route path="presensi" element={<PresensiPage />} />
          <Route path="ekstrakurikuler" element={<EkstrakurikulerPage />} />
          <Route path="prestasi" element={<PrestasiPage />} />
          <Route path="ujian" element={<UjianPage />} />
          {/* --- PENAMBAHAN RUTE RAPOR --- */}
          <Route path="rapor" element={<RaporPage />} />
        </Route>

        {/* Teacher Routes */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<TeacherDashboardPage />} />
          <Route path="biodata" element={<TeacherBiodataPage />} />
          <Route path="kelas-saya" element={<KelasSayaPage />} />
          <Route path="materi-ajar/:pengajarKelasID" element={<MateriAjarPage />} />
          <Route path="penilaian/:pengajarKelasID/:kelasID" element={<PenilaianPage />} />
        </Route>

        {/* Superadmin Routes */}
        <Route
          path="/superadmin"
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <SuperAdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<SuperAdminDashboard />} />
          <Route path="manajemen-sekolah" element={<ManajemenSekolahPage />} />
          <Route path="manajemen-naungan" element={<ManajemenNaunganPage />} />
        </Route>

        {/* Catch-all for unknown routes */}
        <Route path="*" element={<Navigate to="/404" />} />
      </Routes>
    </Router>
  );
};

export default App;