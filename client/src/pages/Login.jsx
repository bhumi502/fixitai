// pages/Login.jsx - Authentication Login Screen with Demo Quick-Fill
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wrench, Mail, Lock, AlertCircle, ArrowRight, Shield, UserCheck, WrenchIcon } from 'lucide-react';
import { DEMO_ACCOUNTS } from '../utils/constants';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email, password);
      if (res.success) {
        // Redirect according to role
        if (res.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (res.user.role === 'staff') {
          navigate('/staff/dashboard');
        } else {
          navigate(location.state?.from?.pathname || '/dashboard');
        }
      } else {
        setError(res.message || 'Invalid email or password');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for evaluation
  const handleQuickFill = (type) => {
    const creds = DEMO_ACCOUNTS[type];
    if (creds) {
      setEmail(creds.email);
      setPassword(creds.password);
      setError('');
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-indigo-500/20">
            <Wrench className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome to FixIt AI
          </h2>
          <p className="text-sm text-slate-500">
            Sign in to access your maintenance portal
          </p>
        </div>

        {/* Demo Accounts Quick-Fill Pill Bar */}
        <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-3.5 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 text-center">
            Demo Credentials (1-Click Auto Fill):
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className="px-2 py-1.5 bg-white hover:bg-indigo-600 hover:text-white text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200 transition-colors flex items-center justify-center gap-1 shadow-2xs"
            >
              <Shield className="w-3 h-3" />
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('staff')}
              className="px-2 py-1.5 bg-white hover:bg-indigo-600 hover:text-white text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200 transition-colors flex items-center justify-center gap-1 shadow-2xs"
            >
              <WrenchIcon className="w-3 h-3" />
              Staff
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('user')}
              className="px-2 py-1.5 bg-white hover:bg-indigo-600 hover:text-white text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200 transition-colors flex items-center justify-center gap-1 shadow-2xs"
            >
              <UserCheck className="w-3 h-3" />
              User
            </button>
          </div>
        </div>

        {/* Main Login Form Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@fixitai.demo"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
                Register as a New User
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
