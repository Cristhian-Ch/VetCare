import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Dog, CreditCard, Activity, ArrowRight, Clock, User } from 'lucide-react';
import { getCitas } from '../../api/citas';
import { getClientes } from '../../api/clientes';
import { getMascotas } from '../../api/mascotas';
import { getPagos } from '../../api/pagos';
import { useAuth } from '../../context/AuthContext';

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    citasHoy: 0,
    clientesRegistrados: 0,
    mascotasActivas: 0,
    ingresosMes: 0
  });
  const [proximasCitas, setProximasCitas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch all data in parallel
        const [citasRes, clientesRes, mascotasRes, pagosRes] = await Promise.all([
          getCitas(),
          getClientes(),
          getMascotas(),
          getPagos()
        ]);

        const citas = citasRes.data || [];
        const clientes = clientesRes.data || [];
        const mascotas = mascotasRes.data || [];
        const pagos = pagosRes.data || [];

        // Calculate Stats
        const hoy = new Date();
        const hoyStr = hoy.toISOString().split('T')[0];
        
        const citasHoy = citas.filter(c => c.fecha === hoyStr).length;
        
        const mesActual = hoy.getMonth();
        const anioActual = hoy.getFullYear();
        const ingresosMes = pagos.reduce((total, pago) => {
          const fechaPago = new Date(pago.fecha_pago || pago.fecha);
          if (fechaPago.getMonth() === mesActual && fechaPago.getFullYear() === anioActual) {
            return total + parseFloat(pago.monto || 0);
          }
          return total;
        }, 0);

        setStats({
          citasHoy,
          clientesRegistrados: clientes.length,
          mascotasActivas: mascotas.length,
          ingresosMes
        });

        // Calculate Upcoming Appointments
        const ahora = new Date();
        ahora.setHours(0, 0, 0, 0);

        const proximas = citas
          .filter(c => c.estado !== 'cancelada' && new Date(`${c.fecha}T00:00:00`) >= ahora)
          .sort((a, b) => new Date(`${a.fecha}T${a.hora || '00:00'}`) - new Date(`${b.fecha}T${b.hora || '00:00'}`))
          .slice(0, 5); // Take top 5

        // Map cliente and mascota names to appointments
        const citasCompletas = proximas.map(cita => {
          const cliente = clientes.find(c => String(c.cliente_id) === String(cita.cliente_id));
          const mascota = mascotas.find(m => String(m.mascota_id) === String(cita.mascota_id));
          return {
            ...cita,
            clienteNombre: cliente ? cliente.nombre : 'Desconocido',
            mascotaNombre: mascota ? mascota.nombre : 'Desconocida'
          };
        });

        setProximasCitas(citasCompletas);

      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatHora = (horaStr) => {
    if (!horaStr) return '';
    try {
      const [h, m] = horaStr.split(':');
      const hNum = parseInt(h, 10);
      const ampm = hNum >= 12 ? 'PM' : 'AM';
      const h12 = hNum % 12 || 12;
      return `${h12}:${m} ${ampm}`;
    } catch(e) {
      return horaStr;
    }
  };

  const getEstadoBadge = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'programada': return <span className="badge badge-info">Programada</span>;
      case 'completada': return <span className="badge badge-success">Completada</span>;
      case 'cancelada': return <span className="badge badge-danger">Cancelada</span>;
      default: return <span className="badge badge-neutral">{estado || 'Pendiente'}</span>;
    }
  };

  // Determine which quick links to show based on role
  const isAdmin = user?.rol === 'admin';
  const quickLinks = [
    { label: 'Registrar nueva cita',       to: '/dashboard/citas',    icon: Calendar, show: true },
    { label: 'Ver lista de clientes',       to: '/dashboard/clientes', icon: Users, show: true },
    { label: 'Gestionar mascotas',          to: '/dashboard/mascotas', icon: Dog, show: isAdmin },
    { label: 'Revisar historial de pagos',  to: '/dashboard/pagos',    icon: CreditCard, show: isAdmin },
  ].filter(link => link.show);


  const statsData = [
    { label: 'Citas hoy', value: stats.citasHoy, icon: Calendar, colorVar: 'var(--primary-600)', bgColor: 'rgba(59, 130, 246, 0.1)' },
    { label: 'Clientes registrados', value: stats.clientesRegistrados, icon: Users, colorVar: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
    { label: 'Mascotas activas', value: stats.mascotasActivas, icon: Dog, colorVar: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)', hideForVet: !isAdmin },
    { label: 'Ingresos del mes', value: `S/\u00A0${stats.ingresosMes.toFixed(2)}`, icon: CreditCard, colorVar: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.1)', hideForVet: !isAdmin },
  ].filter(stat => !stat.hideForVet);

  return (
    <div>
      {/* Encabezado de página */}
      <div className="mb-8">
        <h1 className="page-title">Panel de control</h1>
        <p className="page-subtitle">
          Resumen de actividad de la clínica VetCare
        </p>
      </div>

      {loading ? (
        <div className="flex-center" style={{ minHeight: '300px' }}>
          <div className="spinner spinner-dark" />
        </div>
      ) : (
        <>
          {/* Tarjetas de estadísticas */}
          <div className="stats-grid">
            {statsData.map(({ label, value, icon: Icon, colorVar, bgColor }) => (
              <div className="stat-card" key={label}>
                <div className="stat-icon-wrap" style={{ backgroundColor: bgColor }}>
                  <Icon size={22} style={{ color: colorVar }} aria-hidden="true" />
                </div>
                <div className="stat-body">
                  <div className="stat-label">{label}</div>
                  <div className="stat-value" style={{ color: colorVar }}>{value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Accesos rápidos */}
          <div className="card mb-6">
            <div className="card-header">
              <div className="flex gap-2" style={{ alignItems: 'center' }}>
                <Activity size={18} style={{ color: 'var(--primary-600)' }} aria-hidden="true" />
                <h3 style={{ margin: 0 }}>Accesos rápidos</h3>
              </div>
            </div>
            <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              {quickLinks.map(({ label, to, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.875rem 1rem', border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
                    fontSize: '0.875rem', fontWeight: 500, transition: 'all 150ms ease',
                    background: 'var(--surface-1)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--primary-500)';
                    e.currentTarget.style.backgroundColor = 'var(--primary-50)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.backgroundColor = 'var(--surface-1)';
                  }}
                >
                  <Icon size={18} style={{ color: 'var(--primary-600)', flexShrink: 0 }} aria-hidden="true" />
                  <span style={{ flex: 1 }}>{label}</span>
                  <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>

          {/* Próximas Citas */}
          <div className="card">
            <div className="card-header">
              <div className="flex gap-2" style={{ alignItems: 'center' }}>
                <Calendar size={18} style={{ color: 'var(--primary-600)' }} aria-hidden="true" />
                <h3 style={{ margin: 0 }}>Próximas citas</h3>
              </div>
              <Link to="/dashboard/citas" className="btn btn-sm btn-secondary">
                Ver todas
              </Link>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {proximasCitas.length === 0 ? (
                <div className="empty-state" style={{ padding: '3rem' }}>
                  <div className="empty-state-icon">
                    <Calendar size={22} aria-hidden="true" />
                  </div>
                  <p className="font-semibold" style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
                    No hay citas programadas
                  </p>
                  <p className="text-sm text-muted">
                    Las próximas citas aparecerán aquí en tiempo real.
                  </p>
                  <Link to="/dashboard/citas" className="btn btn-primary btn-sm" style={{ marginTop: '0.5rem' }}>
                    Agendar cita
                  </Link>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Fecha y Hora</th>
                        <th>Cliente</th>
                        <th>Mascota</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proximasCitas.map(cita => (
                        <tr key={cita.cita_id}>
                          <td>
                            <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Calendar size={14} className="text-muted" /> {cita.fecha}
                            </div>
                            <div className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                              <Clock size={12} /> {formatHora(cita.hora)}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <User size={14} className="text-muted" /> {cita.clienteNombre}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Dog size={14} className="text-muted" /> {cita.mascotaNombre}
                            </div>
                          </td>
                          <td>{getEstadoBadge(cita.estado)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
