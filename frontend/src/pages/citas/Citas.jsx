import React, { useState, useEffect } from 'react';
import {
  Calendar, CreditCard, CheckCircle2, ChevronRight, ChevronLeft,
  Users, Dog, FileText, X, AlertCircle, Plus, Trash2
} from 'lucide-react';
import { getCitas, crearCita, cancelarCita } from '../../api/citas';
import { getClientes } from '../../api/clientes';
import { getMascotas } from '../../api/mascotas';
import { registrarPago } from '../../api/pagos';

/* ─── Sub-componentes pequeños ─────────────────────────────────────────────── */

const Alert = ({ type = 'danger', children, onClose }) => (
  <div className={`alert alert-${type}`} role={type === 'danger' ? 'alert' : 'status'}>
    {type === 'danger'  && <AlertCircle  size={16} className="alert-icon" aria-hidden="true" />}
    {type === 'success' && <CheckCircle2 size={16} className="alert-icon" aria-hidden="true" />}
    <span style={{ flex: 1 }}>{children}</span>
    {onClose && (
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'inherit', opacity: 0.7 }}>
        <X size={14} aria-label="Cerrar" />
      </button>
    )}
  </div>
);

const Stepper = ({ current, steps }) => (
  <div className="stepper" role="progressbar" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={current}>
    {steps.map((label, i) => {
      const n = i + 1;
      const isDone   = current > n;
      const isActive = current === n;
      return (
        <div key={label} className={`step-item${isDone ? ' completed' : isActive ? ' active' : ''}`}>
          <div className="step-bubble">
            {isDone ? <CheckCircle2 size={14} aria-hidden="true" /> : n}
          </div>
          <span className="step-label">{label}</span>
        </div>
      );
    })}
  </div>
);

/* ─── Página principal ─────────────────────────────────────────────────────── */

const MOTIVOS_COMUNES = [
  'Vacunación anual',
  'Control de rutina',
  'Consulta por enfermedad',
  'Cirugía / procedimiento',
  'Desparasitación',
  'Otro motivo',
];

