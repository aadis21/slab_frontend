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
  Wallet,
  Gift,
  BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
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

// Level income config (matches backend)
const LEVEL_PERCENTS = [10, 8, 7, 6, 5, 4, 4, 3, 3];

interface WalletData {
  direct: number;
  level: number;
  reward: number;
  topup: number;
  total: number;
}

interface LevelIncomeRow {
  _id: number;    // the level number (1–9)
  total: number;  // total earned at this level in cents
  count: number;  // number of distributions
}

interface DashboardData {
  user: {
    wallet: { direct: number; level: number; reward: number; topup: number };
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
    wallet: WalletData;
    activePlan: string;
    referralCount: number;
    levelIncomeByLevel: LevelIncomeRow[];
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

  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

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
    if (amountCents > (data.stats.wallet.total ?? 0)) {
      toast.error('Insufficient total wallet balance');
      return;
    }
    if (!walletAddress.trim()) {
      toast.error('Please enter bank details or crypto wallet address');
      return;
    }

    try {
      setSubmittingWithdraw(true);
      await api.post('/withdrawals/request', { amountCents, walletAddress: walletAddress.trim() });
      toast.success('Withdrawal request submitted for review!');
      setIsWithdrawOpen(false);
      setWithdrawAmount('');
      setWalletAddress('');
      fetchDashboard();
      refetchUser();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      toast.error(axiosErr.response?.data?.error || 'Failed to submit withdrawal request');
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
  const walletStats = data?.stats?.wallet;

  // Build level income lookup map
  const levelEarningsMap = new Map<number, number>();
  (data?.stats?.levelIncomeByLevel ?? []).forEach((row) => {
    levelEarningsMap.set(row._id, row.total);
  });

  // Max earned across all levels for progress bar scaling
  const maxEarned = Math.max(...Array.from(levelEarningsMap.values()), 1);

  // Wallet cards config
  const walletCards = [
    {
      key: 'direct',
      label: 'Direct Wallet',
      icon: Gift,
      gradient: 'from-blue-500 to-blue-600',
      value: walletStats?.direct ?? 0,
      description: 'Direct referral bonuses',
    },
    {
      key: 'level',
      label: 'Level Wallet',
      icon: TrendingUp,
      gradient: 'from-purple-500 to-purple-600',
      value: walletStats?.level ?? 0,
      description: 'Multi-level commissions',
    },
    {
      key: 'reward',
      label: 'Reward Wallet',
      icon: BarChart3,
      gradient: 'from-amber-500 to-amber-600',
      value: walletStats?.reward ?? 0,
      description: 'Achievement rewards',
    },
    {
      key: 'topup',
      label: 'Top-up Wallet',
      icon: Wallet,
      gradient: 'from-emerald-500 to-emerald-600',
      value: walletStats?.topup ?? 0,
      description: 'QR scanner top-ups',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-dark">
            {greeting}, {user?.name?.split(' ')[0] || 'Member'} 👋
          </h1>
          <p className="text-text-muted text-sm mt-0.5">Your multi-wallet investment dashboard.</p>
        </div>
        <button
          onClick={fetchDashboard}
          disabled={loading}
          className="p-2 rounded-xl border border-gray-150 hover:bg-gray-50 text-text-muted transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* ── 4-Wallet Card Grid ─────────────────────────────────────────────── */}
      <div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          {walletCards.map(({ key, label, icon: Icon, gradient, value, description }) => (
            <div
              key={key}
              className={`bg-gradient-to-br ${gradient} rounded-2xl p-4 text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer`}
              onClick={() => router.push('/wallet')}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-[10px] text-white/75 font-semibold uppercase tracking-wider mb-0.5">
                {label}
              </p>
              {loading ? (
                <div className="h-6 w-20 bg-white/20 rounded animate-pulse" />
              ) : (
                <p className="text-lg font-extrabold">{formatCurrency(value)}</p>
              )}
              <p className="text-[10px] text-white/60 mt-0.5">{description}</p>
            </div>
          ))}
        </div>

        {/* Total Balance Row */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-text-muted font-semibold uppercase tracking-wider">
              Total Balance
            </p>
            {loading ? (
              <Skeleton className="h-7 w-28 mt-1" />
            ) : (
              <p className="text-2xl font-extrabold text-text-dark">
                {formatCurrency(walletStats?.total ?? 0)}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Link
              href="/wallet"
              className="text-xs font-semibold text-primary-600 hover:underline flex items-center gap-1"
            >
              View Ledger <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() => setIsWithdrawOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              Withdraw
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Body Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Plan + History */}
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
                    <Badge variant="success">Verified</Badge>
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
                      <span className="font-bold text-text-dark">
                        {data.user.planActivatedAt ? formatDate(data.user.planActivatedAt) : 'N/A'}
                      </span>
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
                    Pending Approval: {data.activePlanRequest.plan.name}
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

          {/* Level Income Breakdown (9 levels) */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-text-dark flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                Level Income Breakdown
              </h2>
              <span className="text-xs text-text-muted">9-Level MLM Commission</span>
            </div>
            <div className="p-5 space-y-3">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full rounded-lg" />
                ))
              ) : (
                LEVEL_PERCENTS.map((pct, i) => {
                  const levelNum = i + 1;
                  const earned = levelEarningsMap.get(levelNum) ?? 0;
                  const barWidth = earned > 0 ? Math.max((earned / maxEarned) * 100, 4) : 0;
                  return (
                    <div key={levelNum} className="flex items-center gap-3">
                      <div className="w-14 flex-shrink-0 text-right">
                        <span className="text-xs font-bold text-text-dark">L{levelNum}</span>
                        <span className="text-[10px] text-text-muted ml-1">({pct}%)</span>
                      </div>
                      <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-700"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                      <div className="w-20 text-right">
                        <span className="text-xs font-semibold text-text-dark">
                          {earned > 0 ? formatCurrency(earned) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right — Quick Actions */}
        <div className="space-y-6">
          <div className="card bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex flex-col gap-3">
            <h2 className="text-base font-bold text-text-dark">Quick Operations</h2>

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
                  <p className="text-sm font-bold text-amber-700">Refer &amp; Earn</p>
                  <p className="text-[11px] text-amber-500">View team trees &amp; bonuses</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/wallet"
              className="flex items-center justify-between p-3 rounded-xl bg-purple-50 hover:bg-purple-100 transition duration-150 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-purple-700">Wallet Ledger</p>
                  <p className="text-[11px] text-purple-500">All transaction history</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
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
            {/* Wallet Breakdown */}
            <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
              <p className="text-xs font-semibold text-gray-500 mb-2">Wallet Breakdown (drain order: Level → Direct → Reward → Top-up)</p>
              {[
                { label: '📈 Level', value: walletStats?.level ?? 0, color: 'text-purple-600' },
                { label: '💰 Direct', value: walletStats?.direct ?? 0, color: 'text-blue-600' },
                { label: '🎁 Reward', value: walletStats?.reward ?? 0, color: 'text-amber-600' },
                { label: '➕ Top-up', value: walletStats?.topup ?? 0, color: 'text-emerald-600' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between text-xs">
                  <span className="text-gray-600">{label}</span>
                  <span className={`font-semibold ${color}`}>{formatCurrency(value)}</span>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-1.5 mt-1.5 flex justify-between text-xs font-bold">
                <span className="text-gray-700">Total Available</span>
                <span className="text-emerald-600">{formatCurrency(walletStats?.total ?? 0)}</span>
              </div>
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
