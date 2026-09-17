// ═══════════════════════════════════════════════
// Skill Xchange — Login Page
// ═══════════════════════════════════════════════

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRightLeft, Mail, Lock, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import { users } from '../data/users';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loginAs } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = login(email, password);
    if (result.success) {
      toast.success('Welcome back!');
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Login failed');
    }
  };

  const handleDemoLogin = (userId) => {
    const result = loginAs(userId);
    if (result.success) {
      toast.success('Logged in as demo user');
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <ArrowRightLeft size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-surface-900">Skill Xchange</span>
          </Link>
          <h1 className="text-2xl font-bold text-surface-900 mb-1">Welcome back</h1>
          <p className="text-surface-500">Sign in to continue exchanging skills</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl shadow-surface-200/50 border border-surface-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
            >
              <LogIn size={16} />
              Sign In
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-surface-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-medium hover:underline">
              Sign up
            </Link>
          </div>
        </div>

        {/* Demo Quick Login */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg shadow-surface-200/50 border border-surface-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 text-white text-[10px] font-bold uppercase tracking-wider">
              Demo
            </div>
            <span className="text-sm font-medium text-surface-600">Quick login as any user</span>
          </div>
          <div className="space-y-1.5">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => handleDemoLogin(user.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-50 transition-all duration-150 group text-left"
              >
                <Avatar src={user.avatar} name={user.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-800 group-hover:text-primary-600 transition-colors">{user.name}</p>
                  <p className="text-xs text-surface-400">{user.title}</p>
                </div>
                <LogIn size={14} className="text-surface-300 group-hover:text-primary-500 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
