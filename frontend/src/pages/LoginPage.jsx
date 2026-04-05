import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { CanvasRevealEffect } from '../components/ui/sign-in-flow-1';

function GoogleSignInButton({ clientId, onSuccess, onError, loading }) {
  const triggerGoogleLogin = useGoogleLogin({
    flow: 'implicit',
    onSuccess,
    onError,
    ux_mode: 'popup',
  });

  return (
    <button
      type="button"
      onClick={() => triggerGoogleLogin()}
      disabled={loading}
      className="backdrop-blur-[2px] w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full py-3 px-4 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
    >
      <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      </svg>
      <span>{loading ? 'Connecting to Google...' : 'Continue with Google'}</span>
    </button>
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
    if (!tokenResponse?.access_token) {
      setError('Google sign-in did not return an access token.');
      return;
    }

    setError('');
    setGoogleLoading(true);

    try {
      const res = await api.post('/auth/google', { idToken: tokenResponse.access_token });
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
                clientId={googleClientId}
                onSuccess={handleGoogleSuccess}
                onError={(googleError) =>
                  setError(
                    googleError?.error_description ||
                      googleError?.error ||
                      'Google sign-in failed'
                  )
                }
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
