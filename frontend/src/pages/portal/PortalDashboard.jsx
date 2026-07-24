import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getClientes } from '../../api/clientes';
import { getMascotas } from '../../api/mascotas';
import { getCitas } from '../../api/citas';
import { AlertCircle, Calendar, Dog, Clock, ChevronRight } from 'lucide-react';

export const PortalDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [clienteId, setClienteId] = useState(null);
  const [stats, setStats] = useState({
    totalMascotas: 0,
    totalCitas: 0,
    proximaCita: null
  });

  useEffect(() => {
    const initPortal = async () => {
      try {
        setLoading(true);

        // Estrategia 1: si el JWT incluye correo, buscamos por correo exacto
        // Estrategia 2: fallback por nombre
        const terminoBusqueda = user.correo || user.nombre;
        const clienteRes = await getClientes(terminoBusqueda);
        const clientes = Array.isArray(clienteRes) ? clienteRes : (clienteRes?.data ?? []);

        // Intentar match por correo exacto primero, luego por nombre parcial
        const miRegistro = user.correo
          ? clientes.find(c => c.correo?.toLowerCase() === user.correo.toLowerCase())
            ?? clientes.find(c => c.nombre?.toLowerCase().includes(user.nombre.toLowerCase()))
          : clientes.find(c => c.nombre?.toLowerCase().includes(user.nombre.toLowerCase()))
            ?? clientes[0];

        if (miRegistro && miRegistro.cliente_id) {
          const id = miRegistro.cliente_id;
          setClienteId(id);
          localStorage.setItem('vetcare_cliente_id', id);

          // Cargar datos
          const [mascotasRes, citasRes] = await Promise.all([
            getMascotas(),
            getCitas()
          ]);

          const misMascotas = (mascotasRes.data || []).filter(m => String(m.cliente_id) === String(id));
          const misCitas = (citasRes.data || []).filter(c => String(c.cliente_id) === String(id));
          
          const ahora = new Date();
          const citasFuturas = misCitas.filter(c => {
            if (c.estado === 'cancelada') return false;
            const fechaCita = new Date(`${c.fecha}T${c.hora || '00:00'}`);
            return fechaCita >= ahora;
          }).sort((a, b) => new Date(`${a.fecha}T${a.hora || '00:00'}`) - new Date(`${b.fecha}T${b.hora || '00:00'}`));

          setStats({
            totalMascotas: misMascotas.length,
            totalCitas: misCitas.length,
            proximaCita: citasFuturas[0] || null
          });
        } else {
          localStorage.removeItem('vetcare_cliente_id');
        }
      } catch (error) {
        console.error('Error inicializando portal:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.nombre) {
      initPortal();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '300px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!clienteId) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="alert alert-danger" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <AlertCircle size={24} style={{ flexShrink: 0 }} />
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>Cuenta no vinculada</h3>
              <p style={{ margin: 0 }}>
                Hola {user?.nombre}, parece que tu cuenta aún no está vinculada a un registro de cliente en nuestra clínica. 
                Por favor, contacta con nosotros para vincular tu perfil y acceder a tus citas y mascotas.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatFechaHora = (fecha, hora) => {
    try {
      const d = new Date(`${fecha}T${hora || '00:00'}`);
      const fechaStr = d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
      
      let horaStr = hora;
      if (hora) {
        const [h, m] = hora.split(':');
        const hNum = parseInt(h, 10);
        const ampm = hNum >= 12 ? 'PM' : 'AM';
        const h12 = hNum % 12 || 12;
        horaStr = `${h12}:${m} ${ampm}`;
      }
      
      return `${fechaStr} a las ${horaStr}`;
    } catch(e) {
      return `${fecha} ${hora}`;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '1.8rem', margin: '0 0 0.5rem 0' }}>¡Hola, {user?.nombre}!</h2>
        <p className="text-muted" style={{ margin: 0, fontSize: '1.1rem' }}>Bienvenido a tu portal de cliente de VetCare.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: 'var(--primary-100)', color: 'var(--primary-600)' }}>
            <Dog size={24} />
          </div>
          <div className="stat-body">
            <div className="stat-label">Mis Mascotas</div>
            <div className="stat-value">{stats.totalMascotas}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)' }}>
            <Calendar size={24} />
          </div>
          <div className="stat-body">
            <div className="stat-label">Total de Citas</div>
            <div className="stat-value">{stats.totalCitas}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Widget Próxima cita */}
        <div className="card" style={{ height: '100%' }}>
          <div className="card-header">
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} /> Próxima Cita
            </h3>
          </div>
          <div className="card-body">
            {stats.proximaCita ? (
              <div style={{ background: 'var(--primary-50)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-100)' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--primary-600)', fontWeight: 600, marginBottom: '0.5rem' }}>
                  {stats.proximaCita.motivo}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '1rem', textTransform: 'capitalize' }}>
                  {formatFechaHora(stats.proximaCita.fecha, stats.proximaCita.hora)}
                </div>
                <Link to="/portal/mis-citas" className="btn btn-primary btn-sm">Ver detalles</Link>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                <p>No tienes citas próximas programadas.</p>
                <Link to="/portal/mis-citas" className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }}>Solicitar cita</Link>
              </div>
            )}
          </div>
        </div>

        {/* Accesos rápidos */}
        <div className="card" style={{ height: '100%' }}>
          <div className="card-header">
            <h3 style={{ margin: 0 }}>Accesos Rápidos</h3>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link 
              to="/portal/mis-citas" 
              style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '1rem', background: 'var(--surface-1)', border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'var(--text-primary)',
                transition: 'border-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary-600)'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Calendar size={20} className="text-primary-600" />
                <span style={{ fontWeight: 500 }}>Gestionar Citas</span>
              </div>
              <ChevronRight size={18} className="text-muted" />
            </Link>
            
            <Link 
              to="/portal/mis-mascotas" 
              style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '1rem', background: 'var(--surface-1)', border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'var(--text-primary)',
                transition: 'border-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary-600)'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Dog size={20} className="text-primary-600" />
                <span style={{ fontWeight: 500 }}>Ver mi Familia Peluda</span>
              </div>
              <ChevronRight size={18} className="text-muted" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
