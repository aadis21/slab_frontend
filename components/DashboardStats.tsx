'use client';

import { TrendingUp, Wallet, Gift, BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface Stats {
  walletBalance: number;     // cents
  activePlan: string;
  referralCount: number;
  referralBonusCents: number; // cents
}

interface DashboardStatsProps {
  stats: Stats | null;
  loading: boolean;
}

export function DashboardStats({ stats, loading }: DashboardStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="stat-card">
            <Skeleton className="h-10 w-10 rounded-lg mb-3" />
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-7 w-32" />
          </div>
        ))}
      </div>
    );
  }

  const statConfig = [
    {
      label: 'Wallet Balance',
      value: formatCurrency(stats?.walletBalance || 0),
      icon: Wallet,
      color: '#10B981', // Emerald
      bg: '#E6F4EA',
    },
    {
      label: 'Active Plan',
      value: stats?.activePlan || 'None',
      icon: BarChart3,
      color: '#3B82F6', // Blue
      bg: '#EBF5FF',
    },
    {
      label: 'Referrals Joined',
      value: stats?.referralCount?.toString() || '0',
      icon: Gift,
      color: '#F59E0B', // Gold/Amber
      bg: '#FFF8E6',
    },
    {
      label: 'Referral Earnings',
      value: formatCurrency(stats?.referralBonusCents || 0),
      icon: TrendingUp,
      color: '#8B5CF6', // Purple
      bg: '#F3E8FF',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statConfig.map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className="stat-card animate-slide-up">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center mb-2"
            style={{ backgroundColor: bg }}
          >
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          <p className="text-xs text-text-muted font-medium uppercase tracking-wide">{label}</p>
          <p className="text-lg lg:text-xl font-bold text-text-dark truncate mt-0.5">{value}</p>
        </div>
      ))}
    </div>
  );
}
