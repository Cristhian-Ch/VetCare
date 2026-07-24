import React, { useState, useEffect } from 'react';
import { getCitas, crearCita } from '../../api/citas';
import { getMascotas } from '../../api/mascotas';
import {
  AlertCircle, Calendar as CalendarIcon, Clock, Stethoscope, FileText, CheckCircle2, Dog,
  Plus, X, QrCode, CreditCard, Banknote, ShieldCheck
} from 'lucide-react';

/* ─── Precios Base por Motivo ────────────────────────────────────────────── */
const PRECIOS = {
  'Consulta General': 50,
  'Vacunación': 80,
  'Desparasitación': 40,
  'Emergencia': 150,
  'Control': 30
};

export const PortalCitas = () => {
  const [loading, setLoading] = useState(true);
  const [citasProximas, setCitasProximas] = useState([]);
  const [citasHistorial, setCitasHistorial] = useState([]);
  const [mascotasMap, setMascotasMap] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados del Modal de Reserva
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    mascota_id: '',
    fecha: '',
    hora: '',
    motivo: 'Consulta General',
    metodoPago: 'efectivo',
  });

  const clienteId = localStorage.getItem('vetcare_cliente_id');

  const cargarCitas = async () => {
    if (!clienteId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [citasRes, mascotasRes] = await Promise.all([getCitas(), getMascotas()]);

      const map = {};
      const misMascotasList = [];
      (mascotasRes.data || []).forEach(m => {
        map[m.mascota_id] = m;
        if (String(m.cliente_id) === String(clienteId)) misMascotasList.push(m);
      });
      setMascotasMap(map);

      // Si no tiene mascota_id seleccionada y tiene mascotas, preseleccionar la primera
      if (!form.mascota_id && misMascotasList.length > 0) {
        setForm(prev => ({ ...prev, mascota_id: misMascotasList[0].mascota_id }));
      }

      const misCitas = (citasRes.data || []).filter(c => String(c.cliente_id) === String(clienteId));
      
      const ahora = new Date();
      ahora.setHours(0, 0, 0, 0);

      const proximas = [];
      const historial = [];

      misCitas.forEach(cita => {
        const fechaCita = new Date(`${cita.fecha}T00:00:00`);
        if (cita.estado !== 'cancelada' && fechaCita >= ahora) {
          proximas.push(cita);
        } else {
          historial.push(cita);
        }
      });

      proximas.sort((a, b) => new Date(`${a.fecha}T${a.hora || '00:00'}`) - new Date(`${b.fecha}T${b.hora || '00:00'}`));
      historial.sort((a, b) => new Date(`${b.fecha}T${b.hora || '00:00'}`) - new Date(`${a.fecha}T${a.hora || '00:00'}`));

      setCitasProximas(proximas);
      setCitasHistorial(historial);
    } catch (err) {
      setError('No se pudieron cargar tus citas. Por favor, intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarCitas(); }, [clienteId]);

  if (!clienteId) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="alert alert-danger" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <AlertCircle size={24} style={{ flexShrink: 0 }} />
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>Cuenta no vinculada</h3>
              <p style={{ margin: 0 }}>Tu cuenta no está vinculada a un perfil de cliente. No podemos mostrar tus citas.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatFecha = (fechaStr) => {
    try {
      const d = new Date(`${fechaStr}T12:00:00`);
      return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } catch { return fechaStr; }
  };

  const formatHora = (horaStr) => {
    if (!horaStr) return '';
    try {
      const [h, m] = horaStr.split(':');
      const hNum = parseInt(h, 10);
      const ampm = hNum >= 12 ? 'PM' : 'AM';
      return `${hNum % 12 || 12}:${m} ${ampm}`;
    } catch { return horaStr; }
  };

  const getEstadoBadge = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'programada': return <span className="badge badge-info">Programada</span>;
      case 'completada': return <span className="badge badge-success">Completada</span>;
      case 'cancelada': return <span className="badge badge-danger">Cancelada</span>;
      default: return <span className="badge badge-neutral">{estado || 'Pendiente'}</span>;
    }
  };

  const handleReservar = async () => {
    if (!form.mascota_id || !form.fecha || !form.hora) {
      alert("Por favor, completa todos los campos requeridos.");
      return;
    }
    setSaving(true);
    try {
      await crearCita({
        cliente_id: clienteId,
        mascota_id: form.mascota_id,
        fecha: form.fecha,
        hora: form.hora,
        motivo: form.motivo,
        estado: 'programada'
      });
      // Asumimos que el pago se registra en otra tabla o ya quedó validado visualmente
      setSuccess("Cita reservada exitosamente.");
      setShowModal(false);
      setStep(1);
      cargarCitas();
      setTimeout(() => setSuccess(''), 5000);
    } catch (e) {
      alert("Error al reservar la cita.");
    } finally {
      setSaving(false);
    }
  };

  // Mis Mascotas para el select
  const misMascotas = Object.values(mascotasMap).filter(m => String(m.cliente_id) === String(clienteId));
  const montoAPagar = PRECIOS[form.motivo] || 50;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', margin: '0 0 0.5rem 0' }}>Mis Citas</h2>
          <p className="text-muted" style={{ margin: 0 }}>Gestiona y revisa tu historial de atenciones.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowModal(true); setStep(1); }}>
          <Plus size={16} /> Reservar Cita
        </button>
      </div>

      {error && <div className="alert alert-danger"><AlertCircle size={16} /> {error}</div>}
      {success && <div className="alert alert-success"><CheckCircle2 size={16} /> {success}</div>}

      {loading ? (
        <div className="flex-center" style={{ minHeight: '200px' }}><div className="spinner"></div></div>
      ) : (
        <>
          <section>
            <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CalendarIcon size={20} /> Próximas Citas
            </h3>
            {citasProximas.length === 0 ? (
              <div className="empty-state">
                <CheckCircle2 size={40} className="text-muted" style={{ marginBottom: '1rem' }} />
                <h3>No tienes citas próximas</h3>
                <p>Tu agenda está libre por ahora.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {citasProximas.map(cita => {
                  const mascota = mascotasMap[cita.mascota_id];
                  return (
                    <div key={cita.cita_id} className="card" style={{ borderLeft: '4px solid var(--primary-600)' }}>
                      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ textTransform: 'capitalize', fontWeight: 600, color: 'var(--primary-600)', fontSize: '1.1rem' }}>
                            {formatFecha(cita.fecha)}
                          </div>
                          {getEstadoBadge(cita.estado)}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: 500 }}>
                          <Clock size={18} className="text-muted" />
                          {formatHora(cita.hora)}
                        </div>
                        <div style={{ background: 'var(--surface-1)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <Dog size={16} className="text-muted" />
                            <strong>Para:</strong> {mascota ? mascota.nombre : 'Mascota eliminada'}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Stethoscope size={16} className="text-muted" />
                            <strong>Motivo:</strong> {cita.motivo}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section style={{ marginTop: '2rem' }}>
            <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={20} /> Historial de Citas
            </h3>
            {citasHistorial.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem' }}><p>No tienes historial de citas.</p></div>
            ) : (
              <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Fecha y Hora</th>
                        <th>Mascota</th>
                        <th>Motivo</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {citasHistorial.map(cita => {
                        const mascota = mascotasMap[cita.mascota_id];
                        return (
                          <tr key={cita.cita_id}>
                            <td>
                              <div style={{ fontWeight: 500 }}>{cita.fecha}</div>
                              <div className="text-xs text-muted">{formatHora(cita.hora)}</div>
                            </td>
                            <td>{mascota ? mascota.nombre : 'Desconocida'}</td>
                            <td>{cita.motivo}</td>
                            <td>{getEstadoBadge(cita.estado)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </>
      )}

      {/* ── Modal de Reserva de Cita ── */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
        }}>
          <div style={{
            background: 'var(--surface-1)', borderRadius: 'var(--radius-xl)',
            width: '100%', maxWidth: 500,
            boxShadow: '0 24px 60px -12px rgba(0,0,0,0.3)', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', maxHeight: '90vh'
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
                }}><CalendarIcon size={18} aria-hidden="true" /></div>
                <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Reservar Cita</h3>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Agenda una atención para tu mascota</p>
              </div>
              <button onClick={() => setShowModal(false)} aria-label="Cerrar"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
              {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Paso 1: Detalles de la cita</h4>
                  
                  <div className="form-group">
                    <label className="form-label">Mascota</label>
                    <select className="form-select" value={form.mascota_id} onChange={e => setForm({...form, mascota_id: e.target.value})}>
                      {misMascotas.map(m => <option key={m.mascota_id} value={m.mascota_id}>{m.nombre} ({m.especie})</option>)}
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Fecha</label>
                      <input type="date" className="form-input" min={new Date().toISOString().split('T')[0]} 
                        value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Hora disponible</label>
                      <input type="time" className="form-input" 
                        value={form.hora} onChange={e => setForm({...form, hora: e.target.value})} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Motivo de consulta</label>
                    <select className="form-select" value={form.motivo} onChange={e => setForm({...form, motivo: e.target.value})}>
                      {Object.keys(PRECIOS).map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>

                  <button className="btn btn-primary w-full" style={{ marginTop: '1rem' }} 
                    disabled={!form.mascota_id || !form.fecha || !form.hora}
                    onClick={() => setStep(2)}>
                    Continuar al Pago
                  </button>
                </div>
              )}

              {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Paso 2: Confirmación y Pago</h4>
                  
                  <div style={{ background: 'var(--surface-2)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Monto a pagar ({form.motivo})</span>
                    <h2 style={{ margin: '0.5rem 0 0 0', color: 'var(--primary-600)' }}>S/ {montoAPagar.toFixed(2)}</h2>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Método de pago</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div 
                        onClick={() => setForm({...form, metodoPago: 'yape'})}
                        style={{ border: `2px solid ${form.metodoPago === 'yape' ? '#742384' : 'var(--border-color)'}`, borderRadius: 'var(--radius-md)', padding: '1rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', background: form.metodoPago === 'yape' ? 'rgba(116, 35, 132, 0.05)' : 'transparent' }}>
                        <QrCode size={24} style={{ color: '#742384', margin: '0 auto 0.5rem' }} />
                        <strong style={{ display: 'block', color: '#742384' }}>Yape / Plin</strong>
                      </div>
                      <div 
                        onClick={() => setForm({...form, metodoPago: 'efectivo'})}
                        style={{ border: `2px solid ${form.metodoPago === 'efectivo' ? 'var(--primary-600)' : 'var(--border-color)'}`, borderRadius: 'var(--radius-md)', padding: '1rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', background: form.metodoPago === 'efectivo' ? 'var(--primary-50)' : 'transparent' }}>
                        <Banknote size={24} style={{ color: 'var(--primary-600)', margin: '0 auto 0.5rem' }} />
                        <strong style={{ display: 'block', color: 'var(--primary-600)' }}>Efectivo</strong>
                      </div>
                    </div>
                  </div>

                  {form.metodoPago === 'yape' && (
                    <div style={{ border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem', textAlign: 'center', background: 'var(--surface-1)' }}>
                      <QrCode size={120} style={{ margin: '0 auto', opacity: 0.5 }} />
                      <p style={{ margin: '1rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Escanea este código con tu billetera digital para realizar el pago de S/ {montoAPagar.toFixed(2)}</p>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>Volver</button>
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleReservar} disabled={saving}>
                      {saving ? <div className="spinner"></div> : <><ShieldCheck size={16} /> Confirmar Reserva</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