export const Citas = () => {
  /* Estado de datos */
  const [citas,              setCitas]              = useState([]);
  const [clientes,           setClientes]           = useState([]);
  const [mascotas,           setMascotas]           = useState([]);       // todas (para tabla)
  const [mascotasCliente,    setMascotasCliente]    = useState([]);       // filtradas por cliente
  const [loadingMascotas,    setLoadingMascotas]    = useState(false);    // carga al seleccionar cliente

  /* Estado de UI */
  const [loadingData, setLoadingData] = useState(true);
  const [showForm,    setShowForm]    = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting,  setSubmitting]  = useState(false);
  const [deletingId,  setDeletingId]  = useState(null);

  /* Mensajes */
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  /* Datos del formulario */
  const initialForm = {
    clienteId: '', mascotaId: '',
    fecha: '', hora: '', motivo: '', motivoPersonalizado: '',
    monto: 50, metodoPago: 'Efectivo',
  };
  const [form, setForm] = useState(initialForm);

  /* ── Helpers ──────────────────────────────────────────────────────────────── */

  const showError   = (msg) => { setError(msg);   setSuccess(''); };
  const showSuccess = (msg) => { setSuccess(msg); setError('');   setTimeout(() => setSuccess(''), 6000); };

  const resetForm = () => {
    setForm(initialForm);
    setCurrentStep(1);
    setShowForm(false);
    setError('');
  };

  /* ── Carga de datos ───────────────────────────────────────────────────────── */

  const fetchData = async () => {
    try {
      setLoadingData(true);
      const [citasRes, clientesRes, mascotasRes] = await Promise.all([
        getCitas(), getClientes(), getMascotas(),
      ]);
      // Normalización defensiva: aceptar array directo o { data: [] }
      setCitas(   Array.isArray(citasRes)    ? citasRes    : (citasRes?.data    ?? []));
      setClientes(Array.isArray(clientesRes) ? clientesRes : (clientesRes?.data ?? []));
      setMascotas(Array.isArray(mascotasRes) ? mascotasRes : (mascotasRes?.data ?? []));
    } catch {
      showError('Error al cargar los datos del servidor. Verifica que el backend esté activo.');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  /* ── Mascotas filtradas por cliente (carga on-demand) ───────────────────── */
  // En lugar de filtrar del array global (problemas de tipo con UUIDs de MySQL),
  // consultamos directamente la API y usamos el cliente_id exacto retornado por la BD
  const cargarMascotasPorCliente = async (clienteId) => {
    if (!clienteId) { setMascotasCliente([]); return; }
    try {
      setLoadingMascotas(true);
      const res = await getMascotas();
      const todas = Array.isArray(res) ? res : (res?.data ?? []);
      // Trim ambos valores para limpiar espacios/encoding invisibles
      const filtradas = todas.filter(
        m => (m.cliente_id ?? '').toString().trim() === clienteId.toString().trim()
      );
      setMascotasCliente(filtradas);
    } catch {
      setMascotasCliente([]);
    } finally {
      setLoadingMascotas(false);
    }
  };

  /* ── Handlers de formulario ──────────────────────────────────────────────── */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'clienteId') {
        next.mascotaId = '';            // limpiar mascota al cambiar cliente
        cargarMascotasPorCliente(value); // cargar mascotas del nuevo cliente
      }
      return next;
    });
    setError('');
  };

  /* Validaciones por paso */
  const validateStep = (step) => {
    if (step === 1) {
      if (!form.clienteId)  return 'Selecciona un cliente.';
      if (!form.mascotaId)  return 'Selecciona una mascota del cliente elegido.';
    }
    if (step === 2) {
      if (!form.fecha)      return 'Indica la fecha de la cita.';
      if (!form.hora)       return 'Indica la hora de la cita.';
      const motivoFinal = form.motivo === 'Otro motivo' ? form.motivoPersonalizado : form.motivo;
      if (!motivoFinal.trim()) return 'Escribe el motivo de la consulta.';
    }
    return null;
  };

  const goNext = () => {
    const err = validateStep(currentStep);
    if (err) { showError(err); return; }
    setError('');
    setCurrentStep(s => s + 1);
  };

  const goPrev = () => {
    setError('');
    setCurrentStep(s => s - 1);
  };

  /* ── Enviar formulario (crear cita + pago) ───────────────────────────────── */

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError('');

      const motivoFinal = form.motivo === 'Otro motivo'
        ? form.motivoPersonalizado.trim()
        : form.motivo;

      // 1 – Crear cita
      const nuevaCita = await crearCita({
        clienteId: form.clienteId,
        mascotaId: form.mascotaId,
        fecha:     form.fecha,
        hora:      form.hora,
        motivo:    motivoFinal,
      });

      // El backend devuelve { citaId, estado, ... }
      const idCita = nuevaCita?.citaId ?? nuevaCita?.data?.citaId;

      // 2 – Registrar pago
      await registrarPago({
        citaId:     idCita,
        monto:      Number(form.monto),
        metodoPago: form.metodoPago,
      });

      resetForm();
      await fetchData();
      showSuccess('¡Cita y pago registrados correctamente!');
    } catch (err) {
      showError(err.message || 'Ocurrió un error al procesar la solicitud. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Cancelar cita ───────────────────────────────────────────────────────── */

  const handleCancelar = async (citaId) => {
    if (!window.confirm('¿Estás seguro de cancelar esta cita?')) return;
    try {
      setDeletingId(citaId);
      await cancelarCita(citaId);
      await fetchData();
      showSuccess('Cita cancelada.');
    } catch (err) {
      showError(err.message || 'No se pudo cancelar la cita.');
    } finally {
      setDeletingId(null);
    }
  };

  /* ── Helpers de presentación ─────────────────────────────────────────────── */

  const formatDate = (raw) => {
    if (!raw) return '—';
    const d = new Date(raw);
    // Ajustar zona horaria: MySQL devuelve la fecha sin hora, puede desplazarse
    const local = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
    return local.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatHour = (raw) => {
    if (!raw) return '—';
    // raw puede venir "HH:MM:SS" o "HH:MM"
    const parts = String(raw).split(':');
    if (parts.length < 2) return raw;
    const h = parseInt(parts[0], 10);
    const m = parts[1];
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${m} ${ampm}`;
  };

  const getBadgeClass = (estado) => {
    if (!estado) return 'badge-neutral';
    switch (estado.toLowerCase()) {
      case 'creada':    return 'badge-info';
      case 'completada': return 'badge-success';
      case 'cancelada': return 'badge-danger';
      default:          return 'badge-neutral';
    }
  };

  const clienteName  = (id) => clientes.find(c => String(c.cliente_id).trim() === String(id).trim())?.nombre ?? id;
  // Para la tabla: busca en todas las mascotas cargadas
  const mascotaName  = (id) => mascotas.find(m => String(m.mascota_id).trim() === String(id).trim())?.nombre ?? id;
  // Para el formulario (paso 3): busca en las mascotas del cliente seleccionado
  const mascotaNameForm = (id) => mascotasCliente.find(m => String(m.mascota_id).trim() === String(id).trim())?.nombre ?? id;


  /* ── Render ──────────────────────────────────────────────────────────────── */

  return (
    <div>
      {/* ── Cabecera de página ──────────────────────────────────────────────── */}
      <div className="flex-between mb-8">
        <div>
          <h1 className="page-title">Gestión de Citas</h1>
          <p className="page-subtitle">Agenda, visualiza y gestiona las consultas de la clínica</p>
        </div>
        <button
          className={`btn ${showForm ? 'btn-secondary' : 'btn-primary'}`}
          onClick={() => { if (showForm) { resetForm(); } else { setShowForm(true); setError(''); } }}
          aria-expanded={showForm}
          aria-controls="nueva-cita-form"
        >
          {showForm
            ? <><X size={16} aria-hidden="true" /> Cancelar</>
            : <><Plus size={16} aria-hidden="true" /> Nueva Cita</>
          }
        </button>
      </div>

      {/* ── Alertas globales ────────────────────────────────────────────────── */}
      {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}
      {error && !showForm && <Alert type="danger" onClose={() => setError('')}>{error}</Alert>}

      {/* ── Formulario Stepper ──────────────────────────────────────────────── */}
      {showForm && (
        <div id="nueva-cita-form" className="card mb-6">
          <div className="card-header">
            <div className="flex gap-2" style={{ alignItems: 'center' }}>
              <Calendar size={18} style={{ color: 'var(--primary-600)' }} aria-hidden="true" />
              <h3 style={{ margin: 0 }}>Nueva Cita</h3>
            </div>
            <span className="badge badge-info">Paso {currentStep} de 3</span>
          </div>

          <div className="card-body">
            <Stepper current={currentStep} steps={['Paciente', 'Detalle', 'Pago']} />

            {/* Alerta de error dentro del formulario */}
            {error && (
              <Alert type="danger" onClose={() => setError('')} style={{ marginBottom: '1.25rem' }}>
                {error}
              </Alert>
            )}

            <div style={{ maxWidth: 560, margin: '0 auto' }}>
              {/* ── Paso 1: Paciente ─────────────────────────────────────────── */}
              {currentStep === 1 && (
                <div>
                  <div className="flex gap-2 mb-4" style={{ alignItems: 'center', color: 'var(--text-secondary)' }}>
                    <Users size={16} aria-hidden="true" />
                    <span className="text-sm">Selecciona el propietario y su mascota</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="clienteId">Cliente (Dueño)</label>
                    <select
                      id="clienteId" name="clienteId"
                      className="form-select"
                      value={form.clienteId}
                      onChange={handleChange}
                    >
                      <option value="">— Selecciona un cliente —</option>
                      {clientes.map(c => (
                        <option key={c.cliente_id} value={c.cliente_id}>{c.nombre}</option>
                      ))}
                    </select>
                    {clientes.length === 0 && !loadingData && (
                      <span className="form-error">No hay clientes registrados. <a href="/dashboard/clientes">Agregar cliente</a></span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="mascotaId">Mascota</label>
                    <select
                      id="mascotaId" name="mascotaId"
                      className="form-select"
                      value={form.mascotaId}
                      onChange={handleChange}
                      disabled={!form.clienteId || loadingMascotas}
                      aria-disabled={!form.clienteId || loadingMascotas}
                      aria-busy={loadingMascotas}
                    >
                      <option value="">
                        {!form.clienteId
                          ? '— Primero selecciona un cliente —'
                          : loadingMascotas
                            ? 'Cargando mascotas...'
                            : mascotasCliente.length === 0
                              ? 'Sin mascotas registradas'
                              : '— Selecciona una mascota —'
                        }
                      </option>
                      {mascotasCliente.map(m => (
                        <option key={m.mascota_id} value={m.mascota_id}>
                          {m.nombre} · {m.especie}
                        </option>
                      ))}
                    </select>
                    {form.clienteId && !loadingMascotas && mascotasCliente.length === 0 && (
                      <span className="form-error text-xs">
                        Este cliente no tiene mascotas registradas.{' '}
                        <a href="/dashboard/mascotas">Registrar mascota</a>
                      </span>
                    )}
                  </div>

                  <div className="flex" style={{ justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                    <button className="btn btn-primary" onClick={goNext}>
                      Siguiente <ChevronRight size={16} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}

              {/* ── Paso 2: Detalle ──────────────────────────────────────────── */}
              {currentStep === 2 && (
                <div>
                  <div className="flex gap-2 mb-4" style={{ alignItems: 'center', color: 'var(--text-secondary)' }}>
                    <Calendar size={16} aria-hidden="true" />
                    <span className="text-sm">Indica cuándo y por qué traen a la mascota</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="fecha">Fecha de la cita</label>
                      <input
                        id="fecha" name="fecha" type="date"
                        className="form-input"
                        value={form.fecha}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="hora">Hora</label>
                      <input
                        id="hora" name="hora" type="time"
                        className="form-input"
                        value={form.hora}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="motivo">Motivo de consulta</label>
                    <select id="motivo" name="motivo" className="form-select" value={form.motivo} onChange={handleChange}>
                      <option value="">— Selecciona un motivo —</option>
                      {MOTIVOS_COMUNES.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>

                  {form.motivo === 'Otro motivo' && (
                    <div className="form-group">
                      <label className="form-label" htmlFor="motivoPersonalizado">Describe el motivo</label>
                      <textarea
                        id="motivoPersonalizado" name="motivoPersonalizado"
                        className="form-textarea"
                        placeholder="Ej. El perro presenta fiebre desde ayer"
                        value={form.motivoPersonalizado}
                        onChange={handleChange}
                      />
                    </div>
                  )}

                  <div className="flex-between" style={{ marginTop: '1.5rem' }}>
                    <button className="btn btn-secondary" onClick={goPrev}>
                      <ChevronLeft size={16} aria-hidden="true" /> Atrás
                    </button>
                    <button className="btn btn-primary" onClick={goNext}>
                      Siguiente <ChevronRight size={16} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}

              {/* ── Paso 3: Pago ─────────────────────────────────────────────── */}
              {currentStep === 3 && (
                <div>
                  <div className="flex gap-2 mb-4" style={{ alignItems: 'center', color: 'var(--text-secondary)' }}>
                    <CreditCard size={16} aria-hidden="true" />
                    <span className="text-sm">Revisa y confirma el pago de la consulta</span>
                  </div>

                  {/* Resumen de la cita */}
                  <div style={{
                    background: 'var(--primary-50)', border: '1px solid var(--primary-100)',
                    borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '1.5rem',
                  }}>
                    <div className="text-xs font-semibold text-muted" style={{ marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Resumen de la cita
                    </div>
                    {[
                      ['Cliente',  clienteName(form.clienteId)],
                      ['Mascota',  mascotaNameForm(form.mascotaId)],
                      ['Fecha',    form.fecha ? formatDate(form.fecha) : '—'],
                      ['Hora',     form.hora  ? formatHour(form.hora)  : '—'],
                      ['Motivo',   form.motivo === 'Otro motivo' ? form.motivoPersonalizado : form.motivo],
                    ].map(([k, v]) => (
                      <div key={k} className="flex-between text-sm" style={{ marginBottom: '0.375rem' }}>
                        <span className="text-secondary">{k}</span>
                        <span className="font-semibold" style={{ textAlign: 'right', maxWidth: '60%' }}>{v}</span>
                      </div>
                    ))}
                    <hr style={{ border: 'none', borderTop: '1px dashed var(--border-color)', margin: '0.875rem 0' }} />
                    <div className="flex-between" style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                      <span>Total a pagar</span>
                      <span style={{ color: 'var(--primary-600)' }}>S/ {Number(form.monto).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Monto y método de pago */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="monto">Monto (S/)</label>
                      <input
                        id="monto" name="monto" type="number"
                        className="form-input"
                        min="1" step="0.01"
                        value={form.monto}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="metodoPago">Método de pago</label>
                      <select id="metodoPago" name="metodoPago" className="form-select" value={form.metodoPago} onChange={handleChange}>
                        <option value="Efectivo">Efectivo</option>
                        <option value="Tarjeta">Tarjeta</option>
                        <option value="Transferencia">Transferencia</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex-between" style={{ marginTop: '1.5rem' }}>
                    <button className="btn btn-secondary" onClick={goPrev} disabled={submitting}>
                      <ChevronLeft size={16} aria-hidden="true" /> Atrás
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={handleSubmit}
                      disabled={submitting}
                      aria-busy={submitting}
                    >
                      {submitting
                        ? <><div className="spinner" aria-hidden="true" /> Procesando...</>
                        : <><CheckCircle2 size={16} aria-hidden="true" /> Confirmar y Pagar</>
                      }
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Lista de Citas ──────────────────────────────────────────────────── */}
      <div className="card">
        <div className="card-header">
          <div className="flex gap-2" style={{ alignItems: 'center' }}>
            <FileText size={18} style={{ color: 'var(--primary-600)' }} aria-hidden="true" />
            <h3 style={{ margin: 0 }}>Historial de Citas</h3>
          </div>
          {!loadingData && (
            <span className="badge badge-neutral">{citas.length} registros</span>
          )}
        </div>

        <div style={{ overflowX: 'auto' }}>
          {loadingData ? (
            <div className="loading-state">
              <div className="spinner spinner-dark" aria-label="Cargando..." />
              <p className="text-sm">Cargando citas...</p>
            </div>
          ) : citas.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Calendar size={24} aria-hidden="true" />
              </div>
              <p className="font-semibold text-secondary">No hay citas registradas</p>
              <p className="text-sm text-muted">Agrega la primera cita usando el botón "Nueva Cita"</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cliente</th>
                  <th>Mascota</th>
                  <th>Fecha y Hora</th>
                  <th>Motivo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {citas.map((cita, idx) => (
                  <tr key={cita.cita_id}>
                    <td className="text-muted text-xs">{idx + 1}</td>
                    <td>
                      <span className="font-semibold text-sm">
                        {clienteName(cita.cliente_id)}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm">
                        {mascotaName(cita.mascota_id)}
                      </span>
                    </td>
                    <td>
                      <div className="font-semibold text-sm">{formatDate(cita.fecha)}</div>
                      <div className="text-xs text-muted">{formatHour(cita.hora)}</div>
                    </td>
                    <td>
                      <span className="text-sm" style={{ maxWidth: 200, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {cita.motivo}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getBadgeClass(cita.estado)}`}>
                        {cita.estado || 'creada'}
                      </span>
                    </td>
                    <td>
                      {cita.estado !== 'cancelada' && cita.estado !== 'completada' && (
                        <button
                          className="btn btn-icon btn-danger btn-sm"
                          title="Cancelar cita"
                          aria-label={`Cancelar cita del ${formatDate(cita.fecha)}`}
                          onClick={() => handleCancelar(cita.cita_id)}
                          disabled={deletingId === cita.cita_id}
                        >
                          {deletingId === cita.cita_id
                            ? <div className="spinner" style={{ width: '0.875rem', height: '0.875rem', borderTopColor: '#dc2626', borderColor: 'rgba(220,38,38,0.2)' }} aria-hidden="true" />
                            : <Trash2 size={14} aria-hidden="true" />
                          }
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
