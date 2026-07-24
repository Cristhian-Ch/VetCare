import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Users, Plus, Search, Pencil, Trash2, X, CheckCircle2,
  AlertCircle, Phone, Mail, MapPin, UserCircle2
} from 'lucide-react';
import {
  getClientes, crearCliente, actualizarCliente, eliminarCliente
} from '../../api/clientes';

/* ─────────────────────────── helpers ────────────────────────────────────── */

const normalize = (res) =>
  Array.isArray(res) ? res : (res?.data ?? []);

const Alert = ({ type = 'danger', onClose, children }) => (
  <div className={`alert alert-${type}`} role={type === 'danger' ? 'alert' : 'status'}>
    {type === 'danger'  && <AlertCircle  size={16} className="alert-icon" aria-hidden="true" />}
    {type === 'success' && <CheckCircle2 size={16} className="alert-icon" aria-hidden="true" />}
    <span style={{ flex: 1 }}>{children}</span>
    {onClose && (
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.7, display: 'flex', alignItems: 'center' }}>
        <X size={14} aria-label="Cerrar" />
      </button>
    )}
  </div>
);

/* ─────────────────────────── Modal ──────────────────────────────────────── */

const EMPTY_FORM = { nombre: '', telefono: '', correo: '', direccion: '' };

const ClienteModal = ({ open, onClose, onSave, initial }) => {
  const [form, setForm]       = useState(EMPTY_FORM);
  const [error, setError]     = useState('');
  const [saving, setSaving]   = useState(false);
  const firstRef              = useRef(null);

  useEffect(() => {
    if (open) {
      setForm(initial ?? EMPTY_FORM);
      setError('');
      setTimeout(() => firstRef.current?.focus(), 50);
    }
  }, [open, initial]);

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.nombre.trim())   return 'El nombre es obligatorio.';
    if (!form.telefono.trim()) return 'El teléfono es obligatorio.';
    if (!form.correo.trim())   return 'El correo es obligatorio.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) return 'El correo no tiene un formato válido.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (ex) {
      setError(ex.message || 'No se pudo guardar. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      aria-modal="true" role="dialog"
      aria-labelledby="modal-title"
    >
      <div style={{
        background: 'var(--surface-1)', borderRadius: 'var(--radius-xl)',
        width: '100%', maxWidth: 500,
        boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.3)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div className="flex-between" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex gap-3" style={{ alignItems: 'center' }}>
            <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: 'var(--radius-md)', background: 'var(--info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserCircle2 size={18} style={{ color: 'var(--info-text)' }} aria-hidden="true" />
            </div>
            <h3 id="modal-title" style={{ margin: 0 }}>
              {initial ? 'Editar cliente' : 'Nuevo cliente'}
            </h3>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon" aria-label="Cerrar modal">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {error && <Alert type="danger" onClose={() => setError('')}>{error}</Alert>}

            <div className="form-group">
              <label className="form-label" htmlFor="c-nombre">Nombre completo *</label>
              <input
                ref={firstRef} id="c-nombre" name="nombre"
                className="form-input" type="text"
                placeholder="Ej. María García López"
                value={form.nombre} onChange={handleChange} required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="c-tel">Teléfono *</label>
                <input
                  id="c-tel" name="telefono"
                  className="form-input" type="tel"
                  placeholder="987 654 321"
                  value={form.telefono} onChange={handleChange} required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="c-mail">Correo *</label>
                <input
                  id="c-mail" name="correo"
                  className="form-input" type="email"
                  placeholder="ejemplo@mail.com"
                  value={form.correo} onChange={handleChange} required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="c-dir">Dirección</label>
              <input
                id="c-dir" name="direccion"
                className="form-input" type="text"
                placeholder="Av. Principal 123, Lima"
                value={form.direccion} onChange={handleChange}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex-between" style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', background: 'var(--surface-2)' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving} aria-busy={saving}>
              {saving
                ? <><div className="spinner" aria-hidden="true" /> Guardando...</>
                : <><CheckCircle2 size={15} aria-hidden="true" /> {initial ? 'Actualizar' : 'Registrar'}</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─────────────────────────── página principal ────────────────────────────── */

export const Clientes = () => {
  const [clientes,    setClientes]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [debouncedQ,  setDebouncedQ]  = useState('');
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState('');
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editTarget,  setEditTarget]  = useState(null); // null = crear
  const [deletingId,  setDeletingId]  = useState(null);

  /* Debounce del buscador (300ms) */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  /* Cargar clientes */
  const load = useCallback(async (q = '') => {
    try {
      setLoading(true);
      const res = await getClientes(q);
      setClientes(normalize(res));
    } catch {
      setError('No se pudieron cargar los clientes. Verifica la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(debouncedQ); }, [debouncedQ, load]);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 5000);
  };

  /* Guardar (crear o editar) */
  const handleSave = async (form) => {
    if (editTarget) {
      await actualizarCliente(editTarget.cliente_id, form);
      showSuccess('Cliente actualizado correctamente.');
    } else {
      await crearCliente(form);
      showSuccess('Cliente registrado correctamente.');
    }
    load(debouncedQ);
  };

  /* Eliminar */
  const handleDelete = async (cliente) => {
    if (!window.confirm(`¿Eliminar al cliente "${cliente.nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      setDeletingId(cliente.cliente_id);
      await eliminarCliente(cliente.cliente_id);
      showSuccess('Cliente eliminado.');
      load(debouncedQ);
    } catch (ex) {
      setError(ex.message || 'No se pudo eliminar el cliente.');
    } finally {
      setDeletingId(null);
    }
  };

  const openCreate = () => { setEditTarget(null); setModalOpen(true); };
  const openEdit   = (c)  => { setEditTarget(c);    setModalOpen(true); };

  return (
    <>
      <ClienteModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={editTarget ? {
          nombre:    editTarget.nombre,
          telefono:  editTarget.telefono,
          correo:    editTarget.correo,
          direccion: editTarget.direccion ?? '',
        } : null}
      />

      {/* Cabecera */}
      <div className="flex-between mb-8">
        <div>
          <h1 className="page-title">Clientes</h1>
          <p className="page-subtitle">Registro y gestión de propietarios de mascotas</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} aria-hidden="true" /> Nuevo Cliente
        </button>
      </div>

      {/* Alertas */}
      {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}
      {error   && <Alert type="danger"  onClose={() => setError('')}>{error}</Alert>}

      {/* Buscador */}
      <div className="card mb-6">
        <div className="card-body" style={{ padding: '1rem 1.5rem' }}>
          <div style={{ position: 'relative', maxWidth: 400 }}>
            <Search size={16} aria-hidden="true" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              type="search"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Buscar por nombre o correo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Buscar cliente"
            />
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="card">
        <div className="card-header">
          <div className="flex gap-2" style={{ alignItems: 'center' }}>
            <Users size={18} style={{ color: 'var(--primary-600)' }} aria-hidden="true" />
            <h3 style={{ margin: 0 }}>Listado de Clientes</h3>
          </div>
          {!loading && (
            <span className="badge badge-neutral">{clientes.length} registros</span>
          )}
        </div>

        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div className="loading-state">
              <div className="spinner spinner-dark" aria-label="Cargando..." />
              <p className="text-sm">Cargando clientes...</p>
            </div>
          ) : clientes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Users size={24} aria-hidden="true" />
              </div>
              <p className="font-semibold text-secondary">
                {debouncedQ ? `Sin resultados para "${debouncedQ}"` : 'Aún no hay clientes registrados'}
              </p>
              <p className="text-sm text-muted">
                {debouncedQ ? 'Intenta con otro término de búsqueda.' : 'Agrega el primer cliente con el botón "Nuevo Cliente".'}
              </p>
              {!debouncedQ && (
                <button className="btn btn-primary btn-sm" style={{ marginTop: '0.5rem' }} onClick={openCreate}>
                  Registrar cliente
                </button>
              )}
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Teléfono</th>
                  <th>Correo</th>
                  <th>Dirección</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((c, i) => (
                  <tr key={c.cliente_id}>
                    <td className="text-muted text-xs">{i + 1}</td>
                    <td>
                      <div className="flex gap-2" style={{ alignItems: 'center' }}>
                        <div style={{
                          width: '2rem', height: '2rem', borderRadius: '50%',
                          background: 'var(--info-bg)', color: 'var(--info-text)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: '0.75rem', flexShrink: 0,
                        }}>
                          {c.nombre?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-sm">{c.nombre}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-2 text-sm" style={{ alignItems: 'center', color: 'var(--text-secondary)' }}>
                        <Phone size={13} aria-hidden="true" />
                        {c.telefono || '—'}
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-2 text-sm" style={{ alignItems: 'center', color: 'var(--text-secondary)' }}>
                        <Mail size={13} aria-hidden="true" />
                        {c.correo || '—'}
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-2 text-sm" style={{ alignItems: 'center', color: 'var(--text-secondary)' }}>
                        <MapPin size={13} aria-hidden="true" />
                        <span style={{ maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.direccion || '—'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-icon btn-secondary btn-sm"
                          title="Editar cliente"
                          aria-label={`Editar a ${c.nombre}`}
                          onClick={() => openEdit(c)}
                        >
                          <Pencil size={14} aria-hidden="true" />
                        </button>
                        <button
                          className="btn btn-icon btn-danger btn-sm"
                          title="Eliminar cliente"
                          aria-label={`Eliminar a ${c.nombre}`}
                          onClick={() => handleDelete(c)}
                          disabled={deletingId === c.cliente_id}
                        >
                          {deletingId === c.cliente_id
                            ? <div className="spinner" style={{ width: '0.875rem', height: '0.875rem', borderTopColor: '#dc2626', borderColor: 'rgba(220,38,38,0.2)' }} aria-hidden="true" />
                            : <Trash2 size={14} aria-hidden="true" />
                          }
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
    </>
  );
};
