import { useState, useCallback } from 'react';
import { Link, useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  HiOutlineMail, HiOutlineLockClosed, HiOutlineUser,
  HiOutlinePhone, HiOutlineEye, HiOutlineEyeOff,
} from 'react-icons/hi';
import Seo from '../../components/seo/Seo';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton';
import { useAuth } from '../../hooks/useAuth';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { register: registerUser, loginWithGoogle } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      await registerUser({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        phone: values.phone || undefined,
      });
      navigate(redirectTo, { replace: true });
    } catch {
      setSubmitting(false);
    }
  };

  const handleGoogle = useCallback(async (credential) => {
    setSubmitting(true);
    try {
      await loginWithGoogle(credential);
      navigate(redirectTo, { replace: true });
    } catch {
      setSubmitting(false);
    }
  }, [loginWithGoogle, navigate, redirectTo]);

  if (isAuthenticated) return <Navigate to={redirectTo} replace />;

  return (
    <div className="container-custom section-padding">
      <Seo
        title="Create your account"
        description="Create an AniLiving account for faster checkout, order tracking and a saved wishlist."
        canonical="/register"
        noindex
      />

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="auth-head">
          <span className="auth-emoji">🐶</span>
          <h1>Create your account</h1>
          <p>Join AniLiving for faster checkout and exclusive offers.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="firstName">First name</label>
              <div className="input-with-icon">
                <HiOutlineUser />
                <input
                  id="firstName"
                  autoComplete="given-name"
                  placeholder="Priya"
                  {...register('firstName', { required: 'First name is required' })}
                />
              </div>
              {errors.firstName && <span className="form-error">{errors.firstName.message}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="lastName">Last name</label>
              <div className="input-with-icon">
                <HiOutlineUser />
                <input
                  id="lastName"
                  autoComplete="family-name"
                  placeholder="Sharma"
                  {...register('lastName', { required: 'Last name is required' })}
                />
              </div>
              {errors.lastName && <span className="form-error">{errors.lastName.message}</span>}
            </div>
          </div>

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
            <label htmlFor="phone">Mobile number <span className="form-optional">(recommended)</span></label>
            <div className="input-with-icon">
              <HiOutlinePhone />
              <input
                id="phone"
                inputMode="numeric"
                maxLength={10}
                autoComplete="tel"
                placeholder="9876543210"
                {...register('phone', {
                  pattern: { value: /^[6-9]\d{9}$/, message: 'Enter a valid 10-digit mobile number' },
                })}
              />
            </div>
            {errors.phone && <span className="form-error">{errors.phone.message}</span>}
            <span className="form-hint">We use this for delivery updates only.</span>
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <HiOutlineLockClosed />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Use at least 8 characters' },
                })}
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

          <div className="form-field">
            <label htmlFor="confirmPassword">Confirm password</label>
            <div className="input-with-icon">
              <HiOutlineLockClosed />
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => value === password || 'Passwords do not match',
                })}
              />
            </div>
            {errors.confirmPassword && <span className="form-error">{errors.confirmPassword.message}</span>}
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </button>

          <p className="auth-terms">
            By creating an account you agree to our{' '}
            <Link to="/terms-and-conditions">Terms &amp; Conditions</Link> and{' '}
            <Link to="/privacy-policy">Privacy Policy</Link>.
          </p>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <GoogleSignInButton onCredential={handleGoogle} text="signup_with" />

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
