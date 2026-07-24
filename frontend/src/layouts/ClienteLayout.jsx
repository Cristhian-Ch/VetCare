import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Stethoscope,
  LayoutDashboard,
  Calendar,
  Dog,
  LogOut,
} from 'lucide-react';

const navItems = [
  { path: '/portal',              label: 'Inicio',       icon: LayoutDashboard },
  { path: '/portal/mis-citas',    label: 'Mis Citas',    icon: Calendar },
  { path: '/portal/mis-mascotas', label: 'Mis Mascotas', icon: Dog },
];

export const ClienteLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Obtener la primera inicial del nombre para el avatar
  const initials = user?.nombre
    ? user.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'CL';

  const currentPage = navItems.find(item => location.pathname === item.path) || navItems[0];

  return (
    <div className="app-wrapper">
      {/* ── SIDEBAR ── */}
      <aside className="sidebar" aria-label="Navegación del Cliente">
        {/* Marca */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon" aria-hidden="true">
            <Stethoscope size={20} />
          </div>
          Mi Portal
        </div>

        {/* Navegación principal */}
        <nav className="sidebar-nav" aria-label="Menú principal">
          <span className="sidebar-section-label">Panel de Cliente</span>
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`nav-link${isActive ? ' active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                title={label}
              >
                <Icon size={18} className="nav-link-icon" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Perfil de usuario */}
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar" aria-hidden="true">{initials}</div>
            <div className="user-info">
              <div className="user-name">{user?.nombre || 'Cliente'}</div>
              <div className="user-role">Dueño de mascota</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="btn btn-ghost w-full"
            style={{ justifyContent: 'flex-start', color: 'rgba(255,255,255,0.5)' }}
            title="Cerrar sesión"
          >
            <LogOut size={16} aria-hidden="true" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <div className="main-area">
        <header className="top-bar">
          <div className="top-bar-breadcrumb">
            <currentPage.icon size={18} aria-hidden="true" style={{ color: 'var(--primary-600)', opacity: 0.8 }} />
            {currentPage.label}
          </div>
          <div className="top-bar-actions">
            <span className="badge badge-success">● En línea</span>
          </div>
        </header>

        <main className="page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
