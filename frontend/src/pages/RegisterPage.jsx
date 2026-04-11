import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { getApiErrorMessage } from '../lib/apiErrors';
import AuthColdStartNotice from '../components/AuthColdStartNotice';
import { CanvasRevealEffect } from '../components/ui/sign-in-flow-1';

export default function RegisterPage({ showColdStartNotice = false }) {
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', fullName: '', role: 'INVESTOR' });
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState('register');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      setStep('verify');
      setMessage(res.data.message || 'Verification code sent to your email.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register/verify', {
        email: form.email,
        code: verificationCode,
      });
      login(res.data);
      navigate('/dashboard');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Verification failed'));
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      setMessage(res.data.message || 'Verification code sent again.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not resend verification code'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-start overflow-x-hidden overflow-y-auto px-4 py-10 sm:justify-center sm:px-6 sm:py-14" style={{ background: '#0a0e1a' }} id="register-page">
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
            <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white">
              {step === 'register' ? 'Create Account' : 'Verify Email'}
            </h1>
            <p className="text-[1.25rem] font-light text-white/50">
              {step === 'register' ? 'Join InvestWise today' : 'Enter the 6-digit code sent to your email'}
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

          {step === 'register' ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <input
                id="fullName"
                name="fullName"
                placeholder="Full Name"
                value={form.fullName}
                onChange={handleChange}
                required
                className="w-full rounded-full border border-white/10 bg-transparent px-5 py-3 text-center text-white backdrop-blur-[1px] placeholder:text-white/30 focus:border-white/30 focus:outline-none"
              />

              <input
                id="reg-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full rounded-full border border-white/10 bg-transparent px-5 py-3 text-center text-white backdrop-blur-[1px] placeholder:text-white/30 focus:border-white/30 focus:outline-none"
              />

              <input
                id="reg-password"
                name="password"
                type="password"
                placeholder="Password (min 6 characters)"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full rounded-full border border-white/10 bg-transparent px-5 py-3 text-center text-white backdrop-blur-[1px] placeholder:text-white/30 focus:border-white/30 focus:outline-none"
              />

              <input
                id="reg-confirm-password"
                name="confirmPassword"
                type="password"
                placeholder="Confirm password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full rounded-full border border-white/10 bg-transparent px-5 py-3 text-center text-white backdrop-blur-[1px] placeholder:text-white/30 focus:border-white/30 focus:outline-none"
              />
              <p className="text-center text-xs text-white/45">Passwords are case-sensitive. Use the exact same casing when you sign in later.</p>

              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full appearance-none rounded-full border border-white/10 bg-transparent px-5 py-3 text-center text-white backdrop-blur-[1px] focus:border-white/30 focus:outline-none"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff80' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25rem' }}
              >
                <option value="INVESTOR" style={{ background: '#1a0a2e', color: '#fff' }}>Investor</option>
                <option value="ADVISOR" style={{ background: '#1a0a2e', color: '#fff' }}>Financial Advisor</option>
                <option value="ANALYST" style={{ background: '#1a0a2e', color: '#fff' }}>Data Analyst</option>
              </select>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-white py-3 font-medium text-black transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Sending code...' : 'Create Account'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <input
                type="text"
                value={form.email}
                readOnly
                className="w-full rounded-full border border-white/10 bg-white/5 px-5 py-3 text-center text-white/70"
              />

              <input
                id="verification-code"
                type="text"
                inputMode="numeric"
                placeholder="6-digit verification code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                className="w-full rounded-full border border-white/10 bg-transparent px-5 py-3 text-center text-white tracking-[0.35em] backdrop-blur-[1px] placeholder:text-white/30 focus:border-white/30 focus:outline-none"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-white py-3 font-medium text-black transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify and Continue'}
              </button>

              <button
                type="button"
                onClick={resendCode}
                disabled={loading}
                className="w-full rounded-full border border-white/15 bg-white/5 py-3 font-medium text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Resend Code
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('register');
                  setVerificationCode('');
                  setMessage('');
                  setError('');
                }}
                className="w-full text-sm text-white/60 underline transition-colors hover:text-white/80"
              >
                Use a different email
              </button>
            </form>
          )}

          <p className="pt-4 text-sm text-white/40">
            Already have an account?{' '}
            <Link to="/login" className="text-white/60 underline transition-colors hover:text-white/80">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
