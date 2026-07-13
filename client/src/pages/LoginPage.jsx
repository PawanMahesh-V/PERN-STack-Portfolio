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
    <div className="login-loading">
      <div className="loader" />
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
    <div className="login-page">
      {/* Background orbs */}
      <div className="orbs-container">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <motion.div
        className="login-card"
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}>

        <div className="login-logo">
          <Icon icon="shield-halved" />
        </div>

        <h1 className="login-title">Admin Access</h1>
        <p className="login-subtitle">
          <Icon icon="lock" /> Restricted — authorised personnel only
        </p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">
              <Icon icon="envelope" /> Email
            </label>
            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className="form-input"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password" className="form-label">
              <Icon icon="lock" /> Password
            </label>
            <div className="login-pw-wrap">
              <input
                id="login-password"
                type={show ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className="form-input"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="login-eye-btn"
                onClick={() => setShow(s => !s)}
                aria-label={show ? 'Hide password' : 'Show password'}>
                <Icon icon={show ? 'eye-slash' : 'eye'} />
              </button>
            </div>
          </div>

          {error && (
            <motion.div
              className="login-error"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert">
              <Icon icon="triangle-exclamation" /> {error}
            </motion.div>
          )}

          <motion.button
            id="login-submit"
            type="submit"
            className="login-submit"
            disabled={loading}
            whileHover={!loading ? { scale: 1.02 } : {}}
            whileTap={!loading   ? { scale: 0.98 } : {}}>
            {loading
              ? <><Icon icon="spinner" spin /> Authenticating…</>
              : <><Icon icon="arrow-right" /> Access Dashboard</>}
          </motion.button>
        </form>

        <Link to="/" className="login-back">
          <Icon icon="arrow-left" /> Back to portfolio
        </Link>
      </motion.div>
    </div>
  );
}
