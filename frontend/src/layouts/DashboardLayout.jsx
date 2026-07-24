import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Stethoscope,
  LayoutDashboard,
  Users,
  Dog,
  Calendar,
  CreditCard,
  LogOut,
  Shield,
} from 'lucide-react';


const navItemsGestion = [
  { path: '/dashboard',           label: 'Inicio',    icon: LayoutDashboard, roles: ['admin', 'veterinario'] },
  { path: '/dashboard/citas',     label: 'Citas',     icon: Calendar,        roles: ['admin', 'veterinario'] },
  { path: '/dashboard/clientes',  label: 'Clientes',  icon: Users,           roles: ['admin', 'veterinario'] },
  { path: '/dashboard/mascotas',  label: 'Mascotas',  icon: Dog,             roles: ['admin', 'veterinario'] },
  { path: '/dashboard/pagos',     label: 'Pagos',     icon: CreditCard,      roles: ['admin'] },
];

const navItemsAdmin = [
  { path: '/dashboard/usuarios',  label: 'Usuarios & Roles', icon: Shield, roles: ['admin'] },
];

// Lista completa para detectar página activa en el breadcrumb
const navItems = [...navItemsGestion, ...navItemsAdmin];


export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Obtener la primera inicial del nombre para el avatar
  const initials = user?.nombre
    ? user.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'VC';

  // Heurística 1 y 6: mostrar el título correcto de la página activa
  const currentPage = navItems.find(item => location.pathname === item.path) || navItems[0];
  const userRol = user?.rol || 'veterinario'; // fallback

  return (
    <div className="app-wrapper">
      {/* ── SIDEBAR ── */}
      <aside className="sidebar" aria-label="Navegación principal">
        {/* Marca */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon" aria-hidden="true">
            <Stethoscope size={20} />
          </div>
          VetCare
        </div>

        {/* Navegación principal */}
        <nav className="sidebar-nav" aria-label="Menú principal">
          <span className="sidebar-section-label">Gestión</span>
          {navItemsGestion
            .filter(item => item.roles.includes(userRol))
            .map(({ path, label, icon: Icon }) => {
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

          {userRol === 'admin' && (
            <>
              <span className="sidebar-section-label" style={{ marginTop: '0.75rem' }}>Administración</span>
              {navItemsAdmin
                .filter(item => item.roles.includes(userRol))
                .map(({ path, label, icon: Icon }) => {
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
            </>
          )}
        </nav>

        {/* Perfil de usuario */}
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar" aria-hidden="true">{initials}</div>
            <div className="user-info">
              <div className="user-name">{user?.nombre || 'Usuario'}</div>
              <div className="user-role">{user?.rol || ''}</div>
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
        {/* Top Bar – heurística 1: visibilidad del estado */}
        <header className="top-bar">
          <div className="top-bar-breadcrumb">
            <currentPage.icon size={18} aria-hidden="true" style={{ color: 'var(--primary-600)', opacity: 0.8 }} />
            {currentPage.label}
          </div>
          <div className="top-bar-actions">
            <span className="badge badge-success">● En línea</span>
          </div>
        </header>

        {/* Contenido de la ruta activa */}
        <main className="page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
