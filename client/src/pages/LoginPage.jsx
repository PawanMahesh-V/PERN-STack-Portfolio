import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const { login, isAuth, loading: authLoading } = useAuth();
  const toast    = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from     = location.state?.from?.pathname || '/phantom/dashboard';

  const [form,    setForm]    = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [show,    setShow]    = useState(false);

  useEffect(() => {
    if (!authLoading && isAuth) navigate(from, { replace: true });
  }, [isAuth, authLoading, navigate, from]);

  if (authLoading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
      <div className="spinner spinner-lg" />
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast('Welcome back! 👋', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      style={styles.page}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
    >
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      <div style={styles.card} className="glass-card">
        {/* Logo */}
        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}>
            <Icon icon="shield-halved" style={{ fontSize: '1.6rem', color: '#fff' }} />
          </div>
        </div>

        <h1 style={styles.title}>Admin Access</h1>
        <p style={styles.subtitle}>
          <Icon icon="lock" style={{ marginRight: '0.4rem', fontSize: '0.75rem' }} />
          Restricted — authorised personnel only
        </p>

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              <Icon icon="envelope" style={{ marginRight: '0.4rem' }} /> Email
            </label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              <Icon icon="lock" style={{ marginRight: '0.4rem' }} /> Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={show ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••••••"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                autoComplete="current-password"
                style={{ paddingRight: '3rem' }}
                required
              />
              <button
                type="button"
                onClick={() => setShow(s => !s)}
                style={styles.eyeBtn}
                aria-label={show ? 'Hide password' : 'Show password'}
              >
                <Icon icon={show ? 'eye-slash' : 'eye'} />
              </button>
            </div>
          </div>

          {error && (
            <div style={styles.errorBox} role="alert">
              <Icon icon="triangle-exclamation" style={{ marginRight: '0.5rem' }} />
              {error}
            </div>
          )}

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary interactive"
            style={{ width: '100%', marginTop: '0.5rem', gap: '0.5rem' }}
            disabled={loading}
          >
            {loading
              ? <><Icon icon="spinner" spin /> Authenticating…</>
              : <><Icon icon="arrow-right" /> Access Dashboard</>}
          </button>
        </form>

        <Link to="/" style={styles.backLink} className="interactive">
          <Icon icon="arrow-left" style={{ marginRight: '0.4rem' }} />
          Back to portfolio
        </Link>
      </div>
    </motion.div>
  );
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '2rem', background: 'var(--bg-base)', position: 'relative', overflow: 'hidden',
  },
  blob1: {
    position: 'absolute', top: '-15%', right: '-10%', width: '600px', height: '600px',
    borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents: 'none',
  },
  blob2: {
    position: 'absolute', bottom: '-15%', left: '-10%', width: '500px', height: '500px',
    borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)', pointerEvents: 'none',
  },
  card: {
    position: 'relative', width: '100%', maxWidth: '420px', padding: '2.5rem',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
    animation: 'fadeInUp 0.5s ease',
  },
  logoWrap: { marginBottom: '0.5rem' },
  logoIcon: {
    width: '56px', height: '56px', background: 'var(--gradient-brand)', borderRadius: '16px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 8px 30px rgba(99,102,241,0.4)',
  },
  title:    { fontSize: '1.5rem', fontWeight: 800, margin: '0.5rem 0 0.15rem' },
  subtitle: { fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' },
  form:     { width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' },
  eyeBtn:   {
    position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.9rem',
  },
  errorBox: {
    padding: '0.75rem 1rem', background: 'rgba(248,113,113,0.1)',
    border: '1px solid rgba(248,113,113,0.3)', borderRadius: 'var(--r-sm)',
    color: '#f87171', fontSize: '0.85rem', display: 'flex', alignItems: 'center',
  },
  backLink: { marginTop: '1.25rem', fontSize: '0.82rem', color: 'var(--text-muted)', transition: 'color var(--t-base)' },
};
