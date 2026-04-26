import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { getApiErrorMessage } from '../lib/apiErrors';
import AuthColdStartNotice from '../components/AuthColdStartNotice';
import { CanvasRevealEffect } from '../components/ui/sign-in-flow-1';

function GoogleSignInButton({ onSuccess, onError, loading }) {
  return (
    <div className="mx-auto w-full" style={{ maxWidth: '384px' }}>
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
    </div>
  );
}

const LOGIN_CREDENTIAL_ERROR = 'Invalid email or password.';
const LOGIN_CAPTCHA_ERROR = 'Captcha is wrong. Please try again.';

function getLoginErrorMessage(error) {
  const message = getApiErrorMessage(error, LOGIN_CREDENTIAL_ERROR);
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes('captcha')) {
    return LOGIN_CAPTCHA_ERROR;
  }

  if (
    normalizedMessage.includes('invalid credentials') ||
    normalizedMessage.includes('invalid email or password') ||
    normalizedMessage.includes('user not found')
  ) {
    return LOGIN_CREDENTIAL_ERROR;
  }

  return message || LOGIN_CREDENTIAL_ERROR;
}

export default function LoginPage({ showColdStartNotice = false }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [captcha, setCaptcha] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const googleClientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    '75114719261-n2f50sgmafqju6739nuo0lggpne51b5a.apps.googleusercontent.com';

  const fetchCaptcha = async ({ clearError = true } = {}) => {
    if (clearError) {
      setError('');
    }
    setCaptchaLoading(true);
    try {
      const res = await api.get('/auth/captcha');
      const challenge = res?.data?.data;
      if (!challenge?.captchaId || !challenge?.imageData) {
        throw new Error('Malformed captcha response');
      }
      setCaptcha(challenge);
      setCaptchaCode('');
    } catch (err) {
      setCaptcha(null);
      setError(getApiErrorMessage(err, 'Could not load captcha. Check that the backend URL is reachable.'));
    } finally {
      setCaptchaLoading(false);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

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
        setError(getApiErrorMessage(err, 'Google sign-in failed'));
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
      const res = await api.post('/auth/login', {
        email,
        password,
        captchaId: captcha?.captchaId,
        captchaCode,
      });
      login(res.data);
      navigate('/dashboard');
    } catch (err) {
      setError(getLoginErrorMessage(err));
      fetchCaptcha({ clearError: false });
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
    <div className="relative flex min-h-screen w-full flex-col items-center justify-start overflow-x-hidden overflow-y-auto px-4 py-10 sm:justify-center sm:px-6 sm:py-14" style={{ background: '#0a0e1a' }} id="login-page">
      <AuthColdStartNotice shouldOpen={showColdStartNotice} />

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

      <div className="relative z-10 mx-auto w-full max-w-sm">
        <div className="space-y-6 text-center">
          <div className="space-y-1">
            <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white">Welcome Back</h1>
            <p className="text-[1.25rem] font-light text-white/50">Sign in to InvestWise</p>
          </div>

          {error && (
            <div className="rounded-3xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
              {error}
            </div>
          )}

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

          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-sm text-white/40">or</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-full border border-white/10 bg-transparent px-5 py-3 text-center text-white backdrop-blur-[1px] placeholder:text-white/30 focus:border-white/30 focus:outline-none"
            />

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-full border border-white/10 bg-transparent px-5 py-3 text-center text-white backdrop-blur-[1px] placeholder:text-white/30 focus:border-white/30 focus:outline-none"
            />
            <p className="text-center text-xs text-white/45">Passwords are case-sensitive.</p>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-[2px]">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-white/70">Security check</span>
                <button
                  type="button"
                  onClick={fetchCaptcha}
                  className="text-xs text-white/60 underline transition-colors hover:text-white"
                >
                  Refresh
                </button>
              </div>

              <div className="mb-3 overflow-hidden rounded-2xl border border-white/10 bg-[#111827]">
                {captchaLoading ? (
                  <div className="flex h-[60px] items-center justify-center text-sm text-white/50">Loading captcha...</div>
                ) : (
                  captcha?.imageData && <img src={captcha.imageData} alt="Captcha" className="h-[60px] w-full object-cover" />
                )}
              </div>

              <input
                id="captcha"
                type="text"
                placeholder="Type the characters above"
                value={captchaCode}
                onChange={(e) => setCaptchaCode(e.target.value.toUpperCase())}
                required
                className="w-full rounded-full border border-white/10 bg-transparent px-5 py-3 text-center text-white uppercase placeholder:text-white/30 focus:border-white/30 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || captchaLoading || !captcha?.captchaId}
              className="w-full rounded-full bg-white py-3 font-medium text-black transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-sm text-white/40">
            Forgot your password?{' '}
            <Link to="/forgot-password" className="text-white/60 underline transition-colors hover:text-white/80">
              Reset it here
            </Link>
          </p>

          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-sm text-white/40">or try a demo account</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button type="button" className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white" onClick={() => fillDemo('investor')}>Investor</button>
            <button type="button" className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white" onClick={() => fillDemo('advisor')}>Advisor</button>
            <button type="button" className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white" onClick={() => fillDemo('analyst')}>Analyst</button>
            <button type="button" className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white" onClick={() => fillDemo('admin')}>Admin</button>
          </div>

          <p className="pt-4 text-sm text-white/40">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-white/60 underline transition-colors hover:text-white/80">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
