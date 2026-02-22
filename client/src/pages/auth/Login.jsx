import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', fullName: '' });

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (err) {
      toast.error('Google login failed. Try again.');
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmail(form.email, form.password);
        navigate('/', { replace: true });
      } else {
        await signUpWithEmail(form.email, form.password, form.fullName);
        toast.success('Account created! Check your email to verify.');
        setMode('login');
      }
    } catch (err) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-slate-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-center px-16 w-1/2 bg-primary-600">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <span className="text-primary-600 font-display font-bold text-lg">CS</span>
            </div>
            <span className="font-display font-bold text-3xl text-white">CampusSwap</span>
          </div>

          <h1 className="font-display font-bold text-5xl text-white leading-tight mb-6">
            Buy & Sell Within Your Campus
          </h1>
          <p className="text-primary-200 text-lg leading-relaxed mb-10">
            A verified-only marketplace for students to safely exchange furniture, electronics, and textbooks — all within campus.
          </p>

          <div className="space-y-4">
            {['✅ University email verified accounts only', '🛡️ Safe on-campus meetup scheduling', '♻️ Reduce campus waste, save money', '💬 In-app messaging — no strangers'].map((item) => (
              <div key={item} className="flex items-center gap-3 text-white">
                <span className="text-lg">{item.split(' ')[0]}</span>
                <span className="text-primary-100">{item.split(' ').slice(1).join(' ')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-display font-bold">CS</span>
            </div>
            <span className="font-display font-bold text-2xl text-slate-900">CampusSwap</span>
          </div>

          <h2 className="font-display font-bold text-3xl text-slate-900 mb-2">
            {mode === 'login' ? 'Welcome back 👋' : 'Join CampusSwap'}
          </h2>
          <p className="text-slate-500 mb-8">
            {mode === 'login' ? "Sign in to your account" : "Create your student account"}
          </p>

          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full btn-secondary justify-center py-3 mb-6"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            Continue with Google (University Email)
          </button>

          <div className="relative flex items-center mb-6">
            <div className="flex-1 border-t border-slate-200" />
            <span className="px-3 text-xs text-slate-400">or with email</span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                  placeholder="Your full name"
                  className="input"
                  required
                />
              </div>
            )}
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="yourname@university.edu"
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                className="input"
                minLength={6}
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full justify-center py-3" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Please wait...
                </span>
              ) : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-primary-600 font-medium hover:underline"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
