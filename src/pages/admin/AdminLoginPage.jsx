import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { HiOutlineLockClosed, HiOutlineMail, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import Seo from '../../components/seo/Seo';
import { useAuth } from '../../hooks/useAuth';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { adminLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If already authenticated as admin, go straight to /admin
  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    try {
      const loggedUser = await adminLogin({ email, password });
      if (loggedUser.role !== 'admin') {
        setError('Access denied. Administrator privileges required.');
        return;
      }
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid administrator credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-custom section-padding" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Seo title="Admin Portal" noindex />

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ width: '100%', maxWidth: 440 }}
      >
        <div className="auth-head">
          <span className="auth-emoji">🔐</span>
          <h1>Admin Portal</h1>
          <p>Sign in with your administrator credentials</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="adminEmail">Email Address</label>
            <div className="input-with-icon">
              <HiOutlineMail />
              <input
                id="adminEmail"
                type="email"
                autoComplete="email"
                placeholder="admin@aniliving.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="adminPassword">Password</label>
            <div className="input-with-icon">
              <HiOutlineLockClosed />
              <input
                id="adminPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                required
              />
              <button
                type="button"
                className="input-toggle"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
              </button>
            </div>
            {error && <span className="form-error">{error}</span>}
          </div>

          <button
            type="submit"
            className="btn-primary auth-submit"
            disabled={submitting}
          >
            {submitting ? 'Verifying…' : 'Sign in to Admin'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
