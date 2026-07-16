import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await api.post('/auth/forgot-password', { email }); setSent(true); } catch { setSent(true); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/"><span className="text-3xl font-extrabold text-primary">Ani</span><span className="text-3xl font-extrabold text-secondary">Living</span></Link>
          <h1 className="text-2xl font-bold text-text mt-6 mb-2">Forgot Password?</h1>
          <p className="text-text-muted text-sm">Enter your email to receive a reset link</p>
        </div>
        <div className="bg-white rounded-2xl shadow-soft p-8">
          {sent ? (
            <div className="text-center py-4"><span className="text-5xl block mb-4">📧</span><p className="text-text font-medium mb-2">Check Your Email</p><p className="text-sm text-text-muted">If an account exists with that email, we've sent a password reset link.</p><Link to="/login" className="btn-primary inline-flex mt-6">Back to Login</Link></div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="text-sm font-medium text-text-light mb-1 block">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:border-primary focus:outline-none" /></div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-50">{loading ? 'Sending...' : 'Send Reset Link'}</button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
export default ForgotPasswordPage;

export const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8"><Link to="/"><span className="text-3xl font-extrabold text-primary">Ani</span><span className="text-3xl font-extrabold text-secondary">Living</span></Link><h1 className="text-2xl font-bold text-text mt-6">Reset Password</h1></div>
        <div className="bg-white rounded-2xl shadow-soft p-8">
          {done ? (<div className="text-center"><span className="text-5xl block mb-4">✅</span><p className="font-medium text-text mb-4">Password reset successfully!</p><Link to="/login" className="btn-primary">Login Now</Link></div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setDone(true); }} className="space-y-4">
              <div><label className="text-sm font-medium text-text-light mb-1 block">New Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:border-primary focus:outline-none" /></div>
              <button type="submit" className="btn-primary w-full py-3">Reset Password</button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
