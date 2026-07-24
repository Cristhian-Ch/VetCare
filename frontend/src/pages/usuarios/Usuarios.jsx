import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getUsuarios, actualizarUsuario, crearUsuarioAdmin, eliminarUsuario,
} from '../../api/usuarios';
import {
  Shield, UserPlus, Pencil, Trash2, X, Eye, EyeOff,
  CheckCircle2, AlertCircle, Search, Users, Lock, Mail, User,
  BadgeCheck,
} from 'lucide-react';

/* ─── Constantes ─────────────────────────────────────────────────────────── */
const ROLES = [
  { value: 'admin',       label: 'Administrador', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
  { value: 'veterinario', label: 'Veterinario',   color: '#0891b2', bg: 'rgba(8,145,178,0.1)'  },
  { value: 'cliente',     label: 'Cliente',        color: '#059669', bg: 'rgba(5,150,105,0.1)'  },
];
const ROL_INFO = Object.fromEntries(ROLES.map(r => [r.value, r]));

/* ─── Helpers UI ─────────────────────────────────────────────────────────── */
const RolBadge = ({ rol }) => {
  const info = ROL_INFO[rol] ?? { label: rol ?? '—', color: '#64748b', bg: 'rgba(100,116,139,0.1)' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      padding: '0.2rem 0.65rem', borderRadius: '9999px',
      fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.03em',
      color: info.color, background: info.bg,
    }}>
      <BadgeCheck size={11} aria-hidden="true" />{info.label}
    </span>
  );
};

const Initials = ({ nombre = '' }) => {
  const ini = nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';
  return (
    <div style={{
      width: '2.25rem', height: '2.25rem', borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, var(--primary-600), #818cf8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.8125rem', fontWeight: 700, color: '#fff',
    }} aria-hidden="true">{ini}</div>
  );
};

const FieldIcon = ({ icon: Icon }) => (
  <Icon size={15} aria-hidden="true" style={{
    position: 'absolute', left: '0.875rem', top: '50%',
    transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none',
  }} />
);

/* ─── Modal genérico ─────────────────────────────────────────────────────── */
const Modal = ({ title, subtitle, icon: Icon, onClose, children }) => (
  <div
    role="dialog" aria-modal="true"
    onClick={e => e.target === e.currentTarget && onClose()}
    style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
    }}
  >
    <div style={{
      background: 'var(--surface-1)', borderRadius: 'var(--radius-xl)',
      width: '100%', maxWidth: 480,
      boxShadow: '0 24px 60px -12px rgba(0,0,0,0.3)', overflow: 'hidden',
    }}>
      <div style={{
        padding: '1.5rem', background: 'linear-gradient(135deg,#eff6ff,#fff)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      }}>
        <div>
          <div style={{
            width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--primary-600), #818cf8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', marginBottom: '0.75rem',
          }}><Icon size={18} aria-hidden="true" /></div>
          <h3 style={{ margin: 0 }}>{title}</h3>
          {subtitle && <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{subtitle}</p>}
        </div>
        <button onClick={onClose} aria-label="Cerrar"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem' }}>
          <X size={18} />
        </button>
      </div>
      <div style={{ padding: '1.5rem' }}>{children}</div>
    </div>
  </div>
);

