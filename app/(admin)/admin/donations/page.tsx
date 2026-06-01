'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Heart,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Hash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Donation {
  _id: string;
  user: {
    _id: string;
    name: string;
    phone: string;
    email?: string;
  };
  donorName: string;
  donorEmail: string;
  amountCents: number;
  transactionId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function AdminDonations() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending');

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const url = filterStatus === 'all'
        ? '/donations/admin/list'
        : `/donations/admin/list?status=${filterStatus}`;
      const res = await api.get(url);
      setDonations(res.data.data.donations);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to fetch donations list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [filterStatus]);

  const handleApprove = async (id: string, name: string, amount: number) => {
    const formattedAmount = formatCurrency(amount);
    if (!confirm(`Are you sure you want to approve the donation of ${formattedAmount} from ${name}? This will verify the payment and credit their wallet balance.`)) return;

    try {
      await api.patch(`/donations/admin/approve/${id}`);
      toast.success('Donation approved and wallet credited successfully!');
      fetchDonations();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to approve donation');
    }
  };

  const handleReject = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to reject this donation receipt from ${name}?`)) return;

    try {
      await api.patch(`/donations/admin/reject/${id}`);
      toast.success('Donation receipt marked as rejected');
      fetchDonations();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to reject donation');
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
            <CheckCircle2 className="w-3.5 h-3.5" /> Verified & Credited
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
            <Heart className="w-7 h-7 text-rose-500" />
            Donations & Scanner Log
          </h1>
          <p className="text-slate-400 text-sm mt-1">Review user offline scanner payments, match transaction IDs, and update user wallets.</p>
        </div>

        <button
          onClick={fetchDonations}
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

      {/* Donations table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold text-xs uppercase bg-slate-950/40">
                <th className="px-6 py-4">Donor Profile</th>
                <th className="px-6 py-4 font-mono">Amount Donated</th>
                <th className="px-6 py-4 font-mono">Transaction ID / Reference</th>
                <th className="px-6 py-4">Submission Date</th>
                <th className="px-6 py-4">Verification Status</th>
                {filterStatus === 'pending' && <th className="px-6 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {donations.length > 0 ? (
                donations.map((d) => (
                  <tr key={d._id} className="text-slate-300 hover:bg-slate-800/10 transition">
                    <td className="px-6 py-4.5">
                      <div className="font-bold text-white leading-tight">{d.donorName}</div>
                      <div className="text-xs text-slate-400 mt-0.5 font-mono">{d.donorEmail}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Account User: {d.user?.name || 'Deleted'}</div>
                    </td>
                    <td className="px-6 py-4.5 font-mono font-bold text-emerald-400 text-base">
                      {formatCurrency(d.amountCents || 0)}
                    </td>
                    <td className="px-6 py-4.5 font-mono text-xs select-all text-slate-300">
                      <span className="inline-flex items-center gap-1 font-semibold bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg text-slate-200">
                        <Hash className="w-3.5 h-3.5 text-rose-500" />
                        {d.transactionId}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-xs text-slate-400 font-medium">
                      {formatDate(d.createdAt)}
                    </td>
                    <td className="px-6 py-4.5">
                      {getStatusBadge(d.status)}
                    </td>
                    {filterStatus === 'pending' && (
                      <td className="px-6 py-4.5 text-right space-x-2 shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(d._id, d.donorName, d.amountCents)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold py-1.5"
                        >
                          Verify Payment
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleReject(d._id, d.donorName)}
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
                    No donation submissions found in this category
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
