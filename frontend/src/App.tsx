import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout'; // <-- Impor layout baru
import TeachersPage from './pages/TeachersPage'; // <-- Impor placeholder
import StudentsPage from './pages/StudentsPage'; // <-- Impor placeholder

function App() {
  // Kita tidak lagi butuh 'isAuthenticated' di sini karena logika dihandle oleh ProtectedRoute dan Redirects
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Rute Induk yang Dilindungi */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* Rute-rute ini akan dirender di dalam <Outlet /> milik AdminLayout */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="teachers" element={<TeachersPage />} />
          <Route path="students" element={<StudentsPage />} />
          {/* Anda bisa menambahkan rute lain di dalam layout ini, contoh: */}
          {/* <Route path="settings" element={<SettingsPage />} /> */}
        </Route>

        {/* Rute untuk URL yang tidak cocok (catch-all) */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;