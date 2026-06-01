'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import {
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Wallet,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface WithdrawalRequest {
  _id: string;
  user: {
    _id: string;
    name: string;
    phone: string;
    walletBalance: number;
  };
  amountCents: number;
  walletAddress: string;
  payoutWalletId?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
  requestedAt: string;
}

export default function AdminWithdrawals() {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending');

  // Reject Modal State
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const url = filterStatus === 'all'
        ? '/withdrawals/admin/list'
        : `/withdrawals/admin/list?status=${filterStatus}`;
      const res = await api.get(url);
      setRequests(res.data.data.withdrawals);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to fetch withdrawal requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filterStatus]);

  const handleApprove = async (id: string, name: string, amount: number) => {
    const formattedAmount = formatCurrency(amount);
    if (!confirm(`Are you sure you want to approve the withdrawal request of ${formattedAmount} for ${name}? This will deduct the amount from their wallet and generate a system transaction payout reference.`)) return;
    
    try {
      const res = await api.patch(`/withdrawals/admin/approve/${id}`);
      const payoutId = res.data.data.payoutWalletId;
      toast.success(`Withdrawal approved! Generated Payout Reference: ${payoutId}`);
      fetchRequests();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to approve withdrawal request');
    }
  };

  const openRejectDialog = (id: string) => {
    setRejectId(id);
    setAdminNote('');
    setIsRejectOpen(true);
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectId) return;
    try {
      setRejecting(true);
      await api.patch(`/withdrawals/admin/reject/${rejectId}`, { adminNote });
      toast.success('Withdrawal request rejected');
      setIsRejectOpen(false);
      fetchRequests();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to reject withdrawal request');
    } finally {
      setRejecting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400">
            <Clock className="w-3.5 h-3.5" /> Pending Review
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> Paid & Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ArrowUpRight className="w-7 h-7 text-rose-500" />
            Withdrawal Requests
          </h1>
          <p className="text-slate-400 text-sm mt-1">Review member payout requests, execute external bank/wallet transfers, and record confirmations.</p>
        </div>

        <button
          onClick={fetchRequests}
          disabled={loading}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <RefreshCw className={`w-4.5 h-4.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter tab buttons */}
      <div className="flex border-b border-slate-800">
        {['pending', 'approved', 'rejected', 'all'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterStatus(tab)}
            className={`px-4 py-2.5 text-sm font-semibold capitalize transition-all border-b-2 -mb-[2px] ${
              filterStatus === tab
                ? 'text-rose-500 border-rose-500 font-bold'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Requests table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold text-xs uppercase bg-slate-950/40">
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4 font-mono">Amount Requested</th>
                <th className="px-6 py-4 font-mono">Destination Address</th>
                <th className="px-6 py-4">Request Date</th>
                <th className="px-6 py-4">Status & Details</th>
                {filterStatus === 'pending' && <th className="px-6 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {requests.length > 0 ? (
                requests.map((r) => (
                  <tr key={r._id} className="text-slate-300 hover:bg-slate-800/10 transition">
                    <td className="px-6 py-4.5">
                      <div className="font-bold text-white leading-tight">{r.user?.name || 'Deleted User'}</div>
                      <div className="text-xs text-slate-400 mt-0.5 font-mono">{r.user?.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4.5 font-mono font-bold text-rose-400 text-base">
                      {formatCurrency(r.amountCents || 0)}
                    </td>
                    <td className="px-6 py-4.5 text-slate-400 font-mono text-xs select-all">
                      {r.walletAddress}
                    </td>
                    <td className="px-6 py-4.5 text-xs text-slate-400 font-medium">
                      {formatDate(r.requestedAt)}
                    </td>
                    <td className="px-6 py-4.5">
                      {getStatusBadge(r.status)}
                      {r.payoutWalletId && (
                        <div className="flex items-center gap-1 text-[10px] text-emerald-400 mt-1 font-mono">
                          <Wallet className="w-3 h-3" /> Ref: {r.payoutWalletId}
                        </div>
                      )}
                      {r.adminNote && (
                        <p className="text-[10px] text-slate-500 mt-1 max-w-[150px] truncate" title={r.adminNote}>
                          Note: {r.adminNote}
                        </p>
                      )}
                    </td>
                    {filterStatus === 'pending' && (
                      <td className="px-6 py-4.5 text-right space-x-2 shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(r._id, r.user?.name || 'User', r.amountCents)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold py-1.5"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => openRejectDialog(r._id)}
                          className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold py-1.5"
                        >
                          Reject
                        </Button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={filterStatus === 'pending' ? 6 : 5} className="text-center py-10 text-slate-500">
                    No withdrawal requests found in this status category
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="sm:max-w-md bg-slate-900 border border-slate-800 text-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-1.5">
              <XCircle className="w-5 h-5 text-rose-500" />
              Reject Withdrawal Request
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRejectSubmit} className="space-y-4">
            <div>
              <Label htmlFor="adminNote" className="text-slate-400 text-xs">Reason / Admin Note (Optional)</Label>
              <textarea
                id="adminNote"
                rows={3}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Invalid bank details, insufficient funds verification failure, etc..."
                className="mt-1 block w-full bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-rose-500 font-sans"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsRejectOpen(false)}
                className="flex-1 text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={rejecting}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold"
              >
                {rejecting ? 'Processing...' : 'Confirm Reject'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