/* ─── Modal Crear Usuario ────────────────────────────────────────────────── */
const ModalCrear = ({ onClose, onSuccess }) => {
  const firstRef = useRef(null);
  const [f, setF] = useState({ nombre: '', correo: '', password: '', confirmar: '', rol: 'veterinario' });
  const [showPwd, setShowPwd] = useState(false);
  const [err,     setErr]     = useState('');
  const [saving,  setSaving]  = useState(false);

  useEffect(() => { firstRef.current?.focus(); }, []);

  const set = (key) => (e) => setF(p => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!f.nombre.trim())         { setErr('El nombre completo es obligatorio.');           return; }
    if (!f.correo.trim())         { setErr('El correo electrónico es obligatorio.');        return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.correo)) { setErr('El correo no tiene formato válido.'); return; }
    if (f.password.length < 8)    { setErr('La contraseña debe tener al menos 8 caracteres.'); return; }
    if (!/\d/.test(f.password))   { setErr('La contraseña debe incluir al menos un número.'); return; }
    if (f.password !== f.confirmar){ setErr('Las contraseñas no coinciden.'); return; }

    setSaving(true);
    try {
      await crearUsuarioAdmin({
        nombre:   f.nombre.trim(),
        correo:   f.correo.trim().toLowerCase(),
        password: f.password,
        rol:      f.rol,
      });
      onSuccess(`Usuario "${f.nombre.trim()}" creado correctamente.`);
      onClose();
    } catch (ex) {
      setErr(ex.message || 'No se pudo crear el usuario. Verifica que el correo no esté ya registrado.');
    } finally {
      setSaving(false);
    }
  };

  const pwdMatch = f.confirmar && f.confirmar !== f.password;

  return (
    <Modal title="Nuevo Usuario" subtitle="Crea una cuenta con rol específico" icon={UserPlus} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        {err && (
          <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
            <AlertCircle size={15} className="alert-icon" aria-hidden="true" />
            <span style={{ flex: 1 }}>{err}</span>
            <button onClick={() => setErr('')} type="button"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.7, display: 'flex' }}>
              <X size={14} aria-label="Cerrar" />
            </button>
          </div>
        )}

        {/* Nombre */}
        <div className="form-group">
          <label className="form-label" htmlFor="c-nombre">Nombre completo *</label>
          <div style={{ position: 'relative' }}>
            <FieldIcon icon={User} />
            <input ref={firstRef} id="c-nombre" className="form-input" style={{ paddingLeft: '2.5rem' }}
              value={f.nombre} onChange={set('nombre')} placeholder="Nombre Apellido" required />
          </div>
        </div>

        {/* Correo */}
        <div className="form-group">
          <label className="form-label" htmlFor="c-correo">Correo electrónico *</label>
          <div style={{ position: 'relative' }}>
            <FieldIcon icon={Mail} />
            <input id="c-correo" type="email" className="form-input" style={{ paddingLeft: '2.5rem' }}
              value={f.correo} onChange={set('correo')} placeholder="correo@vetcare.com" required />
          </div>
        </div>

        {/* Rol */}
        <div className="form-group">
          <label className="form-label" htmlFor="c-rol">Rol *</label>
          <div style={{ position: 'relative' }}>
            <FieldIcon icon={Shield} />
            <select id="c-rol" className="form-select" style={{ paddingLeft: '2.5rem' }}
              value={f.rol} onChange={set('rol')}>
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
        </div>

        {/* Contraseña */}
        <div className="form-group">
          <label className="form-label" htmlFor="c-pwd">Contraseña *</label>
          <div style={{ position: 'relative' }}>
            <FieldIcon icon={Lock} />
            <input id="c-pwd" type={showPwd ? 'text' : 'password'} className="form-input"
              style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }}
              value={f.password} onChange={set('password')}
              placeholder="Mínimo 8 caracteres con números" autoComplete="new-password" />
            <button type="button" onClick={() => setShowPwd(v => !v)}
              aria-label={showPwd ? 'Ocultar' : 'Mostrar'}
              style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '0.25rem' }}>
              {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* Confirmar contraseña */}
        <div className="form-group">
          <label className="form-label" htmlFor="c-confirm">Confirmar contraseña *</label>
          <div style={{ position: 'relative' }}>
            <FieldIcon icon={Lock} />
            <input id="c-confirm" type={showPwd ? 'text' : 'password'} className="form-input"
              style={{ paddingLeft: '2.5rem', borderColor: pwdMatch ? 'var(--danger-text)' : undefined }}
              value={f.confirmar} onChange={set('confirmar')}
              placeholder="Repite la contraseña" autoComplete="new-password" />
          </div>
          {pwdMatch && <span className="form-error text-xs">Las contraseñas no coinciden</span>}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving} aria-busy={saving}>
            {saving ? <><div className="spinner" />&nbsp;Creando...</> : <><UserPlus size={15} /> Crear usuario</>}
          </button>
        </div>
      </form>
    </Modal>
  );
};

