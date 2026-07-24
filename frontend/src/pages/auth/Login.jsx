import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Stethoscope, Mail, Lock, AlertCircle, Eye, EyeOff,
  KeyRound, X, CheckCircle2, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/* ── URL de la foto de portada ───────────────────────────────────────────── */
const COVER_URL =
  'https://i.ibb.co/35wqQnsk/Whats-App-Image-2026-07-23-at-6-24-26-PM.jpg';

/* ── Modal: Recuperar contraseña ─────────────────────────────────────────── */
const RecoverModal = ({ onClose }) => {
  const [correo,  setCorreo]  = useState('');
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 50); }, []);

  const handleSend = (e) => {
    e.preventDefault();
    if (!correo.trim()) return;
    setLoading(true);
    // Simulamos el envío (el sistema no tiene email aún)
    setTimeout(() => { setSent(true); setLoading(false); }, 1200);
  };

  return (
    <div
      role="dialog" aria-modal="true" aria-labelledby="recover-title"
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'var(--surface-1)', borderRadius: 'var(--radius-xl)',
        width: '100%', maxWidth: 420,
        boxShadow: '0 25px 60px -12px rgba(0,0,0,0.35)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          background: 'linear-gradient(135deg, #eff6ff, #fff)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          <div>
            <div style={{
              width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--primary-600), #818cf8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', marginBottom: '0.75rem',
            }}>
              <KeyRound size={18} aria-hidden="true" />
            </div>
            <h3 id="recover-title" style={{ margin: 0 }}>Recuperar contraseña</h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Te enviaremos un enlace a tu correo
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem' }}
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{
                width: '3.5rem', height: '3.5rem', borderRadius: '50%',
                background: 'var(--success-bg)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem',
              }}>
                <CheckCircle2 size={24} style={{ color: 'var(--success-text)' }} />
              </div>
              <h4 style={{ marginBottom: '0.5rem' }}>¡Correo enviado!</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Revisa tu bandeja de entrada en <strong>{correo}</strong>.
                Si no ves el correo, verifica la carpeta de spam.
              </p>
              <button className="btn btn-primary w-full" onClick={onClose}>
                Entendido
              </button>
            </div>
          ) : (
            <form onSubmit={handleSend} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="rec-correo">
                  Correo electrónico registrado
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} aria-hidden="true" style={{
                    position: 'absolute', left: '0.875rem', top: '50%',
                    transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none',
                  }} />
                  <input
                    ref={inputRef}
                    id="rec-correo" type="email"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="tuemail@veterinaria.com"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading} aria-busy={loading}>
                  {loading
                    ? <><div className="spinner" aria-hidden="true" /> Enviando...</>
                    : 'Enviar enlace'
                  }
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Página de Login ─────────────────────────────────────────────────────── */
export const Login = () => {
  const [correo,       setCorreo]       = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState('');
  const [isLoading,    setIsLoading]    = useState(false);
  const [showRecover,  setShowRecover]  = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!correo.trim()) { setError('Ingresa tu correo electrónico.'); return; }
    if (!password)      { setError('Ingresa tu contraseña.');         return; }
    setIsLoading(true);
    try {
      await login(correo, password);
      navigate('/');          // RootRedirect se encarga de redirigir por rol
    } catch (err) {
      setError(err.message || 'Correo o contraseña incorrectos.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {showRecover && <RecoverModal onClose={() => setShowRecover(false)} />}

      <div style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
      }}>
        {/* ── Panel izquierdo: foto difuminada ─────────────────────────── */}
        <div style={{
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}>
          {/* Foto de fondo */}
          <img
            src={COVER_URL}
            alt="Veterinaria VetCare"
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
              filter: 'blur(1px) brightness(0.55)',
              transform: 'scale(1.05)',
            }}
          />

          {/* Gradiente oscuro inferior */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(10,15,40,0.85) 0%, rgba(10,15,40,0.25) 60%, transparent 100%)',
          }} />

          {/* Texto sobre la foto */}
          <div style={{ position: 'relative', padding: '3rem', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: '3rem', height: '3rem', borderRadius: '0.75rem',
                background: 'linear-gradient(135deg, #3b82f6, #818cf8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Stethoscope size={22} />
              </div>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
                VetCare
              </span>
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 0.75rem', lineHeight: 1.2, color: '#fff' }}>
              El cuidado que tu mascota merece
            </h2>
            <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.75)', margin: 0, maxWidth: '380px', lineHeight: 1.7 }}>
              Gestión integral de citas, historial clínico y seguimiento personalizado para cada paciente.
            </p>

            {/* Chips informativos */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem', flexWrap: 'wrap' }}>
              {['Caninos', 'Felinos', 'Aves', 'Exóticos'].map(tag => (
                <span key={tag} style={{
                  background: 'rgba(255,255,255,0.15)', color: '#fff',
                  padding: '0.5rem 1rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 500,
                  backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Panel derecho: formulario ──────────────────────────────────── */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: 'var(--surface-1)',
          overflowY: 'auto',
        }}>
          <div style={{ width: '100%', maxWidth: 480 }}>
            {/* Cabecera del formulario */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.375rem' }}>
                Bienvenido de vuelta
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', margin: 0 }}>
                Ingresa tus credenciales para continuar
              </p>
            </div>

            {/* Alerta de error */}
            {error && (
              <div className="alert alert-danger" role="alert" style={{ marginBottom: '1.25rem' }}>
                <AlertCircle size={16} className="alert-icon" aria-hidden="true" />
                <span>{error}</span>
                <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.7, display: 'flex', marginLeft: 'auto' }}>
                  <X size={14} aria-label="Cerrar" />
                </button>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="correo">Correo electrónico</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} aria-hidden="true" style={{
                    position: 'absolute', left: '0.875rem', top: '50%',
                    transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none',
                  }} />
                  <input
                    id="correo" type="email"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="tuemail@vetcare.com"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    autoComplete="email" autoFocus required
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                  <label className="form-label" htmlFor="password" style={{ margin: 0 }}>Contraseña</label>
                  <button
                    type="button"
                    onClick={() => setShowRecover(true)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--primary-600)', fontSize: '0.8125rem',
                      fontWeight: 500, padding: 0,
                    }}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} aria-hidden="true" style={{
                    position: 'absolute', left: '0.875rem', top: '50%',
                    transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none',
                  }} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password" required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    style={{
                      position: 'absolute', right: '0.75rem', top: '50%',
                      transform: 'translateY(-50%)', background: 'none',
                      border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                      padding: '0.25rem', display: 'flex', alignItems: 'center',
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
                style={{ padding: '0.8125rem', marginTop: '0.5rem', fontSize: '0.9375rem' }}
                disabled={isLoading} aria-busy={isLoading}
              >
                {isLoading
                  ? <><div className="spinner" aria-hidden="true" /> Verificando...</>
                  : 'Ingresar al sistema'
                }
              </button>
            </form>

            {/* Divisor */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              margin: '2rem 0',
            }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                ¿Eres cliente nuevo?
              </span>
              <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
            </div>

            {/* Botón registro cliente */}
            <Link
              to="/registro"
              className="btn btn-secondary w-full"
              style={{ padding: '0.75rem', fontSize: '0.9375rem', textAlign: 'center', display: 'flex', justifyContent: 'center' }}
            >
              Crear cuenta de cliente
            </Link>

            {/* Nota informativa */}
            <p style={{
              fontSize: '0.8125rem', color: 'var(--text-muted)',
              textAlign: 'center', marginTop: '1.5rem', lineHeight: 1.6,
            }}>
              Las cuentas de veterinario o administrador son creadas por el equipo de la clínica.
            </p>
          </div>
        </div>
      </div>

      {/* Responsive: en móviles una sola columna */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="position: relative; overflow: hidden"] {
            min-height: 260px;
          }
        }
      `}</style>
    </>
  );
};
