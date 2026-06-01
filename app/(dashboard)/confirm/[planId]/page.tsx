'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, User, Phone, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';

interface Plan {
  _id: string;
  name: string;
  priceUSD: number;
  minInvestmentUSD: number;
  annualReturnPercent: number;
  features: string[];
  color: string;
}

export default function ConfirmPage({ params }: { params: { planId: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await api.get(`/plans/${params.planId}`);
        setPlan(res.data.data.plan);
      } catch {
        toast.error('Plan not found');
        router.push('/plans');
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [params.planId, router]);

  const handleConfirmRequest = async () => {
    if (!plan) return;
    try {
      setSubmitting(true);
      await api.post('/plan-requests/request', { planId: plan._id });
      toast.success('Purchase request submitted successfully!');
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to submit plan request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div className="max-w-lg mx-auto animate-slide-up space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/plans"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-primary-600 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Plans
        </Link>
        <h1 className="text-2xl font-bold text-text-dark">Confirm Your Selection</h1>
        <p className="text-text-muted text-sm mt-1">Review your plan before requesting purchase approval</p>
      </div>

      {/* Plan card */}
      <div className="card rounded-2xl overflow-hidden p-0 bg-white border border-gray-100 shadow-sm">
        <div className="h-2" style={{ backgroundColor: plan.color }} />
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-text-dark">{plan.name} Plan</h2>
              <span
                className="text-sm font-semibold"
                style={{ color: plan.color }}
              >
                {plan.annualReturnPercent}% annual return
              </span>
            </div>
            <div className="text-right">
              <p className="text-3xl font-extrabold text-text-dark">
                {formatCurrency(plan.priceUSD)}
              </p>
              <p className="text-text-muted text-xs">one-time cost</p>
            </div>
          </div>

          <div className="h-px bg-gray-100 mb-4" />

          <p className="text-xs text-text-muted font-medium uppercase tracking-wide mb-3">Includes</p>
          <ul className="space-y-2.5">
            {plan.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: plan.color }} />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* User info */}
      <div className="card bg-gray-50 border border-gray-250 p-5 rounded-xl">
        <h3 className="text-sm font-semibold text-text-dark mb-3">Your Account Info</h3>
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <User className="w-4 h-4" />
            <span>{user?.name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Phone className="w-4 h-4" />
            <span>+{user?.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <TrendingUp className="w-4 h-4" />
            <span>Min. investment required: {formatCurrency(plan.minInvestmentUSD)}</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <Button
        id="submit-purchase-request"
        onClick={handleConfirmRequest}
        disabled={submitting}
        className="w-full h-12 text-base font-bold rounded-xl bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50"
      >
        {submitting ? 'Submitting Request...' : 'Submit Purchase Request'}
      </Button>

      <p className="text-center text-xs text-text-muted">
        Admin verification required. Subscriptions activate immediately upon approval.
      </p>
    </div>
  );
}
