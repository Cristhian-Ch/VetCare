import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Dog, Plus, Search, Pencil, Trash2, X, CheckCircle2,
  AlertCircle, Filter, Cat, Bird, Rabbit, Turtle, PawPrint
} from 'lucide-react';
import {
  getMascotas, crearMascota, actualizarMascota, eliminarMascota
} from '../../api/mascotas';
import { getClientes } from '../../api/clientes';

/* ─────────────────────────── helpers ────────────────────────────────────── */
const normalize = (res) =>
  Array.isArray(res) ? res : (res?.data ?? []);

const ESPECIES = ['Perro', 'Gato', 'Ave', 'Conejo', 'Reptil', 'Otro'];

// Mapeo de especies a componentes de Lucide
const ESPECIE_ICON = { 
  Perro: Dog, 
  Gato: Cat, 
  Ave: Bird, 
  Conejo: Rabbit,
  Reptil: Turtle, 
  Otro: PawPrint,
};

const Alert = ({ type = 'danger', onClose, children }) => (
  <div className={`alert alert-${type}`} role={type === 'danger' ? 'alert' : 'status'}>
    {type === 'danger'  && <AlertCircle  size={16} className="alert-icon" aria-hidden="true" />}
    {type === 'success' && <CheckCircle2 size={16} className="alert-icon" aria-hidden="true" />}
    <span style={{ flex: 1 }}>{children}</span>
    {onClose && (
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.7, display: 'flex' }}>
        <X size={14} aria-label="Cerrar" />
      </button>
    )}
  </div>
);

/* ─────────────────────────── Modal ──────────────────────────────────────── */
const EMPTY_FORM = { clienteId: '', nombre: '', especie: '', raza: '', edad: '' };

