import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { CanvasRevealEffect } from '../components/ui/sign-in-flow-1';

function GoogleSignInButton({ onSuccess, onError, loading }) {
  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={onSuccess}
        onError={onError}
        useOneTap={false}
        theme="filled_black"
        shape="pill"
        size="large"
        text={loading ? 'signin_with' : 'continue_with'}
        width="384"
      />
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const googleClientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    '75114719261-n2f50sgmafqju6739nuo0lggpne51b5a.apps.googleusercontent.com';

  const handleGoogleSuccess = async (tokenResponse) => {
    const googleToken = tokenResponse?.access_token || tokenResponse?.credential;

    if (!googleToken) {
      setError('Google sign-in did not return a usable credential.');
      return;
    }

    setError('');
    setGoogleLoading(true);

    try {
      const res = await api.post('/auth/google', { idToken: googleToken });
      login(res.data);
      navigate('/dashboard');
    } catch (err) {
      if (!err.response) {
        setError('Could not reach the server. Check the Render CORS origin and Google env setup.');
      } else {
        setError(err.response?.data?.message || 'Google sign-in failed');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const creds = {
      investor: ['investor@demo.com', 'investor123'],
      advisor: ['advisor@demo.com', 'advisor123'],
      analyst: ['analyst@demo.com', 'analyst123'],
      admin: ['admin@mutualfund.com', 'admin123'],
    };
    setEmail(creds[role][0]);
    setPassword(creds[role][1]);
  };

  return (
    <div className="relative flex w-full flex-col min-h-screen items-center justify-center overflow-hidden" style={{ background: '#0a0e1a' }} id="login-page">
      {/* Animated dot matrix background */}
      <div className="absolute inset-0 z-0">
        <CanvasRevealEffect
          animationSpeed={3}
          containerClassName="bg-transparent"
          colors={[
            [255, 255, 255],
            [255, 255, 255],
          ]}
          dotSize={6}
          reverse={false}
        />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at center, rgba(30, 27, 75, 1) 0%, transparent 100%)' }} />
        <div className="absolute top-0 left-0 right-0 h-1/3" style={{ background: 'linear-gradient(to bottom, #0a0e1a, transparent)' }} />
      </div>

      {/* Form content */}
      <div className="relative z-10 w-full max-w-sm mx-auto px-4">
        <div className="space-y-6 text-center">
          {/* Heading */}
          <div className="space-y-1">
            <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white">Welcome Back</h1>
            <p className="text-[1.25rem] text-white/50 font-light">Sign in to InvestWise</p>
          </div>

          {error && (
            <div className="rounded-full py-2 px-4 border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Google Sign-in Button */}
          <div className="space-y-2">
            <GoogleOAuthProvider clientId={googleClientId}>
              <GoogleSignInButton
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google sign-in failed')}
                loading={googleLoading}
              />
            </GoogleOAuthProvider>
            {googleLoading && (
              <p className="text-xs text-white/50">Signing in with Google...</p>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-white/40 text-sm">or</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full backdrop-blur-[1px] text-white border border-white/10 rounded-full py-3 px-5 focus:outline-none focus:border-white/30 bg-transparent text-center placeholder:text-white/30"
              />
            </div>

            <div className="relative">
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full backdrop-blur-[1px] text-white border border-white/10 rounded-full py-3 px-5 focus:outline-none focus:border-white/30 bg-transparent text-center placeholder:text-white/30"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-white text-black font-medium py-3 hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo accounts divider */}
          <div className="flex items-center gap-4">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-white/40 text-sm">or try a demo account</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          {/* Demo buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button className="backdrop-blur-[2px] bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 rounded-full py-2 px-3 text-sm transition-colors" onClick={() => fillDemo('investor')}>👤 Investor</button>
            <button className="backdrop-blur-[2px] bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 rounded-full py-2 px-3 text-sm transition-colors" onClick={() => fillDemo('advisor')}>🎓 Advisor</button>
            <button className="backdrop-blur-[2px] bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 rounded-full py-2 px-3 text-sm transition-colors" onClick={() => fillDemo('analyst')}>📊 Analyst</button>
            <button className="backdrop-blur-[2px] bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 rounded-full py-2 px-3 text-sm transition-colors" onClick={() => fillDemo('admin')}>⚙️ Admin</button>
          </div>

          {/* Register link */}
          <p className="text-sm text-white/40 pt-4">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="underline text-white/60 hover:text-white/80 transition-colors">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
