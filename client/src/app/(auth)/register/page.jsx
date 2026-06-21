'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth }   from '../../../context/AuthContext';
import api           from '../../../lib/api';
import toast         from 'react-hot-toast';
import { Cloud }     from 'lucide-react';

export default function RegisterPage() {
  const [form,    setForm]    = useState({ name: '', email: '', password: '', role: 'editor' });
  const [loading, setLoading] = useState(false);
  const { login }  = useAuth();
  const router     = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.token, res.data.user);
      toast.success('Account created!');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Cloud size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500 text-sm mt-1">Join Cloud DMS workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="label">Full Name</label>
            <input className="input-field" placeholder="John Doe" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
          <div><label className="label">Email</label>
            <input type="email" className="input-field" placeholder="you@company.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
          <div><label className="label">Password</label>
            <input type="password" className="input-field" placeholder="••••••••" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required /></div>
          <div>
            <label className="label">Role</label>
            <select className="input-field" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
              <option value="commenter">Commenter</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have account?{' '}
          <a href="/login" className="text-blue-600 font-medium hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  );
}