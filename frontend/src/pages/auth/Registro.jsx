import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Stethoscope, Mail, Lock, Eye, EyeOff, UserPlus,
  AlertCircle, CheckCircle2, ArrowLeft, User, X
} from 'lucide-react';
import { apiClient } from '../../api/client';

/* ── URL de la foto de portada (la misma que en Login) ───────────────────── */
const COVER_URL =
  'https://i.ibb.co/35wqQnsk/Whats-App-Image-2026-07-23-at-6-24-26-PM.jpg';

/* ── Requisitos de contraseña ────────────────────────────────────────────── */
const passwordReqs = [
  { label: 'Al menos 8 caracteres',      test: (p) => p.length >= 8                  },
  { label: 'Al menos una letra',          test: (p) => /[a-zA-Z]/.test(p)             },
  { label: 'Al menos un número',          test: (p) => /\d/.test(p)                   },
];

const PasswordStrength = ({ password }) => {
  const met = passwordReqs.filter(r => r.test(password)).length;
  const pct = (met / passwordReqs.length) * 100;
  const color = pct < 40 ? '#dc2626' : pct < 80 ? '#d97706' : '#059669';
  const label = pct < 40 ? 'Débil' : pct < 80 ? 'Regular' : 'Fuerte';

  if (!password) return null;

  return (
    <div style={{ marginTop: '0.5rem' }}>
      <div style={{ height: '4px', background: 'var(--border-color)', borderRadius: '9999px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, transition: 'width 0.3s ease, background 0.3s ease', borderRadius: '9999px' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '0.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {passwordReqs.map(r => (
            <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: r.test(password) ? '#059669' : 'var(--text-muted)' }}>
              <CheckCircle2 size={11} />
              {r.label}
            </div>
          ))}
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color, marginTop: '0.125rem' }}>{label}</span>
      </div>
    </div>
  );
};

