'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, ChevronRight, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import { setToken } from '@/lib/auth';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) setForm((prev) => ({ ...prev, referralCode: ref }));
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.password) return toast.error('Please fill in all required fields');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');

    setLoading(true);
    try {
      const payload: Record<string, string> = {
        name: form.name,
        phone: form.phone,
        password: form.password,
      };
      if (form.referralCode) payload.referralCode = form.referralCode;

      const res = await api.post('/auth/register', payload);
      setToken(res.data.data.token);
      toast.success(`Account created! Welcome, ${res.data.data.user.name}! 🎉`);
      router.push('/plans');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-green-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500 shadow-glow mb-4">
            <svg viewBox="0 0 24 24" fill="none" className="w-9 h-9 text-white" stroke="currentColor" strokeWidth={2}>
              <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18 9l-5 5-2-2-4 4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-text-dark">Create Account</h1>
          <p className="text-text-muted mt-1">Start your investment journey today</p>
        </div>

        <form onSubmit={handleSubmit} className="card shadow-card-hover space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-dark mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <Input id="name" name="name" placeholder="Rahul Sharma" value={form.name} onChange={handleChange} />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-text-dark mb-1.5">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <span className="flex items-center px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-text-muted font-medium">
                +91
              </span>
              <Input
                id="reg-phone"
                name="phone"
                type="tel"
                placeholder="10-digit number"
                value={form.phone}
                onChange={handleChange}
                maxLength={10}
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-text-dark mb-1.5">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                id="reg-password"
                name="password"
                type={showPass ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                className="pr-10"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-gray-700">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-dark mb-1.5">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="pr-10"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-gray-700">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="referralCode" className="block text-sm font-medium text-text-dark mb-1.5">
              Referral Code <span className="text-text-muted text-xs">(optional)</span>
            </label>
            <Input
              id="referralCode"
              name="referralCode"
              placeholder="e.g. RAHUL001"
              value={form.referralCode}
              onChange={handleChange}
              className="uppercase"
            />
          </div>

          <Button id="register-btn" type="submit" className="w-full h-12 text-base mt-2" loading={loading}>
            Create Account <ChevronRight className="w-4 h-4 ml-1" />
          </Button>

          <p className="text-sm text-text-muted text-center">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </form>

        <div className="flex items-center justify-center gap-2 mt-5 text-xs text-text-muted">
          <Shield className="w-3.5 h-3.5" />
          <span>256-bit encrypted · Verified Security</span>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-green-50 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-text-muted text-sm font-medium">Loading form...</p>
        </div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