const MascotaModal = ({ open, onClose, onSave, initial, clientes }) => {
  const [form, setForm]     = useState(EMPTY_FORM);
  const [error, setError]   = useState('');
  const [saving, setSaving] = useState(false);
  const firstRef            = useRef(null);

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
    if (!form.clienteId) return 'Selecciona el propietario de la mascota.';
    if (!form.nombre.trim()) return 'El nombre de la mascota es obligatorio.';
    if (!form.especie)       return 'Selecciona la especie.';
    if (form.edad && (isNaN(form.edad) || form.edad < 0)) return 'La edad debe ser un número válido.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setSaving(true);
    try {
      await onSave({ ...form, edad: form.edad ? Number(form.edad) : null });
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
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      aria-modal="true" role="dialog" aria-labelledby="m-title"
    >
      <div style={{ background: 'var(--surface-1)', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: 520, boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.3)', overflow: 'hidden' }}>
        {/* Header */}
        <div className="flex-between" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex gap-3" style={{ alignItems: 'center' }}>
            <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: 'var(--radius-md)', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Dog size={18} style={{ color: '#d97706' }} aria-hidden="true" />
            </div>
            <h3 id="m-title" style={{ margin: 0 }}>
              {initial ? 'Editar mascota' : 'Registrar mascota'}
            </h3>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon" aria-label="Cerrar"><X size={18} /></button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {error && <Alert type="danger" onClose={() => setError('')}>{error}</Alert>}

            <div className="form-group">
              <label className="form-label" htmlFor="m-cliente">Propietario *</label>
              <select
                ref={firstRef} id="m-cliente" name="clienteId"
                className="form-select"
                value={form.clienteId} onChange={handleChange}
              >
                <option value="">— Selecciona un cliente —</option>
                {clientes.map(c => (
                  <option key={c.cliente_id} value={c.cliente_id}>{c.nombre}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="m-nombre">Nombre de la mascota *</label>
                <input id="m-nombre" name="nombre" className="form-input" type="text" placeholder="Ej. Firulais" value={form.nombre} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="m-especie">Especie *</label>
                <select id="m-especie" name="especie" className="form-select" value={form.especie} onChange={handleChange}>
                  <option value="">— Selecciona —</option>
                  {ESPECIES.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="m-raza">Raza</label>
                <input id="m-raza" name="raza" className="form-input" type="text" placeholder="Ej. Labrador" value={form.raza} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="m-edad">Edad (años)</label>
                <input id="m-edad" name="edad" className="form-input" type="number" min="0" max="40" step="0.5" placeholder="3" value={form.edad} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex-between" style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', background: 'var(--surface-2)' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancelar</button>
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

/* ─────────────────────────── Página principal ────────────────────────────── */
export const Mascotas = () => {
  const [mascotas,   setMascotas]   = useState([]);
  const [clientes,   setClientes]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [searchQ,    setSearchQ]    = useState('');
  const [filterEsp,  setFilterEsp]  = useState('');
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async (especie = '') => {
    try {
      setLoading(true);
      const [mascRes, clRes] = await Promise.all([
        getMascotas(especie), getClientes(),
      ]);
      setMascotas(normalize(mascRes));
      setClientes(normalize(clRes));
    } catch {
      setError('Error al cargar los datos. Verifica la conexión.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(filterEsp); }, [filterEsp, load]);

  const showSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 5000); };

  const clienteNombre = (id) =>
    clientes.find(c => String(c.cliente_id) === String(id))?.nombre ?? '—';

  const handleSave = async (form) => {
    if (editTarget) {
      await actualizarMascota(editTarget.mascota_id, form);
      showSuccess('Mascota actualizada.');
    } else {
      await crearMascota(form);
      showSuccess('Mascota registrada.');
    }
    load(filterEsp);
  };

  const handleDelete = async (m) => {
    if (!window.confirm(`¿Eliminar a "${m.nombre}"? Esta acción es irreversible.`)) return;
    try {
      setDeletingId(m.mascota_id);
      await eliminarMascota(m.mascota_id);
      showSuccess('Mascota eliminada.');
      load(filterEsp);
    } catch (ex) {
      setError(ex.message || 'No se pudo eliminar.');
    } finally {
      setDeletingId(null);
    }
  };

  const openCreate = () => { setEditTarget(null); setModalOpen(true); };
  const openEdit   = (m) => {
    setEditTarget(m);
    setModalOpen(true);
  };

  // Filtro local por nombre sobre lo que ya trajo el backend
  const filtered = mascotas.filter(m =>
    !searchQ || m.nombre?.toLowerCase().includes(searchQ.toLowerCase())
  );

  return (
    <>
      <MascotaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        clientes={clientes}
        initial={editTarget ? {
          clienteId: String(editTarget.cliente_id ?? ''),
          nombre:    editTarget.nombre    ?? '',
          especie:   editTarget.especie   ?? '',
          raza:      editTarget.raza      ?? '',
          edad:      editTarget.edad      ?? '',
        } : null}
      />

      {/* Cabecera */}
      <div className="flex-between mb-8">
        <div>
          <h1 className="page-title">Mascotas</h1>
          <p className="page-subtitle">Gestión del historial de pacientes registrados</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} aria-hidden="true" /> Nueva Mascota
        </button>
      </div>

      {/* Alertas */}
      {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}
      {error   && <Alert type="danger"  onClose={() => setError('')}>{error}</Alert>}

      {/* Barra de filtros */}
      <div className="card mb-6">
        <div className="card-body" style={{ padding: '1rem 1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Búsqueda por nombre */}
          <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
            <Search size={16} aria-hidden="true" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              type="search" className="form-input" style={{ paddingLeft: '2.5rem' }}
              placeholder="Buscar por nombre de mascota..."
              value={searchQ} onChange={(e) => setSearchQ(e.target.value)}
              aria-label="Buscar mascota"
            />
          </div>
          {/* Filtro especie */}
          <div className="flex gap-2" style={{ alignItems: 'center' }}>
            <Filter size={14} style={{ color: 'var(--text-muted)' }} aria-hidden="true" />
            <select
              className="form-select" style={{ minWidth: 160 }}
              value={filterEsp} onChange={(e) => setFilterEsp(e.target.value)}
              aria-label="Filtrar por especie"
            >
              <option value="">Todas las especies</option>
              {ESPECIES.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="card">
        <div className="card-header">
          <div className="flex gap-2" style={{ alignItems: 'center' }}>
            <Dog size={18} style={{ color: '#d97706' }} aria-hidden="true" />
            <h3 style={{ margin: 0 }}>Listado de Mascotas</h3>
          </div>
          {!loading && (
            <span className="badge badge-neutral">{filtered.length} registros</span>
          )}
        </div>

        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div className="loading-state">
              <div className="spinner spinner-dark" aria-label="Cargando..." />
              <p className="text-sm">Cargando mascotas...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Dog size={24} aria-hidden="true" /></div>
              <p className="font-semibold text-secondary">
                {searchQ || filterEsp ? 'Sin resultados para los filtros aplicados' : 'Aún no hay mascotas registradas'}
              </p>
              <p className="text-sm text-muted">
                {searchQ || filterEsp
                  ? 'Prueba con otros criterios de búsqueda o limpia los filtros.'
                  : 'Registra la primera mascota usando el botón "Nueva Mascota".'}
              </p>
              {!searchQ && !filterEsp && (
                <button className="btn btn-primary btn-sm" style={{ marginTop: '0.5rem' }} onClick={openCreate}>
                  Registrar mascota
                </button>
              )}
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Mascota</th>
                  <th>Especie / Raza</th>
                  <th>Edad</th>
                  <th>Propietario</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => (
                  <tr key={m.mascota_id}>
                    <td className="text-muted text-xs">{i + 1}</td>
                    <td>
                      <div className="flex gap-2" style={{ alignItems: 'center' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                          {ESPECIE_ICON[m.especie] ? React.createElement(ESPECIE_ICON[m.especie], { size: 40 }) : <PawPrint size={40} />}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{m.nombre}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm font-semibold">{m.especie}</div>
                      <div className="text-xs text-muted">{m.raza || 'Sin especificar'}</div>
                    </td>
                    <td>
                      <span className="text-sm">
                        {m.edad != null ? `${m.edad} año${m.edad !== 1 ? 's' : ''}` : '—'}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm">{clienteNombre(m.cliente_id)}</span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-icon btn-secondary btn-sm"
                          title="Editar mascota" aria-label={`Editar a ${m.nombre}`}
                          onClick={() => openEdit(m)}
                        >
                          <Pencil size={14} aria-hidden="true" />
                        </button>
                        <button
                          className="btn btn-icon btn-danger btn-sm"
                          title="Eliminar mascota" aria-label={`Eliminar a ${m.nombre}`}
                          onClick={() => handleDelete(m)}
                          disabled={deletingId === m.mascota_id}
                        >
                          {deletingId === m.mascota_id
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