/* ── Página de Registro ──────────────────────────────────────────────────── */
export const Registro = () => {
  const [form, setForm] = useState({
    nombre: '', correo: '', password: '', confirmar: '',
  });
  const [showPwd,   setShowPwd]   = useState(false);
  const [showConf,  setShowConf]  = useState(false);
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.nombre.trim())  return 'El nombre completo es obligatorio.';
    if (!form.correo.trim())  return 'El correo electrónico es obligatorio.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) return 'El correo no tiene un formato válido.';
    if (form.password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
    if (!/\d/.test(form.password)) return 'La contraseña debe incluir al menos un número.';
    if (form.password !== form.confirmar) return 'Las contraseñas no coinciden.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);
    try {
      await apiClient('/auth/registro', {
        method: 'POST',
        body: JSON.stringify({
          nombre:   form.nombre.trim(),
          correo:   form.correo.trim().toLowerCase(),
          password: form.password,
          rol:      'cliente',          // siempre cliente al auto-registrarse
        }),
      });
      setSuccess(true);
    } catch (ex) {
      setError(ex.message || 'No se pudo crear la cuenta. El correo podría ya estar registrado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
    }}>
      {/* ── Panel izquierdo: foto ──────────────────────────────────────── */}
      <div style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <img
          src={COVER_URL}
          alt="Veterinaria VetCare"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            filter: 'blur(1px) brightness(0.5)',
            transform: 'scale(1.05)',
          }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,15,40,0.88) 0%, rgba(10,15,40,0.2) 60%, transparent 100%)' }} />

        <div style={{ position: 'relative', padding: '3rem', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', background: 'linear-gradient(135deg, #3b82f6, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Stethoscope size={22} />
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>VetCare</span>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 0.75rem', lineHeight: 1.2, color: '#fff' }}>
            Únete a VetCare
          </h2>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.75)', margin: 0, maxWidth: '380px', lineHeight: 1.7 }}>
            Crea tu cuenta para acceder a tu historial de citas, ver el estado de tus mascotas y mucho más.
          </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '2rem' }}>
              {[
                'Consulta tus citas en línea',
                'Ve el historial de tus mascotas',
                'Recibe recordatorios de vacunas'
              ].map(tag => (
                <div key={tag} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.9)' }}>
                  <CheckCircle2 size={18} style={{ color: '#10b981' }} />
                  <span>{tag}</span>
                </div>
              ))}
            </div>
        </div>
      </div>

      {/* ── Panel derecho: formulario ──────────────────────────────────── */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '2rem', background: 'var(--surface-1)', overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: 480 }}>

          {/* Link volver */}
          <Link
            to="/login"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
              fontSize: '0.875rem', color: 'var(--text-secondary)',
              marginBottom: '2rem', fontWeight: 500,
            }}
          >
            <ArrowLeft size={15} aria-hidden="true" /> Volver al inicio de sesión
          </Link>

          {success ? (
            /* ── Pantalla de éxito ── */
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '5rem', height: '5rem', borderRadius: '50%',
                background: 'var(--success-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem',
              }}>
                <CheckCircle2 size={32} style={{ color: 'var(--success-text)' }} />
              </div>
              <h2 style={{ marginBottom: '0.75rem' }}>¡Cuenta creada!</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Tu cuenta de cliente ha sido registrada exitosamente.
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
                Para que puedas ver tus citas y mascotas, el equipo de VetCare deberá vincular tu perfil con tu registro de cliente. 
                Puedes iniciar sesión mientras tanto.
              </p>
              <button
                className="btn btn-primary w-full"
                style={{ padding: '0.8125rem' }}
                onClick={() => navigate('/login')}
              >
                Ir al inicio de sesión
              </button>
            </div>
          ) : (
            /* ── Formulario de registro ── */
            <>
              <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.375rem' }}>
                  Crear cuenta
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', margin: 0 }}>
                  Completa los datos para registrarte como cliente
                </p>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert" style={{ marginBottom: '1.25rem' }}>
                  <AlertCircle size={16} className="alert-icon" aria-hidden="true" />
                  <span style={{ flex: 1 }}>{error}</span>
                  <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.7, display: 'flex' }}>
                    <X size={14} aria-label="Cerrar" />
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* Nombre */}
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-nombre">Nombre completo *</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} aria-hidden="true" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <input
                      id="reg-nombre" name="nombre"
                      className="form-input" type="text"
                      style={{ paddingLeft: '2.5rem' }}
                      placeholder="María García López"
                      value={form.nombre} onChange={handleChange}
                      autoComplete="name" autoFocus required
                    />
                  </div>
                </div>

                {/* Correo */}
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-correo">Correo electrónico *</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} aria-hidden="true" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <input
                      id="reg-correo" name="correo"
                      className="form-input" type="email"
                      style={{ paddingLeft: '2.5rem' }}
                      placeholder="tuemail@ejemplo.com"
                      value={form.correo} onChange={handleChange}
                      autoComplete="email" required
                    />
                  </div>
                </div>

                {/* Contraseña */}
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-password">Contraseña *</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} aria-hidden="true" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <input
                      id="reg-password" name="password"
                      className="form-input"
                      type={showPwd ? 'text' : 'password'}
                      style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }}
                      placeholder="Mínimo 8 caracteres"
                      value={form.password} onChange={handleChange}
                      autoComplete="new-password" required
                    />
                    <button type="button" onClick={() => setShowPwd(v => !v)}
                      aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '0.25rem' }}>
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <PasswordStrength password={form.password} />
                </div>

                {/* Confirmar contraseña */}
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-confirm">Confirmar contraseña *</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} aria-hidden="true" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <input
                      id="reg-confirm" name="confirmar"
                      className="form-input"
                      type={showConf ? 'text' : 'password'}
                      style={{
                        paddingLeft: '2.5rem', paddingRight: '2.75rem',
                        borderColor: form.confirmar && form.confirmar !== form.password ? 'var(--danger-text)' : undefined,
                      }}
                      placeholder="Repite tu contraseña"
                      value={form.confirmar} onChange={handleChange}
                      autoComplete="new-password" required
                    />
                    <button type="button" onClick={() => setShowConf(v => !v)}
                      aria-label={showConf ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '0.25rem' }}>
                      {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {form.confirmar && form.confirmar !== form.password && (
                    <span className="form-error" style={{ fontSize: '0.8125rem' }}>Las contraseñas no coinciden</span>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  style={{ padding: '0.8125rem', marginTop: '0.5rem', fontSize: '0.9375rem' }}
                  disabled={loading} aria-busy={loading}
                >
                  {loading
                    ? <><div className="spinner" aria-hidden="true" /> Creando cuenta...</>
                    : <><UserPlus size={17} aria-hidden="true" /> Crear mi cuenta</>
                  }
                </button>
              </form>

              <p style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>
                  Inicia sesión aquí
                </Link>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
