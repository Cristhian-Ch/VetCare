import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard, CheckCircle2, AlertCircle, X,
  TrendingUp, DollarSign, ReceiptText, Calendar,
  Banknote, CreditCard as CreditCardIcon, Landmark
} from 'lucide-react';
import { getPagos } from '../../api/pagos';

/* ─────────────────────────── helpers ────────────────────────────────────── */
const normalize = (res) =>
  Array.isArray(res) ? res : (res?.data ?? []);

const METODO_ICON = { 
  Efectivo: Banknote, 
  Tarjeta: CreditCardIcon, 
  Transferencia: Landmark 
};

const METODO_COLOR  = {
  Efectivo:      { bg: 'rgba(16,185,129,0.1)',   text: '#059669' },
  Tarjeta:       { bg: 'rgba(59,130,246,0.1)',   text: '#2563eb' },
  Transferencia: { bg: 'rgba(139,92,246,0.1)',   text: '#7c3aed' },
};

const fmtDate = (raw) => {
  if (!raw) return '—';
  return new Date(raw).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const fmtMoney = (v) =>
  `S/\u00A0${Number(v ?? 0).toFixed(2)}`;

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

/* ─────────────────────────── Página principal ────────────────────────────── */
export const Pagos = () => {
  const [pagos,   setPagos]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [filtro,  setFiltro]  = useState(''); // método de pago

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getPagos();
      setPagos(normalize(res));
    } catch {
      setError('No se pudo cargar el historial de pagos. Verifica la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Resumen financiero ── */
  const totalIngresos = pagos.reduce((acc, p) => acc + Number(p.monto ?? 0), 0);
  const totalCitas    = new Set(pagos.map(p => p.cita_id)).size;
  const pagosHoy      = pagos.filter(p => {
    if (!p.fecha_pago) return false;
    const d = new Date(p.fecha_pago);
    const hoy = new Date();
    return d.getDate() === hoy.getDate() &&
           d.getMonth() === hoy.getMonth() &&
           d.getFullYear() === hoy.getFullYear();
  });
  const ingresoHoy = pagosHoy.reduce((acc, p) => acc + Number(p.monto ?? 0), 0);

  const metodoStats = pagos.reduce((acc, p) => {
    const m = p.metodo_pago ?? 'Otro';
    acc[m] = (acc[m] ?? 0) + 1;
    return acc;
  }, {});

  /* Filtrado local por método */
  const filtered = filtro
    ? pagos.filter(p => p.metodo_pago === filtro)
    : pagos;

  const resumen = [
    { label: 'Ingresos totales', value: fmtMoney(totalIngresos), icon: TrendingUp,  color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Ingresos hoy',     value: fmtMoney(ingresoHoy),    icon: DollarSign,  color: '#2563eb', bg: 'rgba(59,130,246,0.1)' },
    { label: 'Pagos registrados',value: `${pagos.length}`,       icon: ReceiptText, color: '#7c3aed', bg: 'rgba(139,92,246,0.1)' },
    { label: 'Citas cobradas',   value: `${totalCitas}`,         icon: Calendar,    color: '#d97706', bg: 'rgba(245,158,11,0.1)' },
  ];

  return (
    <div>
      {/* Cabecera */}
      <div className="mb-8">
        <h1 className="page-title">Historial de Pagos</h1>
        <p className="page-subtitle">
          Resumen financiero y registro de todos los cobros realizados
        </p>
      </div>

      {/* Alertas */}
      {error && <Alert type="danger" onClose={() => setError('')}>{error}</Alert>}

      {/* Tarjetas de resumen */}
      <div className="stats-grid">
        {resumen.map(({ label, value, icon: Icon, color, bg }) => (
          <div className="stat-card" key={label}>
            <div className="stat-icon-wrap" style={{ backgroundColor: bg }}>
              <Icon size={22} style={{ color }} aria-hidden="true" />
            </div>
            <div className="stat-body">
              <div className="stat-label">{label}</div>
              <div className="stat-value" style={{ color }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Distribución por método */}
      {Object.keys(metodoStats).length > 0 && (
        <div className="card mb-6">
          <div className="card-header">
            <div className="flex gap-2" style={{ alignItems: 'center' }}>
              <CreditCard size={18} style={{ color: 'var(--primary-600)' }} aria-hidden="true" />
              <h3 style={{ margin: 0 }}>Distribución por método de pago</h3>
            </div>
          </div>
          <div className="card-body" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {Object.entries(metodoStats).map(([metodo, count]) => {
              const style = METODO_COLOR[metodo] ?? { bg: 'var(--surface-3)', text: 'var(--text-secondary)' };
              const pct   = pagos.length ? Math.round((count / pagos.length) * 100) : 0;
              return (
                <div
                  key={metodo}
                  style={{
                    flex: '1 1 180px', padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    background: style.bg, border: `1px solid ${style.bg}`,
                    cursor: 'pointer',
                    outline: filtro === metodo ? `2px solid ${style.text}` : 'none',
                  }}
                  role="button" tabIndex={0}
                  aria-pressed={filtro === metodo}
                  onClick={() => setFiltro(prev => prev === metodo ? '' : metodo)}
                  onKeyDown={(e) => e.key === 'Enter' && setFiltro(prev => prev === metodo ? '' : metodo)}
                  title={`Filtrar por ${metodo}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.25rem', color: style.text }}>
                    {METODO_ICON[metodo] ? React.createElement(METODO_ICON[metodo], { size: 24 }) : <DollarSign size={24} />}
                  </div>
                  <div style={{ fontWeight: 700, color: style.text, fontSize: '1.5rem', lineHeight: 1 }}>{count}</div>
                  <div style={{ fontSize: '0.8125rem', color: style.text, opacity: 0.8, marginTop: '0.125rem' }}>
                    {metodo} · {pct}%
                  </div>
                </div>
              );
            })}
          </div>
          {filtro && (
            <div className="card-footer">
              <div className="flex-between">
                <span className="text-sm text-secondary">
                  Mostrando solo pagos con <strong>{filtro}</strong>
                </span>
                <button className="btn btn-sm btn-secondary" onClick={() => setFiltro('')}>
                  <X size={13} aria-hidden="true" /> Quitar filtro
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabla de pagos */}
      <div className="card">
        <div className="card-header">
          <div className="flex gap-2" style={{ alignItems: 'center' }}>
            <ReceiptText size={18} style={{ color: 'var(--primary-600)' }} aria-hidden="true" />
            <h3 style={{ margin: 0 }}>Registro de Pagos</h3>
          </div>
          {!loading && (
            <span className="badge badge-neutral">{filtered.length} registros</span>
          )}
        </div>

        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div className="loading-state">
              <div className="spinner spinner-dark" aria-label="Cargando..." />
              <p className="text-sm">Cargando pagos...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <CreditCard size={24} aria-hidden="true" />
              </div>
              <p className="font-semibold text-secondary">
                {filtro ? `No hay pagos con método "${filtro}"` : 'Aún no hay pagos registrados'}
              </p>
              <p className="text-sm text-muted">
                {filtro
                  ? 'Prueba seleccionando otro método de pago.'
                  : 'Los pagos aparecerán aquí al confirmar citas desde el módulo de Citas.'}
              </p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Fecha de pago</th>
                  <th>Cliente</th>
                  <th>Mascota</th>
                  <th>Cita</th>
                  <th>Método</th>
                  <th>Monto</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const mc = METODO_COLOR[p.metodo_pago] ?? { bg: 'var(--surface-3)', text: 'var(--text-secondary)' };
                  return (
                    <tr key={p.pago_id}>
                      <td className="text-muted text-xs">{i + 1}</td>
                      <td>
                        <div className="text-sm font-semibold">
                          {p.fecha_pago
                            ? new Date(p.fecha_pago).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
                            : '—'}
                        </div>
                        <div className="text-xs text-muted">
                          {p.fecha_pago
                            ? new Date(p.fecha_pago).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                            : ''}
                        </div>
                      </td>
                      <td>
                        <span className="text-sm font-semibold">{p.cliente_nombre ?? '—'}</span>
                      </td>
                      <td>
                        <span className="text-sm">{p.mascota_nombre ?? '—'}</span>
                      </td>
                      <td>
                        <div className="text-xs text-muted">
                          {p.fecha_cita
                            ? new Date(p.fecha_cita).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
                            : '—'}
                        </div>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                          fontSize: '0.8125rem', fontWeight: 600,
                          padding: '0.25rem 0.625rem',
                          borderRadius: 'var(--radius-full)',
                          background: mc.bg, color: mc.text,
                        }}>
                          {METODO_ICON[p.metodo_pago] ? React.createElement(METODO_ICON[p.metodo_pago], { size: 14 }) : <DollarSign size={14} />} {p.metodo_pago ?? '—'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#059669' }}>
                          {fmtMoney(p.monto)}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-success">
                          {p.estado ?? 'Completado'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer con totales */}
        {!loading && filtered.length > 0 && (
          <div className="card-footer">
            <div className="flex-between">
              <span className="text-sm text-secondary">
                Total de {filtered.length} pago{filtered.length !== 1 ? 's' : ''}
                {filtro ? ` (${filtro})` : ''}
              </span>
              <span style={{ fontWeight: 700, color: '#059669' }}>
                {fmtMoney(filtered.reduce((acc, p) => acc + Number(p.monto ?? 0), 0))}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
