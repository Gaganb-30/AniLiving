import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPencilAlt } from 'react-icons/hi';
import Seo from '../../components/seo/Seo';
// Google sign-in is commented out per requirement; uncomment when ready to re-enable
// import GoogleSignInButton from '../../components/auth/GoogleSignInButton';
import { useAuth } from '../../hooks/useAuth';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { sendOtp, verifyOtp } = useAuth();

  // Step in OTP flow: 'email' or 'verify'
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Resend OTP countdown timer
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpInputRefs = useRef([]);

  // Destination after login
  const redirectTo = searchParams.get('redirect') || location.state?.from || '/dashboard';

  // Decrement countdown timer every second
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Focus the first OTP box when entering the 'verify' step
  useEffect(() => {
    if (step === 'verify' && otpInputRefs.current[0]) {
      otpInputRefs.current[0].focus();
    }
  }, [step]);

  // If already logged in, redirect immediately
  if (isAuthenticated) {
    return <Navigate to={redirectTo} state={location.state} replace />;
  }

  // Format seconds into MM:SS
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // ---------------------------------------------------------------------------
  // Step 1: Request OTP
  // ---------------------------------------------------------------------------
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setEmailError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setSubmitting(true);
    try {
      const data = await sendOtp(cleanEmail);
      const timeoutSecs = Math.max(30, (data?.otpTimeoutMinutes || 1) * 60);
      setResendCooldown(timeoutSecs);
      setStep('verify');
      setOtpDigits(['', '', '', '', '', '']);
      setOtpError('');
    } catch (err) {
      setEmailError(err.response?.data?.message || err.message || 'Failed to send OTP.');
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Resend OTP
  // ---------------------------------------------------------------------------
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || submitting) return;
    setSubmitting(true);
    setOtpError('');
    try {
      const cleanEmail = email.trim().toLowerCase();
      const data = await sendOtp(cleanEmail);
      const timeoutSecs = Math.max(30, (data?.otpTimeoutMinutes || 1) * 60);
      setResendCooldown(timeoutSecs);
      setOtpDigits(['', '', '', '', '', '']);
      if (otpInputRefs.current[0]) {
        otpInputRefs.current[0].focus();
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || err.message || 'Failed to resend OTP.');
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Step 2: Handle OTP input & auto-focus
  // ---------------------------------------------------------------------------
  const handleOtpChange = (index, value) => {
    const cleanVal = value.replace(/\D/g, '');
    if (!cleanVal && value !== '') return;

    const newDigits = [...otpDigits];

    // Handle paste of multiple digits
    if (cleanVal.length > 1) {
      const pasted = cleanVal.slice(0, 6).split('');
      pasted.forEach((char, i) => {
        if (i < 6) newDigits[i] = char;
      });
      setOtpDigits(newDigits);
      const nextIdx = Math.min(pasted.length, 5);
      otpInputRefs.current[nextIdx]?.focus();
      if (pasted.length === 6) {
        submitVerification(newDigits.join(''));
      }
      return;
    }

    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);

    // Auto-advance to next input box
    if (cleanVal && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (cleanVal && index === 5 && newDigits.every((d) => d !== '')) {
      submitVerification(newDigits.join(''));
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // ---------------------------------------------------------------------------
  // Verify OTP & complete login
  // ---------------------------------------------------------------------------
  const submitVerification = async (otpCode) => {
    const code = otpCode || otpDigits.join('');
    if (code.length !== 6) {
      setOtpError('Please enter all 6 digits of the OTP');
      return;
    }

    setSubmitting(true);
    setOtpError('');
    try {
      const cleanEmail = email.trim().toLowerCase();
      const user = await verifyOtp(cleanEmail, code);
      const target = user?.role === 'admin' && redirectTo === '/dashboard' ? '/admin' : redirectTo;
      navigate(target, { replace: true, state: location.state });
    } catch (err) {
      setOtpError(err.response?.data?.message || err.message || 'Incorrect OTP. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="container-custom section-padding">
      <Seo
        title="Sign In"
        description="Sign in with your email to view orders, manage addresses, or complete your checkout."
        canonical="/login"
        noindex
      />

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <AnimatePresence mode="wait">
          {step === 'email' ? (
            <motion.div
              key="step-email"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="auth-head">
                <span className="auth-emoji">🐾</span>
                <h1>Sign In or Sign Up</h1>
                <p>
                  {redirectTo.includes('checkout')
                    ? 'Quick verification to proceed to your order'
                    : 'Enter your email to receive a one-time password.'}
                </p>
              </div>

              <form className="auth-form" onSubmit={handleSendOtp}>
                <div className="form-field">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError('');
                    }}
                  />
                  {emailError && <span className="form-error">{emailError}</span>}
                </div>

                <button
                  type="submit"
                  className="btn-primary auth-submit"
                  disabled={submitting || !email.trim()}
                >
                  {submitting ? 'Sending OTP…' : 'Get OTP'}
                </button>
              </form>

              {/* Google sign-in commented out per user request
              <div className="auth-divider"><span>or</span></div>
              <GoogleSignInButton onCredential={handleGoogle} text="signin_with" />
              */}

              <div className="auth-helper-note">
                🔒 We never share your email.
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step-verify"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="auth-head">
                <span className="auth-emoji">✉️</span>
                <h1>Verify Code</h1>
                <div className="auth-phone-display">
                  <span>Sent to <strong>{email}</strong></span>
                  <button
                    type="button"
                    className="auth-change-phone-btn"
                    onClick={() => {
                      setStep('email');
                      setOtpError('');
                    }}
                    title="Change email address"
                  >
                    <HiPencilAlt /> Edit
                  </button>
                </div>
              </div>

              <form
                className="auth-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  submitVerification();
                }}
              >
                <div className="form-field">
                  <label>Enter 6-digit verification code</label>
                  <div className="otp-inputs-row">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpInputRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        className="otp-digit-box"
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        autoComplete={idx === 0 ? 'one-time-code' : 'off'}
                      />
                    ))}
                  </div>
                  {otpError && <span className="form-error text-center">{otpError}</span>}
                </div>

                <button
                  type="submit"
                  className="btn-primary auth-submit"
                  disabled={submitting || otpDigits.some((d) => !d)}
                >
                  {submitting ? 'Verifying…' : 'Verify & Continue'}
                </button>
              </form>

              <div className="auth-resend-row">
                {resendCooldown > 0 ? (
                  <span className="resend-countdown">
                    Resend OTP in <strong>{formatTimer(resendCooldown)}</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    className="resend-btn"
                    onClick={handleResendOtp}
                    disabled={submitting}
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <div className="auth-footer-links">
                <button
                  type="button"
                  className="auth-link-subtle"
                  onClick={() => {
                    setStep('email');
                    setOtpError('');
                  }}
                >
                  ← Back to email entry
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default LoginPage;
