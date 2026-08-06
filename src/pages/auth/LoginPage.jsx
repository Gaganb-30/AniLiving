import { useState, useCallback } from 'react';
import { Link, useNavigate, useLocation, useSearchParams, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import Seo from '../../components/seo/Seo';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton';
import { useAuth } from '../../hooks/useAuth';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { login, loginWithGoogle } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  // Where to land after signing in: ?redirect=, router state, or the dashboard
  const redirectTo = searchParams.get('redirect') || location.state?.from || '/dashboard';

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const user = await login(values);
      navigate(user.role === 'admin' && redirectTo === '/dashboard' ? '/admin' : redirectTo, { replace: true });
    } catch {
      setSubmitting(false);
    }
  };

  const handleGoogle = useCallback(async (credential) => {
    setSubmitting(true);
    try {
      const user = await loginWithGoogle(credential);
      navigate(user.role === 'admin' && redirectTo === '/dashboard' ? '/admin' : redirectTo, { replace: true });
    } catch {
      setSubmitting(false);
    }
  }, [loginWithGoogle, navigate, redirectTo]);

  if (isAuthenticated) return <Navigate to={redirectTo} replace />;

  return (
    <div className="container-custom section-padding">
      <Seo
        title="Sign in"
        description="Sign in to your AniLiving account to track orders, manage your wishlist and check out faster."
        canonical="/login"
        noindex
      />

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="auth-head">
          <span className="auth-emoji">🐾</span>
          <h1>Welcome back</h1>
          <p>Sign in to continue shopping for your best friend.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-field">
            <label htmlFor="email">Email address</label>
            <div className="input-with-icon">
              <HiOutlineMail />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
                })}
              />
            </div>
            {errors.email && <span className="form-error">{errors.email.message}</span>}
          </div>

          <div className="form-field">
            <div className="form-label-row">
              <label htmlFor="password">Password</label>
              <Link to="/forgot-password" className="auth-link-sm">Forgot password?</Link>
            </div>
            <div className="input-with-icon">
              <HiOutlineLockClosed />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Your password"
                {...register('password', { required: 'Password is required' })}
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
            {errors.password && <span className="form-error">{errors.password.message}</span>}
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <GoogleSignInButton onCredential={handleGoogle} text="signin_with" />

        <p className="auth-footer">
          New to AniLiving? <Link to={`/register${searchParams.get('redirect') ? `?redirect=${searchParams.get('redirect')}` : ''}`}>Create an account</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
