import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { getApiErrorMessage } from '../lib/apiErrors';
import { CanvasRevealEffect } from '../components/ui/sign-in-flow-1';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [captcha, setCaptcha] = useState(null);
  const [captchaCode, setCaptchaCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchCaptcha = async () => {
    try {
      const res = await api.get('/auth/captcha');
      setCaptcha(res.data.data);
      setCaptchaCode('');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load captcha'));
    }
  };

  useEffect(() => {
    if (step === 'reset') {
      fetchCaptcha();
    }
  }, [step]);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await api.post('/auth/password-reset/request', { email });
      setMessage(res.data.message || 'If your account is eligible, a reset code has been sent.');
      setStep('reset');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not start password reset'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await api.post('/auth/password-reset/confirm', {
        email,
        code,
        captchaId: captcha?.captchaId,
        captchaCode,
        newPassword,
        confirmPassword,
      });
      setMessage(res.data.message || 'Password updated successfully.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not reset password'));
      fetchCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-start overflow-x-hidden overflow-y-auto px-4 py-10 sm:justify-center sm:px-6 sm:py-14" style={{ background: '#0a0e1a' }} id="forgot-password-page">
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
            <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white">Reset Password</h1>
            <p className="text-[1.25rem] font-light text-white/50">
              {step === 'request' ? 'We will send a code to your registered email' : 'Enter the code, solve the captcha, and choose a new password'}
            </p>
          </div>

          {message && (
            <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
              {message}
            </div>
          )}

          {error && (
            <div className="rounded-3xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
              {error}
            </div>
          )}

          {step === 'request' ? (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <input
                type="email"
                placeholder="Registered email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-full border border-white/10 bg-transparent px-5 py-3 text-center text-white backdrop-blur-[1px] placeholder:text-white/30 focus:border-white/30 focus:outline-none"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-white py-3 font-medium text-black transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Sending code...' : 'Send Reset Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <input
                type="email"
                value={email}
                readOnly
                className="w-full rounded-full border border-white/10 bg-white/5 px-5 py-3 text-center text-white/70"
              />

              <input
                type="text"
                inputMode="numeric"
                placeholder="6-digit reset code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full rounded-full border border-white/10 bg-transparent px-5 py-3 text-center text-white tracking-[0.35em] backdrop-blur-[1px] placeholder:text-white/30 focus:border-white/30 focus:outline-none"
              />

              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-[2px]">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm text-white/70">Captcha check</span>
                  <button
                    type="button"
                    onClick={fetchCaptcha}
                    className="text-xs text-white/60 underline transition-colors hover:text-white"
                  >
                    Refresh
                  </button>
                </div>

                <div className="mb-3 overflow-hidden rounded-2xl border border-white/10 bg-[#111827]">
                  {captcha?.imageData && <img src={captcha.imageData} alt="Captcha" className="h-[60px] w-full object-cover" />}
                </div>

                <input
                  type="text"
                  placeholder="Type the captcha text"
                  value={captchaCode}
                  onChange={(e) => setCaptchaCode(e.target.value.toUpperCase())}
                  required
                  className="w-full rounded-full border border-white/10 bg-transparent px-5 py-3 text-center text-white uppercase placeholder:text-white/30 focus:border-white/30 focus:outline-none"
                />
              </div>

              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-full border border-white/10 bg-transparent px-5 py-3 text-center text-white backdrop-blur-[1px] placeholder:text-white/30 focus:border-white/30 focus:outline-none"
              />

              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-full border border-white/10 bg-transparent px-5 py-3 text-center text-white backdrop-blur-[1px] placeholder:text-white/30 focus:border-white/30 focus:outline-none"
              />
              <p className="text-center text-xs text-white/45">Passwords are case-sensitive.</p>

              <button
                type="submit"
                disabled={loading || !captcha?.captchaId}
                className="w-full rounded-full bg-white py-3 font-medium text-black transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Updating password...' : 'Reset Password'}
              </button>
            </form>
          )}

          <p className="pt-4 text-sm text-white/40">
            Back to{' '}
            <Link to="/login" className="text-white/60 underline transition-colors hover:text-white/80">
              sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
