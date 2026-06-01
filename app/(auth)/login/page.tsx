'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Phone, Lock, Shield, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import { setToken } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'password' | 'otp'>('password');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) return toast.error('Please fill in all fields');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { phone, password });
      const { token, user } = res.data.data;
      setToken(token);
      toast.success(`Welcome back, ${user.name}! 👋`);
      
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Login failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phone) return toast.error('Enter your phone number');
    setLoading(true);
    try {
      await api.post('/auth/otp/send', { phone });
      setOtpSent(true);
      toast.success('OTP sent! Check the backend console.');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to send OTP';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return toast.error('Enter the OTP');
    setLoading(true);
    try {
      const res = await api.post('/auth/otp/verify', { phone, otp });
      const { token, user } = res.data.data;
      setToken(token);
      toast.success('Verified! Redirecting...');
      
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Invalid OTP';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-green-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500 shadow-glow mb-4">
            <svg viewBox="0 0 24 24" fill="none" className="w-9 h-9 text-white" stroke="currentColor" strokeWidth={2}>
              <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18 9l-5 5-2-2-4 4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-text-dark">InvestSlabs v2.0</h1>
          <p className="text-text-muted mt-1">Welcome back · Sign in to your account</p>
        </div>

        {/* Demo tip */}
        <div className="mb-4 p-4 rounded-2xl bg-white border border-gray-200 shadow-sm text-slate-700">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            🔑 Demo Credentials
          </p>
          <div className="text-xs text-slate-600 mt-2 space-y-1">
            <p>
              <strong>Admin:</strong> Phone: <span className="font-mono font-bold text-gray-900">9876543210</span> | Password: <span className="font-mono font-bold text-gray-900">Test@1234</span>
            </p>
            <p>
              <strong>User:</strong> Phone: <span className="font-mono font-bold text-gray-900">9812345678</span> | Password: <span className="font-mono font-bold text-gray-900">Test@1234</span>
            </p>
          </div>
        </div>

        <div className="card shadow-md bg-white border border-gray-100 rounded-2xl p-6">
          {/* Mode tabs */}
          <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
            <button
              id="tab-password"
              onClick={() => setMode('password')}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                mode === 'password' ? 'bg-white shadow-sm text-primary-700 font-bold' : 'text-text-muted hover:text-gray-700'
              }`}
            >
              Password
            </button>
            <button
              id="tab-otp"
              onClick={() => setMode('otp')}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                mode === 'otp' ? 'bg-white shadow-sm text-primary-700 font-bold' : 'text-text-muted hover:text-gray-700'
              }`}
            >
              OTP Login
            </button>
          </div>

          {mode === 'password' ? (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-text-dark mb-1.5">
                  Mobile Number
                </label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-text-muted font-medium">
                    +91
                  </span>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={10}
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-dark mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button id="login-btn" type="submit" className="w-full h-12 text-base rounded-xl font-bold bg-primary-600 hover:bg-primary-700 text-white">
                Sign In <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="otp-phone" className="block text-sm font-medium text-text-dark mb-1.5">
                  Mobile Number
                </label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-text-muted font-medium">
                    +91
                  </span>
                  <Input
                    id="otp-phone"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={10}
                    className="flex-1"
                    disabled={otpSent}
                  />
                </div>
              </div>

              {!otpSent ? (
                <Button id="send-otp-btn" onClick={handleSendOtp} className="w-full h-12 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold" loading={loading}>
                  Send OTP
                </Button>
              ) : (
                <>
                  <div>
                    <label htmlFor="otp-input" className="block text-sm font-medium text-text-dark mb-1.5">
                      Enter OTP <span className="text-text-muted text-xs">(check backend console)</span>
                    </label>
                    <Input
                      id="otp-input"
                      type="text"
                      placeholder="6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                    />
                  </div>
                  <Button id="verify-otp-btn" onClick={handleVerifyOtp} className="w-full h-12 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold" loading={loading}>
                    Verify OTP
                  </Button>
                  <button
                    onClick={() => { setOtpSent(false); setOtp(''); }}
                    className="text-sm text-primary-600 hover:underline text-center w-full"
                  >
                    Resend OTP
                  </button>
                </>
              )}
            </div>
          )}

          <div className="mt-5 text-center">
            <p className="text-sm text-text-muted">
              New here?{' '}
              <Link href="/register" className="text-primary-600 font-semibold hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 mt-5 text-xs text-text-muted">
          <Shield className="w-3.5 h-3.5" />
          <span>256-bit SSL encrypted · Verified Security</span>
        </div>
      </div>
    </div>
  );
}
