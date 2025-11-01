import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { AppProvider } from './contexts/AppContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import AttendancePage from './pages/Attendance';
import SalaryPage from './pages/Salary';
import Settings from './pages/Settings';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees"
        element={
          <ProtectedRoute>
            <Layout>
              <Employees />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <ProtectedRoute>
            <Layout>
              <AttendancePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/salary"
        element={
          <ProtectedRoute>
            <Layout>
              <SalaryPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/skills"
        element={
          <ProtectedRoute>
            <Layout>
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Keterampilan Karyawan</h1>
                  <p className="mt-1 text-sm text-gray-600">Kelola keterampilan dan kompetensi karyawan</p>
                </div>
                <div className="bg-white shadow rounded-lg p-6">
                  <p className="text-gray-500">Fitur keterampilan karyawan sedang dalam pengembangan.</p>
                </div>
              </div>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/performance"
        element={
          <ProtectedRoute>
            <Layout>
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Evaluasi Performansi</h1>
                  <p className="mt-1 text-sm text-gray-600">Penilaian dan evaluasi kinerja karyawan</p>
                </div>
                <div className="bg-white shadow rounded-lg p-6">
                  <p className="text-gray-500">Fitur evaluasi performansi karyawan sedang dalam pengembangan.</p>
                </div>
              </div>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <div className="App">
            <AppRoutes />
          </div>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
};

export default App;
