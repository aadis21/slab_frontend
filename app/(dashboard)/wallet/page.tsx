'use client';

import React, { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
  TrendingUp,
  Gift,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

type WalletType = 'direct' | 'level' | 'reward' | 'topup';
type TxType = 'credit' | 'debit';
type TabKey = 'all' | WalletType;

interface LedgerEntry {
  _id: string;
  walletType: WalletType;
  txType: TxType;
  amount: number;
  description: string;
  level?: number;
  balanceAfter: number;
  createdAt: string;
}

interface WalletSummary {
  direct: number;
  level: number;
  reward: number;
  topup: number;
  total: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'all',    label: 'All',     icon: <Wallet className="w-3.5 h-3.5" /> },
  { key: 'direct', label: 'Direct',  icon: <Gift className="w-3.5 h-3.5" /> },
  { key: 'level',  label: 'Level',   icon: <TrendingUp className="w-3.5 h-3.5" /> },
  { key: 'reward', label: 'Reward',  icon: <Gift className="w-3.5 h-3.5" /> },
  { key: 'topup',  label: 'Top-up',  icon: <ArrowDownCircle className="w-3.5 h-3.5" /> },
];

const WALLET_COLORS: Record<WalletType, { bg: string; text: string; border: string }> = {
  direct: { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
  level:  { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  reward: { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200' },
  topup:  { bg: 'bg-emerald-50',text: 'text-emerald-700',border: 'border-emerald-200' },
};

const WALLET_LABELS: Record<WalletType, string> = {
  direct: '💰 Direct',
  level:  '📈 Level',
  reward: '🎁 Reward',
  topup:  '➕ Top-up',
};

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingLedger, setLoadingLedger] = useState(true);

  // Fetch wallet summary
  const fetchSummary = useCallback(async () => {
    try {
      setLoadingSummary(true);
      const res = await api.get('/wallet/summary');
      setSummary(res.data.data.wallet);
    } catch {
      toast.error('Failed to load wallet summary');
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  // Fetch ledger
  const fetchLedger = useCallback(async (tab: TabKey, page: number) => {
    try {
      setLoadingLedger(true);
      const params: Record<string, string | number> = { page, limit: 20 };
      if (tab !== 'all') params.type = tab;
      const res = await api.get('/wallet/ledger', { params });
      setEntries(res.data.data.entries);
      setPagination(res.data.data.pagination);
    } catch {
      toast.error('Failed to load ledger');
    } finally {
      setLoadingLedger(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchLedger(activeTab, 1);
  }, [activeTab, fetchLedger]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
  };

  const handlePageChange = (newPage: number) => {
    fetchLedger(activeTab, newPage);
    setPagination((p) => ({ ...p, page: newPage }));
  };

  // ─── Summary Cards ─────────────────────────────────────────────────────────
  const summaryCards = [
    { key: 'direct' as WalletType, label: 'Direct Wallet',  icon: '💰', color: 'from-blue-500 to-blue-600' },
    { key: 'level'  as WalletType, label: 'Level Wallet',   icon: '📈', color: 'from-purple-500 to-purple-600' },
    { key: 'reward' as WalletType, label: 'Reward Wallet',  icon: '🎁', color: 'from-amber-500 to-amber-600' },
    { key: 'topup'  as WalletType, label: 'Top-up Wallet',  icon: '➕', color: 'from-emerald-500 to-emerald-600' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-text-dark tracking-tight">
            My Wallet
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Track all your wallet balances and transaction history.
          </p>
        </div>
        <button
          onClick={() => { fetchSummary(); fetchLedger(activeTab, pagination.page); }}
          disabled={loadingSummary || loadingLedger}
          className="p-2 rounded-xl border border-gray-150 hover:bg-gray-50 text-text-muted transition"
        >
          <RefreshCw className={`w-4 h-4 ${(loadingSummary || loadingLedger) ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Wallet Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map(({ key, label, icon, color }) => (
          <div
            key={key}
            className={`bg-gradient-to-br ${color} rounded-2xl p-4 text-white shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}
            onClick={() => handleTabChange(key)}
          >
            <div className="text-2xl mb-1">{icon}</div>
            <p className="text-xs text-white/80 font-medium uppercase tracking-wider mb-0.5">{label}</p>
            {loadingSummary ? (
              <div className="h-6 w-20 bg-white/20 rounded animate-pulse" />
            ) : (
              <p className="text-lg font-extrabold">
                {formatCurrency(summary?.[key] ?? 0)}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Total Balance Bar */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-text-muted font-semibold uppercase tracking-wider">Total Balance</p>
          {loadingSummary ? (
            <Skeleton className="h-8 w-32 mt-1" />
          ) : (
            <p className="text-3xl font-extrabold text-text-dark">
              {formatCurrency(summary?.total ?? 0)}
            </p>
          )}
        </div>
        <Button
          id="wallet-withdraw-btn"
          onClick={() => window.location.href = '/dashboard'}
          className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold"
        >
          Request Withdrawal
        </Button>
      </div>

      {/* Ledger Section */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-100 px-4 pt-4">
          <div className="flex gap-1 flex-wrap">
            {TABS.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => handleTabChange(key)}
                className={`
                  flex items-center gap-1.5 px-3.5 py-2 rounded-t-xl text-xs font-semibold transition-all border-b-2
                  ${activeTab === key
                    ? 'text-primary-700 border-primary-500 bg-primary-50'
                    : 'text-text-muted border-transparent hover:text-text-dark hover:bg-gray-50'
                  }
                `}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loadingLedger ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-16 text-text-muted">
              <Wallet className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium">No transactions yet</p>
              <p className="text-xs mt-1">Your wallet activity will appear here</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase font-bold">
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Wallet</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3 max-w-xs">Description</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3 text-right">Balance After</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const wColors = WALLET_COLORS[entry.walletType];
                  return (
                    <tr
                      key={entry._id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-5 py-3.5 text-text-muted text-xs whitespace-nowrap">
                        {formatDate(entry.createdAt)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${wColors.bg} ${wColors.text} ${wColors.border}`}>
                          {WALLET_LABELS[entry.walletType]}
                          {entry.level && <span className="ml-1 opacity-70">L{entry.level}</span>}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {entry.txType === 'credit' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                            <ArrowDownCircle className="w-3.5 h-3.5" />
                            Credit
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600">
                            <ArrowUpCircle className="w-3.5 h-3.5" />
                            Debit
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-text-dark max-w-[200px] truncate">
                        {entry.description}
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono font-bold">
                        <span className={entry.txType === 'credit' ? 'text-emerald-600' : 'text-rose-600'}>
                          {entry.txType === 'credit' ? '+' : '-'}
                          {formatCurrency(entry.amount)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono text-text-muted text-xs">
                        {formatCurrency(entry.balanceAfter)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="text-xs text-text-muted">
              Showing {((pagination.page - 1) * pagination.limit) + 1}–
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex items-center gap-2">
              <Button
                id="ledger-prev-page"
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => handlePageChange(pagination.page - 1)}
                className="rounded-lg border-gray-200 text-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                Prev
              </Button>
              <span className="text-xs text-text-muted font-medium">
                {pagination.page} / {pagination.pages}
              </span>
              <Button
                id="ledger-next-page"
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.pages}
                onClick={() => handlePageChange(pagination.page + 1)}
                className="rounded-lg border-gray-200 text-xs"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
