import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Lock, Mail, ArrowRight, Loader2, Sparkles, Shield, User, Briefcase } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setLoading(true);
    try {
      await login(demoEmail, demoPassword);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/30">
            FP
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">
            FlowPilot <span className="text-indigo-400">AI</span>
          </span>
        </Link>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Sign in to your automation workspace
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Enter credentials or choose a 1-click Demo Role below
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-2xl">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Work Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-500/20 transition flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts for Hackathon Judges */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>1-Click Hackathon Demo Roles</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('employee@flowpilot.ai', 'Employee@123')}
                disabled={loading}
                className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700 hover:border-indigo-500/50 text-left transition flex flex-col justify-between"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white mb-0.5">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Employee</span>
                </div>
                <span className="text-[10px] text-slate-400">Alex Rivera</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('manager@flowpilot.ai', 'Manager@123')}
                disabled={loading}
                className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700 hover:border-indigo-500/50 text-left transition flex flex-col justify-between"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white mb-0.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Manager</span>
                </div>
                <span className="text-[10px] text-slate-400">Sarah Jenkins</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('admin@flowpilot.ai', 'Admin@123')}
                disabled={loading}
                className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700 hover:border-indigo-500/50 text-left transition flex flex-col justify-between"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white mb-0.5">
                  <Shield className="w-3.5 h-3.5 text-purple-400" />
                  <span>Admin</span>
                </div>
                <span className="text-[10px] text-slate-400">System Admin</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