/* ─── Modal Editar Usuario ───────────────────────────────────────────────── */
const ModalEditar = ({ usuario, yoId, onClose, onSuccess }) => {
  const firstRef = useRef(null);
  const [f, setF] = useState({
    nombre:   usuario.nombre   ?? '',
    correo:   usuario.correo   ?? '',
    rol:      usuario.rol      ?? 'veterinario',
    password: '',
    confirmar: '',
  });
  const [showPwd, setShowPwd] = useState(false);
  const [err,     setErr]     = useState('');
  const [saving,  setSaving]  = useState(false);

  useEffect(() => { firstRef.current?.focus(); }, []);

  const set = (key) => (e) => setF(p => ({ ...p, [key]: e.target.value }));
  const esMiCuenta = usuario.usuario_id === yoId;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!f.nombre.trim()) { setErr('El nombre es obligatorio.'); return; }
    if (!f.correo.trim()) { setErr('El correo es obligatorio.'); return; }
    if (f.password && f.password.length < 8) { setErr('La nueva contraseña debe tener mínimo 8 caracteres.'); return; }
    if (f.password && !/\d/.test(f.password)) { setErr('La contraseña debe incluir al menos un número.'); return; }
    if (f.password && f.password !== f.confirmar) { setErr('Las contraseñas no coinciden.'); return; }

    setSaving(true);
    try {
      const datos = {
        nombre: f.nombre.trim(),
        correo: f.correo.trim().toLowerCase(),
        rol:    f.rol,
      };
      if (f.password) datos.password = f.password;

      await actualizarUsuario(usuario.usuario_id, datos);
      onSuccess(`Usuario "${f.nombre.trim()}" actualizado correctamente.`);
      onClose();
    } catch (ex) {
      setErr(ex.message || 'No se pudo actualizar el usuario.');
    } finally {
      setSaving(false);
    }
  };

  const pwdMatch = f.password && f.confirmar && f.password !== f.confirmar;

  return (
    <Modal title="Editar Usuario" subtitle={`Modificando: ${usuario.nombre}`} icon={Pencil} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        {err && (
          <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
            <AlertCircle size={15} className="alert-icon" />
            <span style={{ flex: 1 }}>{err}</span>
            <button type="button" onClick={() => setErr('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.7, display: 'flex' }}>
              <X size={14} aria-label="Cerrar" />
            </button>
          </div>
        )}

        {/* Nombre */}
        <div className="form-group">
          <label className="form-label" htmlFor="e-nombre">Nombre completo *</label>
          <div style={{ position: 'relative' }}>
            <FieldIcon icon={User} />
            <input ref={firstRef} id="e-nombre" className="form-input" style={{ paddingLeft: '2.5rem' }}
              value={f.nombre} onChange={set('nombre')} placeholder="Nombre Apellido" required />
          </div>
        </div>

        {/* Correo */}
        <div className="form-group">
          <label className="form-label" htmlFor="e-correo">Correo electrónico *</label>
          <div style={{ position: 'relative' }}>
            <FieldIcon icon={Mail} />
            <input id="e-correo" type="email" className="form-input" style={{ paddingLeft: '2.5rem' }}
              value={f.correo} onChange={set('correo')} placeholder="correo@vetcare.com" required />
          </div>
        </div>

        {/* Rol */}
        <div className="form-group">
          <label className="form-label" htmlFor="e-rol">Rol *</label>
          <div style={{ position: 'relative' }}>
            <FieldIcon icon={Shield} />
            <select id="e-rol" className="form-select" style={{ paddingLeft: '2.5rem' }}
              value={f.rol} onChange={set('rol')} disabled={esMiCuenta}>
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          {esMiCuenta && (
            <span style={{ fontSize: '0.8125rem', color: 'var(--warning-text)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <AlertCircle size={14} /> No puedes cambiar tu propio rol
            </span>
          )}
        </div>

        {/* Nueva contraseña (opcional) */}
        <div className="form-group">
          <label className="form-label" htmlFor="e-pwd">
            Nueva contraseña <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(dejar vacío para no cambiar)</span>
          </label>
          <div style={{ position: 'relative' }}>
            <FieldIcon icon={Lock} />
            <input id="e-pwd" type={showPwd ? 'text' : 'password'} className="form-input"
              style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }}
              value={f.password} onChange={set('password')}
              placeholder="Nueva contraseña (opcional)" autoComplete="new-password" />
            <button type="button" onClick={() => setShowPwd(v => !v)}
              aria-label={showPwd ? 'Ocultar' : 'Mostrar'}
              style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '0.25rem' }}>
              {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* Confirmar (sólo si escribió algo) */}
        {f.password && (
          <div className="form-group">
            <label className="form-label" htmlFor="e-confirm">Confirmar nueva contraseña *</label>
            <div style={{ position: 'relative' }}>
              <FieldIcon icon={Lock} />
              <input id="e-confirm" type={showPwd ? 'text' : 'password'} className="form-input"
                style={{ paddingLeft: '2.5rem', borderColor: pwdMatch ? 'var(--danger-text)' : undefined }}
                value={f.confirmar} onChange={set('confirmar')}
                placeholder="Repite la nueva contraseña" autoComplete="new-password" />
            </div>
            {pwdMatch && <span className="form-error text-xs">Las contraseñas no coinciden</span>}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving} aria-busy={saving}>
            {saving ? <><div className="spinner" />&nbsp;Guardando...</> : <><CheckCircle2 size={15} /> Actualizar</>}
          </button>
        </div>
      </form>
    </Modal>
  );
};

