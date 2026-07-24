import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login }           from './pages/auth/Login';
import { Registro }        from './pages/auth/Registro';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Dashboard }       from './pages/dashboard/Dashboard';
import { Citas }           from './pages/citas/Citas';
import { Clientes }        from './pages/clientes/Clientes';
import { Mascotas }        from './pages/mascotas/Mascotas';
import { Pagos }           from './pages/pagos/Pagos';
import { Usuarios }        from './pages/usuarios/Usuarios';
import './App.css';


import { ClienteLayout } from './layouts/ClienteLayout';
import { PortalDashboard } from './pages/portal/PortalDashboard';
import { PortalCitas } from './pages/portal/PortalCitas';
import { PortalMascotas } from './pages/portal/PortalMascotas';

/* ─── Pantalla de carga de sesión ─────────────────────────────────────────── */
const Loader = ({ text = 'Cargando...' }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100vh', gap: '0.75rem',
    color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)',
    fontSize: '0.9375rem',
  }}>
    <div className="spinner spinner-dark" />
    {text}
  </div>
);

/* ─── Ruta protegida genérica ─────────────────────────────────────────────── */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loader text="Verificando sesión..." />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

/* ─── Redirección inteligente por rol ─────────────────────────────────────── */
const RootRedirect = () => {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return <Loader text="Iniciando..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  // cliente → portal propio  |  cualquier otro rol → dashboard admin
  return user?.rol === 'cliente'
    ? <Navigate to="/portal"    replace />
    : <Navigate to="/dashboard" replace />;
};

/* ─── App ─────────────────────────────────────────────────────────────────── */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Público */}
          <Route path="/login"    element={<Login />}    />
          <Route path="/registro" element={<Registro />} />


          {/* ── Dashboard Admin ──────────────────────────────────────────── */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index           element={<Dashboard />} />
            <Route path="citas"    element={<Citas />}     />
            <Route path="clientes" element={<Clientes />}  />
            <Route path="mascotas" element={<Mascotas />}  />
            <Route path="pagos"    element={<Pagos />}     />
            <Route path="usuarios" element={<Usuarios />}  />

          </Route>

          {/* ── Portal Cliente ───────────────────────────────────────────── */}
          <Route
            path="/portal"
            element={
              <ProtectedRoute>
                <ClienteLayout />
              </ProtectedRoute>
            }
          >
            <Route index               element={<PortalDashboard />} />
            <Route path="mis-citas"    element={<PortalCitas />}     />
            <Route path="mis-mascotas" element={<PortalMascotas />}  />
          </Route>

          {/* Raíz y rutas desconocidas → redirige por rol */}
          <Route path="/"  element={<RootRedirect />} />
          <Route path="*"  element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
