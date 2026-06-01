'use client';

import { useState } from 'react';
import { Copy, Check, MessageCircle, Users, Gift, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ReferredUser {
  id: string;
  maskedName: string;
  joinedAt: string;
  bonusAwarded: boolean;
  bonusAmount: number; // cents
}

interface ReferralCardProps {
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  totalBonusEarned: number; // cents
  referredUsers: ReferredUser[];
}

export function ReferralCard({
  referralCode,
  referralLink,
  totalReferrals,
  totalBonusEarned,
  referredUsers,
}: ReferralCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `🚀 Join InvestSlabs and start growing your wealth today!\n\nUse my referral link to get started:\n${referralLink}\n\nInvest in dollar-based plans with up to 20% annual returns. 💰`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="stat-card bg-white border border-gray-100 p-5 rounded-2xl shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center mb-2">
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-xs text-text-muted uppercase tracking-wide font-semibold">Direct Team Size</p>
          <p className="text-2xl font-black text-text-dark mt-1">{totalReferrals}</p>
        </div>
        <div className="stat-card bg-white border border-gray-100 p-5 rounded-2xl shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-2">
            <Gift className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-xs text-text-muted uppercase tracking-wide font-semibold">Bonus Earned</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{formatCurrency(totalBonusEarned)}</p>
        </div>
      </div>

      {/* Info banner */}
      <div className="rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 p-6 text-white shadow">
        <div className="flex items-center gap-2 mb-2">
          <Gift className="w-5 h-5 text-amber-300" />
          <h3 className="font-bold text-lg">Multi-Level Referral Rewards!</h3>
        </div>
        <p className="text-sm text-indigo-100 leading-relaxed">
          Invite users and build your tree! You earn a <strong className="text-white">$10.00</strong> bonus for every friend who activates a plan (Level 1), and a <strong className="text-white">$5.00</strong> bonus when their referrals activate a plan (Level 2).
        </p>
      </div>

      {/* Referral link */}
      <div className="card bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">Your Unique Code</p>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl font-black text-primary-600 tracking-widest">{referralCode}</span>
        </div>
        
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">Your Referral Link</p>
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200 mb-4 select-all">
          <p className="text-xs text-text-dark flex-1 truncate font-mono">{referralLink}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            id="copy-referral-link"
            onClick={handleCopy}
            variant={copied ? 'secondary' : 'default'}
            className="flex-1 rounded-xl h-11 font-bold text-white bg-primary-600 hover:bg-primary-700"
          >
            {copied ? (
              <><Check className="w-4 h-4 mr-2 text-white" />Copied!</>
            ) : (
              <><Copy className="w-4 h-4 mr-2 text-white" />Copy Link</>
            )}
          </Button>
          <Button
            id="share-whatsapp"
            onClick={handleWhatsApp}
            className="flex-1 rounded-xl h-11 font-bold bg-[#25D366] hover:bg-[#1ebe57] text-white"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Share Link
          </Button>
        </div>
      </div>

      {/* Referred users table */}
      <div className="card bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden p-0">
        <div className="px-6 py-4 border-b border-gray-150 flex items-center justify-between">
          <h3 className="font-bold text-text-dark">Level 1 Referrals</h3>
          <span className="text-xs text-slate-400">Directly invited users</span>
        </div>
        <div className="p-6 pt-2">
          {referredUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs uppercase font-bold text-slate-400">Name</TableHead>
                  <TableHead className="text-xs uppercase font-bold text-slate-400">Joined Date</TableHead>
                  <TableHead className="text-xs uppercase font-bold text-slate-400">Bonus Status</TableHead>
                  <TableHead className="text-xs uppercase font-bold text-slate-400 text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referredUsers.map((user) => (
                  <TableRow key={user.id} className="text-slate-700 hover:bg-slate-50/50">
                    <td className="py-3 font-semibold text-text-dark">{user.maskedName}</td>
                    <td className="py-3 text-text-muted text-xs">{formatDate(user.joinedAt)}</td>
                    <td className="py-3">
                      <Badge variant={user.bonusAwarded ? 'success' : 'warning'}>
                        {user.bonusAwarded ? 'Awarded' : 'Pending'}
                      </Badge>
                    </td>
                    <td className="py-3 font-bold font-mono text-right text-text-dark">
                      {user.bonusAwarded ? formatCurrency(user.bonusAmount) : '—'}
                    </td>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6 text-text-muted text-xs italic">
              You haven&apos;t referred anyone directly yet. Share your link to start earning!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