/* ─── Modal Confirmar Eliminación ────────────────────────────────────────── */
const ModalEliminar = ({ usuario, onClose, onSuccess, onError }) => {
  const [saving, setSaving] = useState(false);

  const handleEliminar = async () => {
    setSaving(true);
    try {
      await eliminarUsuario(usuario.usuario_id);
      onSuccess(`Usuario "${usuario.nombre}" eliminado.`);
      onClose();
    } catch (ex) {
      onError(ex.message || 'No se pudo eliminar el usuario.');
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div role="alertdialog" aria-modal="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
      }}>
      <div style={{
        background: 'var(--surface-1)', borderRadius: 'var(--radius-xl)',
        width: '100%', maxWidth: 420,
        boxShadow: '0 24px 60px -12px rgba(0,0,0,0.3)', overflow: 'hidden',
      }}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{
            width: '3.5rem', height: '3.5rem', borderRadius: '50%',
            background: 'var(--danger-bg)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem',
          }}>
            <Trash2 size={22} style={{ color: 'var(--danger-text)' }} aria-hidden="true" />
          </div>
          <h3 style={{ marginBottom: '0.5rem' }}>Eliminar usuario</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            ¿Eliminar la cuenta de <strong>{usuario.nombre}</strong>?
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Esta acción no se puede deshacer. El usuario perderá el acceso al sistema.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
            <button className="btn btn-primary" style={{ flex: 1, background: 'var(--danger-text)', borderColor: 'var(--danger-text)' }}
              onClick={handleEliminar} disabled={saving} aria-busy={saving}>
              {saving ? <><div className="spinner" />&nbsp;Eliminando...</> : 'Sí, eliminar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Componente principal ───────────────────────────────────────────────── */
export const Usuarios = () => {
  const { user: yo } = useAuth();

  const [usuarios,    setUsuarios]    = useState([]);
  const [busqueda,    setBusqueda]    = useState('');
  const [filtroRol,   setFiltroRol]   = useState('todos');
  const [loading,     setLoading]     = useState(true);
  const [globalErr,   setGlobalErr]   = useState('');
  const [globalOk,    setGlobalOk]    = useState('');

  const [showCrear,   setShowCrear]   = useState(false);
  const [editando,    setEditando]    = useState(null);   // objeto usuario
  const [eliminando,  setEliminando]  = useState(null);   // objeto usuario

  /* ── Cargar ── */
  const cargar = async () => {
    try {
      setLoading(true);
      const res = await getUsuarios();
      const lista = Array.isArray(res) ? res : (res?.data ?? []);
      setUsuarios(lista);
    } catch {
      setGlobalErr('No se pudo cargar la lista de usuarios. Verifica que el backend esté activo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  /* ── Feedback ── */
  const notifyOk  = (msg) => { setGlobalOk(msg);  cargar(); setTimeout(() => setGlobalOk(''), 6000); };
  const notifyErr = (msg) => { setGlobalErr(msg);           setTimeout(() => setGlobalErr(''), 8000); };

  /* ── Filtrado ── */
  const filtrados = usuarios.filter(u => {
    const q = busqueda.toLowerCase();
    const okTexto = !q || u.nombre?.toLowerCase().includes(q) || u.correo?.toLowerCase().includes(q);
    const okRol   = filtroRol === 'todos' || u.rol === filtroRol;
    return okTexto && okRol;
  });

  /* ─── Render ─────────────────────────────────────────────────────────── */
  return (
    <div>
      {/* Cabecera */}
      <div className="flex-between mb-8">
        <div>
          <h1 className="page-title">Control de Usuarios y Roles</h1>
          <p className="page-subtitle">Administra las cuentas y permisos de acceso al sistema</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCrear(true)} id="btn-nuevo-usuario">
          <UserPlus size={16} aria-hidden="true" /> Nuevo Usuario
        </button>
      </div>

      {/* Alertas globales */}
      {globalOk && (
        <div className="alert alert-success" role="status" style={{ marginBottom: '1.25rem' }}>
          <CheckCircle2 size={16} className="alert-icon" aria-hidden="true" />
          <span style={{ flex: 1 }}>{globalOk}</span>
          <button onClick={() => setGlobalOk('')} type="button"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.7, display: 'flex' }}>
            <X size={14} aria-label="Cerrar" />
          </button>
        </div>
      )}
      {globalErr && (
        <div className="alert alert-danger" role="alert" style={{ marginBottom: '1.25rem' }}>
          <AlertCircle size={16} className="alert-icon" aria-hidden="true" />
          <span style={{ flex: 1 }}>{globalErr}</span>
          <button onClick={() => setGlobalErr('')} type="button"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.7, display: 'flex' }}>
            <X size={14} aria-label="Cerrar" />
          </button>
        </div>
      )}

      {/* Tarjetas de estadísticas por rol */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        {ROLES.map(r => {
          const count = usuarios.filter(u => u.rol === r.value).length;
          const activo = filtroRol === r.value;
          return (
            <div key={r.value} className="stat-card"
              style={{ cursor: 'pointer', borderLeft: `4px solid ${r.color}`, outline: activo ? `2px solid ${r.color}` : 'none' }}
              onClick={() => setFiltroRol(activo ? 'todos' : r.value)}
              role="button" tabIndex={0} aria-pressed={activo}
              onKeyDown={e => e.key === 'Enter' && setFiltroRol(activo ? 'todos' : r.value)}
              title={`Filtrar por ${r.label}`}>
              <div className="stat-icon-wrap" style={{ background: r.bg, color: r.color }}>
                <Shield size={22} aria-hidden="true" />
              </div>
              <div className="stat-body">
                <div className="stat-label">{r.label}s</div>
                <div className="stat-value" style={{ color: r.color }}>{count}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Barra de filtros */}
      <div className="card mb-6">
        <div className="card-body" style={{ padding: '1rem 1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <Search size={15} aria-hidden="true" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input type="search" className="form-input" style={{ paddingLeft: '2.5rem' }}
                placeholder="Buscar por nombre o correo..."
                value={busqueda} onChange={e => setBusqueda(e.target.value)}
                aria-label="Buscar usuarios" />
            </div>
            <div style={{ position: 'relative', minWidth: '180px' }}>
              <Shield size={15} aria-hidden="true" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <select className="form-select" style={{ paddingLeft: '2.5rem' }}
                value={filtroRol} onChange={e => setFiltroRol(e.target.value)} aria-label="Filtrar por rol">
                <option value="todos">Todos los roles</option>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <span className="text-sm text-muted" style={{ whiteSpace: 'nowrap' }}>
              {filtrados.length} usuario{filtrados.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="card">
        <div className="card-header">
          <div className="flex gap-2" style={{ alignItems: 'center' }}>
            <Users size={18} style={{ color: 'var(--primary-600)' }} aria-hidden="true" />
            <h3 style={{ margin: 0 }}>Listado de Usuarios</h3>
          </div>
          <span className="badge badge-neutral">{filtrados.length} registros</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div className="loading-state">
              <div className="spinner spinner-dark" aria-hidden="true" />
              <span>Cargando usuarios...</span>
            </div>
          ) : filtrados.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Users size={24} aria-hidden="true" /></div>
              <h3>No se encontraron usuarios</h3>
              <p>{busqueda || filtroRol !== 'todos' ? 'Prueba con otro término de búsqueda.' : 'Crea el primer usuario pulsando "Nuevo Usuario".'}</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 36 }}>#</th>
                  <th>Usuario</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th style={{ width: 100 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((u, i) => (
                  <tr key={u.usuario_id}>
                    <td className="text-muted text-sm">{i + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Initials nombre={u.nombre} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                            {u.nombre}
                            {u.usuario_id === yo?.idUsuario && (
                              <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: 'var(--primary-600)', fontWeight: 500 }}>
                                (tú)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{u.correo}</span></td>
                    <td><RolBadge rol={u.rol} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => setEditando(u)}
                          title={`Editar ${u.nombre}`} aria-label={`Editar ${u.nombre}`}>
                          <Pencil size={13} aria-hidden="true" />
                        </button>
                        <button className="btn btn-sm btn-danger"
                          onClick={() => setEliminando(u)}
                          disabled={u.usuario_id === yo?.idUsuario}
                          style={{ opacity: u.usuario_id === yo?.idUsuario ? 0.4 : 1 }}
                          title={u.usuario_id === yo?.idUsuario ? 'No puedes eliminarte a ti mismo' : `Eliminar ${u.nombre}`}
                          aria-label={`Eliminar ${u.nombre}`}>
                          <Trash2 size={13} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Modales ── */}
      {showCrear  && <ModalCrear onClose={() => setShowCrear(false)} onSuccess={notifyOk} />}
      {editando   && <ModalEditar usuario={editando} yoId={yo?.idUsuario} onClose={() => setEditando(null)} onSuccess={notifyOk} />}
      {eliminando && <ModalEliminar usuario={eliminando} onClose={() => setEliminando(null)} onSuccess={notifyOk} onError={notifyErr} />}
    </div>
  );
};
