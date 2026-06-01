'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Users,
  Wallet,
  TrendingUp,
  FileCheck,
  ArrowUpRight,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';

interface StatsData {
  totalUsers: number;
  activeUsers: number;
  totalPlans: number;
  pendingPlanRequests: number;
  pendingWithdrawals: number;
  totalWalletBalanceCents: number;
  recentPlanRequests: any[];
  recentWithdrawals: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/user/admin/stats');
      setStats(res.data.data);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to fetch admin stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-3 h-3" /> Approved
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-8 h-8 text-rose-500 animate-spin" />
        <p className="text-sm text-slate-400">Loading system metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">System Overview</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time statistics & administration controls.</p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-blue-500/5 blur-2xl pointer-events-none" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Users</p>
              <h3 className="text-3xl font-extrabold text-white mt-2">{stats?.totalUsers}</h3>
              <p className="text-[11px] text-emerald-400 mt-2 font-medium">
                {stats?.activeUsers} accounts active
              </p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Global Wallet Balances */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Liabilities (Wallet Balance)</p>
              <h3 className="text-3xl font-extrabold text-emerald-400 mt-2">
                {formatCurrency(stats?.totalWalletBalanceCents || 0)}
              </h3>
              <p className="text-[11px] text-slate-500 mt-2 font-mono">
                USD ($) currency pool
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Pending Plan Requests */}
        <Link 
          href="/admin/plan-requests"
          className="bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-6 relative overflow-hidden shadow-lg transition duration-200 group block"
        >
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-amber-500/5 blur-2xl pointer-events-none" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider group-hover:text-slate-300">Plan Requests</p>
              <h3 className="text-3xl font-extrabold text-white mt-2">{stats?.pendingPlanRequests}</h3>
              <p className="text-[11px] text-amber-400 mt-2 font-medium">
                Awaiting review
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:bg-amber-500/25">
              <FileCheck className="w-6 h-6" />
            </div>
          </div>
        </Link>

        {/* Pending Withdrawals */}
        <Link
          href="/admin/withdrawals"
          className="bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-6 relative overflow-hidden shadow-lg transition duration-200 group block"
        >
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-rose-500/5 blur-2xl pointer-events-none" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider group-hover:text-slate-300">Withdrawals</p>
              <h3 className="text-3xl font-extrabold text-white mt-2">{stats?.pendingWithdrawals}</h3>
              <p className="text-[11px] text-rose-400 mt-2 font-medium">
                Awaiting payout
              </p>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 group-hover:bg-rose-500/25">
              <ArrowUpRight className="w-6 h-6" />
            </div>
          </div>
        </Link>
      </div>

      {/* Tables for Recent Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Plan Requests */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-rose-500" />
              Recent Plan Requests
            </h2>
            <Link href="/admin/plan-requests" className="text-xs text-rose-400 hover:text-rose-300 hover:underline">
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold text-xs uppercase">
                  <th className="py-3">User</th>
                  <th className="py-3">Requested Plan</th>
                  <th className="py-3 text-right">Cost</th>
                  <th className="py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {stats?.recentPlanRequests && stats.recentPlanRequests.length > 0 ? (
                  stats.recentPlanRequests.map((req) => (
                    <tr key={req._id} className="text-slate-300 hover:bg-slate-800/20 transition">
                      <td className="py-3.5 pr-2">
                        <div className="font-semibold text-white">{req.user?.name || 'Unknown'}</div>
                        <div className="text-xs text-slate-500">{req.user?.phone || ''}</div>
                      </td>
                      <td className="py-3.5">
                        <span
                          className="px-2 py-0.5 rounded-md text-xs font-semibold text-slate-900"
                          style={{ backgroundColor: req.plan?.color || '#ffffff' }}
                        >
                          {req.plan?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-mono font-medium text-white">
                        {formatCurrency(req.plan?.priceUSD || 0)}
                      </td>
                      <td className="py-3.5 text-center">{getStatusBadge(req.status)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-slate-500">
                      No plan requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Withdrawal Requests */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-rose-500" />
              Recent Withdrawals
            </h2>
            <Link href="/admin/withdrawals" className="text-xs text-rose-400 hover:text-rose-300 hover:underline">
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold text-xs uppercase">
                  <th className="py-3">User</th>
                  <th className="py-3 font-mono">Wallet Address</th>
                  <th className="py-3 text-right">Amount</th>
                  <th className="py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {stats?.recentWithdrawals && stats.recentWithdrawals.length > 0 ? (
                  stats.recentWithdrawals.map((w) => (
                    <tr key={w._id} className="text-slate-300 hover:bg-slate-800/20 transition">
                      <td className="py-3.5 pr-2">
                        <div className="font-semibold text-white">{w.user?.name || 'Unknown'}</div>
                        <div className="text-xs text-slate-500">{w.user?.phone || ''}</div>
                      </td>
                      <td className="py-3.5 font-mono text-xs max-w-[120px] truncate text-slate-400">
                        {w.walletAddress}
                      </td>
                      <td className="py-3.5 text-right font-mono font-medium text-white">
                        {formatCurrency(w.amountCents || 0)}
                      </td>
                      <td className="py-3.5 text-center">{getStatusBadge(w.status)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-slate-500">
                      No withdrawal requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
