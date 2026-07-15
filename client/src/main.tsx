import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Map from './pages/Map';
import Report from './pages/Report';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import './style.css';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="loading-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="loading-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/map" element={<Map />} />
    <Route path="/report" element={<Report />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Navigate to="/login" replace />} />
    <Route
      path="/admin-dashboard"
      element={<AdminRoute><AdminDashboard /></AdminRoute>}
    />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Navbar />
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

createRoot(document.getElementById('root')!).render(<App />);
