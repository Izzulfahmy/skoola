// frontend/src/App.tsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import TeacherLayout from './layouts/TeacherLayout';
import SuperAdminLayout from './layouts/SuperAdminLayout';

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
import PresensiPage from './pages/PresensiPage';
import EkstrakurikulerPage from './pages/EkstrakurikulerPage';
import PrestasiPage from './pages/PrestasiPage';
import RaporPage from './pages/RaporPage';
import UjianMasterPage from './pages/UjianMasterPage';
import UjianDetailPage from './pages/UjianDetailPage';

// Teacher Pages
import TeacherDashboardPage from './pages/teacher/TeacherDashboardPage';
import TeacherBiodataPage from './pages/teacher/TeacherBiodataPage';
import KelasSayaPage from './pages/teacher/KelasSayaPage';
import MateriAjarPage from './pages/teacher/MateriAjarPage';
import PenilaianPage from './pages/teacher/PenilaianPage';

// Superadmin Pages
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import ManajemenSekolahPage from './pages/superadmin/ManajemenSekolahPage';
import ManajemenNaunganPage from './pages/superadmin/ManajemenNaunganPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />


          {/* Admin/Sekolah Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="teachers" element={<TeachersPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="profile" element={<SchoolProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="tahun-ajaran" element={<TahunAjaranPage />} />
            <Route path="mata-pelajaran" element={<MataPelajaranPage />} />
            <Route path="kurikulum" element={<KurikulumPage />} />
            <Route path="rombel" element={<RombelPage />} />
            <Route path="presensi" element={<PresensiPage />} />
            <Route path="ekstrakurikuler" element={<EkstrakurikulerPage />} />
            <Route path="prestasi" element={<PrestasiPage />} />
            <Route path="ujian" element={<UjianMasterPage />} />
            <Route path="ujian/:id" element={<UjianDetailPage />} />
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
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<TeacherDashboardPage />} />
            <Route path="biodata" element={<TeacherBiodataPage />} />
            
            {/* PERBAIKAN: Mengganti route 'kelas-saya' menjadi 'penugasan' */}
            <Route path="penugasan" element={<KelasSayaPage />} />
            
            {/* Routes Materi Ajar & Penilaian tanpa parameter ID */}
            <Route path="materi-ajar" element={<MateriAjarPage />} />
            <Route path="penilaian" element={<PenilaianPage />} />
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
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="sekolah" element={<ManajemenSekolahPage />} />
            <Route path="naungan" element={<ManajemenNaunganPage />} />
            <Route path="naungan/:naunganId" element={<ManajemenSekolahPage />} />
          </Route>

          {/* Catch-all for unknown routes */}
          <Route path="*" element={<Navigate to="/404" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;