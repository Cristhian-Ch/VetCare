import React, { useState, useEffect } from 'react';
import { getMascotas } from '../../api/mascotas';
import { AlertCircle, Plus, CheckCircle2, Search, Dog, Cat, Bird, Rabbit, Turtle, PawPrint } from 'lucide-react';

const ESPECIE_ICON = { Perro: Dog, Gato: Cat, Ave: Bird, Conejo: Rabbit, Reptil: Turtle, Otro: PawPrint };

export const PortalMascotas = () => {
  const [loading, setLoading] = useState(true);
  const [mascotas, setMascotas] = useState([]);
  const [error, setError] = useState('');

  const clienteId = localStorage.getItem('vetcare_cliente_id');

  useEffect(() => {
    const fetchData = async () => {
      if (!clienteId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await getMascotas();
        const misMascotas = (res.data || []).filter(m => String(m.cliente_id) === String(clienteId));
        setMascotas(misMascotas);
      } catch (err) {
        console.error('Error cargando mascotas:', err);
        setError('No se pudieron cargar tus mascotas. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clienteId]);

  if (!clienteId) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="alert alert-danger" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <AlertCircle size={24} style={{ flexShrink: 0 }} />
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>Cuenta no vinculada</h3>
              <p style={{ margin: 0 }}>
                Tu cuenta no está vinculada a un perfil de cliente. No podemos mostrar tus mascotas.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const mostrarEdad = (mascota) => {
    if (mascota.edad != null && mascota.edad !== '') {
      const e = Number(mascota.edad);
      return `${e} año${e !== 1 ? 's' : ''}`;
    }
    return 'No especificada';
  };


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', margin: '0 0 0.5rem 0' }}>Mis Mascotas</h2>
          <p className="text-muted" style={{ margin: 0 }}>La familia peluda que confía en nosotros.</p>
        </div>
        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => alert('Para registrar una nueva mascota, por favor contacte con la clínica.')}>
          <Plus size={18} /> Nueva Mascota
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {loading ? (
        <div className="flex-center" style={{ minHeight: '200px' }}>
          <div className="spinner"></div>
        </div>
      ) : mascotas.length === 0 ? (
        <div className="empty-state card card-body" style={{ padding: '4rem 2rem' }}>
          <div style={{ marginBottom: '1rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'center' }}>
            <PawPrint size={64} />
          </div>
          <h3>No tienes mascotas registradas</h3>
          <p className="text-muted" style={{ maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
            Actualmente no tienes ninguna mascota asociada a tu perfil. Si deseas registrar a un nuevo integrante de la familia, contacta con nosotros.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {mascotas.map(mascota => (
            <div key={mascota.mascota_id} className="card" style={{ transition: 'transform 0.2s, box-shadow 0.2s' }}>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2rem 1.5rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem', background: 'var(--primary-50)', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {ESPECIE_ICON[mascota.especie] ? React.createElement(ESPECIE_ICON[mascota.especie], { size: 48 }) : <PawPrint size={48} />}
                </div>
                
                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.5rem' }}>{mascota.nombre}</h3>
                
                <span className="badge badge-info" style={{ marginBottom: '1rem' }}>
                  {mascota.especie}
                </span>

                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--surface-1)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                    <span className="text-muted">Raza</span>
                    <span style={{ fontWeight: 500 }}>{mascota.raza || 'No especificada'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                    <span className="text-muted">Género</span>
                    <span style={{ fontWeight: 500 }}>{mascota.genero === 'M' ? 'Macho' : mascota.genero === 'H' ? 'Hembra' : 'No especificado'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-muted">Edad</span>
                    <span style={{ fontWeight: 500 }}>{mostrarEdad(mascota)}</span>
                  </div>
                </div>
                
                {mascota.notas && (
                  <p className="text-sm text-muted" style={{ marginTop: '1rem', fontStyle: 'italic' }}>
                    "{mascota.notas}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
