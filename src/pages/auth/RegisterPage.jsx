import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { setCredentials } from '../../redux/slices/authSlice';
import api from '../../services/api';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      dispatch(setCredentials(data.data));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  const updateField = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/"><span className="text-3xl font-extrabold text-primary">Ani</span><span className="text-3xl font-extrabold text-secondary">Living</span></Link>
          <h1 className="text-2xl font-bold text-text mt-6 mb-2">Create Account</h1>
          <p className="text-text-muted text-sm">Join the AniLiving family</p>
        </div>
        <div className="bg-white rounded-2xl shadow-soft p-8">
          {error && <div className="bg-error/10 text-error text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium text-text-light mb-1 block">First Name</label><input type="text" value={form.firstName} onChange={updateField('firstName')} required className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:border-primary focus:outline-none" /></div>
              <div><label className="text-sm font-medium text-text-light mb-1 block">Last Name</label><input type="text" value={form.lastName} onChange={updateField('lastName')} required className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:border-primary focus:outline-none" /></div>
            </div>
            <div><label className="text-sm font-medium text-text-light mb-1 block">Email</label><input type="email" value={form.email} onChange={updateField('email')} required className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:border-primary focus:outline-none" /></div>
            <div><label className="text-sm font-medium text-text-light mb-1 block">Phone</label><input type="tel" value={form.phone} onChange={updateField('phone')} className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:border-primary focus:outline-none" /></div>
            <div><label className="text-sm font-medium text-text-light mb-1 block">Password</label><input type="password" value={form.password} onChange={updateField('password')} required minLength={8} className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:border-primary focus:outline-none" placeholder="Min 8 characters" /></div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base disabled:opacity-50">{loading ? 'Creating account...' : 'Create Account'}</button>
          </form>
          <p className="text-center text-sm text-text-muted mt-6">Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link></p>
        </div>
      </motion.div>
    </div>
  );
};
export default RegisterPage;
