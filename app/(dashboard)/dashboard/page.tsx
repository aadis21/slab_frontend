'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CalendarDays,
  TrendingUp,
  ChevronRight,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  Heart,
  ArrowUpRight,
  DollarSign,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { DashboardStats } from '@/components/DashboardStats';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency, formatDate, getGreeting } from '@/lib/utils';
import DonationModal from '@/components/DonationModal';

interface DashboardData {
  user: {
    walletBalance: number;
    activePlan?: {
      name: string;
      priceUSD: number;
      annualReturnPercent: number;
      durationDays: number;
      color: string;
    };
    planActivatedAt?: string;
  };
  stats: {
    walletBalance: number;
    activePlan: string;
    referralCount: number;
    referralBonusCents: number;
  };
  activePlanRequest: {
    plan: { name: string; priceUSD: number };
    status: string;
  } | null;
  recentRequests: Array<{
    _id: string;
    plan: { name: string; priceUSD: number; color: string };
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
  }>;
}

export default function DashboardPage() {
  const { user, refetch: refetchUser } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal Triggers
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  // Withdrawal Form State
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/user/dashboard');
      setData(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;

    const amountCents = Math.round(Number(withdrawAmount) * 100);
    if (!withdrawAmount || isNaN(Number(withdrawAmount)) || Number(withdrawAmount) <= 0) {
      toast.error('Please enter a valid withdrawal amount');
      return;
    }
    if (amountCents > data.stats.walletBalance) {
      toast.error('Insufficient wallet balance');
      return;
    }
    if (!walletAddress.trim()) {
      toast.error('Please enter bank details or crypto wallet address');
      return;
    }

    try {
      setSubmittingWithdraw(true);
      await api.post('/withdrawals/request', {
        amountCents,
        walletAddress: walletAddress.trim(),
      });
      toast.success('Withdrawal request submitted for review!');
      setIsWithdrawOpen(false);
      setWithdrawAmount('');
      setWalletAddress('');
      fetchDashboard();
      refetchUser();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to submit withdrawal request');
    } finally {
      setSubmittingWithdraw(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
    }
  };

  const greeting = getGreeting();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-dark">
            {greeting}, {user?.name?.split(' ')[0] || 'Member'} 👋
          </h1>
          <p className="text-text-muted text-sm mt-0.5">Here&apos;s your dollar-based portfolio dashboard.</p>
        </div>
        <button
          onClick={fetchDashboard}
          disabled={loading}
          className="p-2 rounded-xl border border-gray-150 hover:bg-gray-50 text-text-muted transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Cards */}
      <DashboardStats stats={data?.stats ?? null} loading={loading} />

      {/* Main Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns - Plan Details & History */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Investment Plan */}
          <div className="card bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
            <h2 className="text-base font-bold text-text-dark mb-4">Current Investment Tier</h2>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-40" />
              </div>
            ) : data?.user?.activePlan ? (
              <div className="flex items-start gap-4">
                <div
                  className="w-3 h-20 rounded-full flex-shrink-0"
                  style={{ backgroundColor: data.user.activePlan.color }}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-black text-text-dark">
                      {data.user.activePlan.name} Plan Active
                    </h3>
                    <Badge variant="success">
                      Verified
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3 text-sm text-text-muted">
                    <div>
                      <span className="block text-xs uppercase tracking-wider text-gray-400">Total Capital</span>
                      <span className="font-bold text-text-dark">{formatCurrency(data.user.activePlan.priceUSD)}</span>
                    </div>
                    <div>
                      <span className="block text-xs uppercase tracking-wider text-gray-400">Annual Return</span>
                      <span className="font-bold text-emerald-600 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        {data.user.activePlan.annualReturnPercent}% p.a.
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs uppercase tracking-wider text-gray-400">Activated On</span>
                      <span className="font-bold text-text-dark">{data.user.planActivatedAt ? formatDate(data.user.planActivatedAt) : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-text-muted text-sm mb-4">No active investment contract found.</p>
                {data?.activePlanRequest ? (
                  <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 text-amber-700 text-xs px-4 py-2 rounded-xl font-semibold">
                    <Clock className="w-4 h-4 shrink-0" />
                    Pending Approval: {data.activePlanRequest.plan.name} (${(data.activePlanRequest.plan.priceUSD / 100).toFixed(2)})
                  </div>
                ) : (
                  <Button onClick={() => router.push('/plans')} size="sm" className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl">
                    Browse Plans
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Recent Plan Purchase Requests */}
          <div className="card bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden p-0">
            <div className="px-6 py-4 border-b border-gray-150 flex items-center justify-between">
              <h2 className="text-base font-bold text-text-dark">Plan Purchase History</h2>
              <span className="text-xs text-text-muted">Last 5 submissions</span>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full animate-pulse" />
                  <Skeleton className="h-10 w-full animate-pulse" />
                </div>
              ) : data?.recentRequests && data.recentRequests.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-150 text-gray-400 text-xs uppercase font-bold">
                        <th className="py-2.5">Date</th>
                        <th className="py-2.5">Selected Plan</th>
                        <th className="py-2.5 text-right">Cost</th>
                        <th className="py-2.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentRequests.map((req) => (
                        <tr key={req._id} className="border-b border-gray-50 text-text-dark hover:bg-gray-50/50">
                          <td className="py-3 text-text-muted">{formatDate(req.createdAt)}</td>
                          <td className="py-3 font-semibold">
                            <span className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: req.plan?.color || '#ccc' }}
                              />
                              {req.plan?.name || 'Unknown Plan'}
                            </span>
                          </td>
                          <td className="py-3 text-right font-mono font-medium">{formatCurrency(req.plan?.priceUSD || 0)}</td>
                          <td className="py-3 text-center">{getStatusBadge(req.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-6 text-text-muted text-sm">
                  You haven&apos;t requested any plans yet.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Columns - Quick Actions */}
        <div className="space-y-6">
          <div className="card bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex flex-col gap-3">
            <h2 className="text-base font-bold text-text-dark">Quick Operations</h2>
            
            {/* Purchase plans */}
            <Link
              href="/plans"
              className="flex items-center justify-between p-3 rounded-xl bg-primary-50 hover:bg-primary-100 transition duration-150 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-primary-700">Browse Plans</p>
                  <p className="text-[11px] text-primary-500">Upgrade your return tiers</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-primary-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* Donation Scanner Modal */}
            <button
              onClick={() => setIsDonateOpen(true)}
              className="flex items-center justify-between p-3 rounded-xl bg-rose-50 hover:bg-rose-100 transition duration-150 group text-left w-full"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white fill-white/20" />
                </div>
                <div>
                  <p className="text-sm font-bold text-rose-700">Donate / Scanner Topup</p>
                  <p className="text-[11px] text-rose-500">Scan QR to pay and credit wallet</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Withdrawal request */}
            <button
              onClick={() => setIsWithdrawOpen(true)}
              className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition duration-150 group text-left w-full"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-700">Request Withdrawal</p>
                  <p className="text-[11px] text-emerald-500">Send wallet funds to Bank/Crypto</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Referral tree page */}
            <Link
              href="/referral"
              className="flex items-center justify-between p-3 rounded-xl bg-amber-50 hover:bg-amber-100 transition duration-150 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-700">Refer & Earn</p>
                  <p className="text-[11px] text-amber-500">View team trees & bonuses</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

          </div>
        </div>
      </div>

      {/* --- DONATION MODAL --- */}
      <DonationModal isOpen={isDonateOpen} onClose={() => setIsDonateOpen(false)} />

      {/* --- WITHDRAW FUNDS DIALOG --- */}
      <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
        <DialogContent className="sm:max-w-md bg-white border border-gray-100 rounded-2xl shadow-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              Request Withdrawal
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleWithdrawSubmit} className="space-y-4">
            <div>
              <Label className="text-xs text-gray-500 font-medium">Available Balance</Label>
              <p className="text-2xl font-black text-emerald-600 mt-0.5">
                {data ? formatCurrency(data.stats.walletBalance) : '$0.00'}
              </p>
            </div>
            
            <div>
              <Label htmlFor="withdrawAmount" className="text-xs text-gray-600 font-medium">Amount to Withdraw (USD $)</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-2.5 text-gray-400 font-bold">$</span>
                <Input
                  id="withdrawAmount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="50.00"
                  required
                  className="pl-7 rounded-lg border-gray-200 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="walletAddress" className="text-xs text-gray-600 font-medium">Payout Destination Details</Label>
              <textarea
                id="walletAddress"
                rows={3}
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Enter your Bank account details (Name, IBAN, Swift Code) or Crypto wallet address..."
                required
                className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 font-sans"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsWithdrawOpen(false)}
                className="flex-1 rounded-xl border-gray-200 text-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submittingWithdraw}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
              >
                {submittingWithdraw ? 'Submitting...' : 'Confirm Request'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
