import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { setCredentials } from '../../redux/slices/authSlice';
import api from '../../services/api';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      dispatch(setCredentials(data.data));
      navigate(data.data.user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/"><span className="text-3xl font-extrabold text-primary">Ani</span><span className="text-3xl font-extrabold text-secondary">Living</span></Link>
          <h1 className="text-2xl font-bold text-text mt-6 mb-2">Welcome Back</h1>
          <p className="text-text-muted text-sm">Sign in to your account</p>
        </div>
        <div className="bg-white rounded-2xl shadow-soft p-8">
          {error && <div className="bg-error/10 text-error text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text-light mb-1 block">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:border-primary focus:outline-none transition-colors" placeholder="you@example.com" />
            </div>
            <div>
              <label className="text-sm font-medium text-text-light mb-1 block">Password</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:border-primary focus:outline-none transition-colors" placeholder="••••••••" />
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-text-light"><input type="checkbox" className="accent-primary" /> Remember me</label>
              <Link to="/forgot-password" className="text-primary font-medium hover:underline">Forgot password?</Link>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base disabled:opacity-50">{loading ? 'Signing in...' : 'Sign In'}</button>
          </form>
          <p className="text-center text-sm text-text-muted mt-6">Don't have an account? <Link to="/register" className="text-primary font-semibold hover:underline">Create one</Link></p>
        </div>
      </motion.div>
    </div>
  );
};
export default LoginPage;
