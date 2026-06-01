'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Heart, QrCode, CheckCircle, Info } from 'lucide-react';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DonationModal({ isOpen, onClose }: DonationModalProps) {
  const { user } = useAuth();
  const [donorName, setDonorName] = useState(user?.name || '');
  const [donorEmail, setDonorEmail] = useState(user?.email || '');
  const [amountDollars, setAmountDollars] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Prefill when user data loads
  React.useEffect(() => {
    if (user) {
      setDonorName(user.name);
      if (user.email) setDonorEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountDollars || isNaN(Number(amountDollars)) || Number(amountDollars) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!transactionId.trim()) {
      toast.error('Please enter the payment Transaction ID');
      return;
    }

    try {
      setLoading(true);
      const amountCents = Math.round(Number(amountDollars) * 100);
      await api.post('/donations', {
        donorName,
        donorEmail,
        amountCents,
        transactionId: transactionId.trim(),
      });
      setSuccess(true);
      toast.success('Donation details submitted successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to submit donation details');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAmountDollars('');
    setTransactionId('');
    setSuccess(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => { if (!open) handleReset(); }}>
      <DialogContent className="sm:max-w-md border border-gray-100 bg-white shadow-2xl rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <Heart className="w-5 h-5 text-red-500 fill-red-500 animate-pulse" />
            Support InvestSlabs
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-sm">
            Scan the QR code below, complete your payment, and submit the details to credit your wallet balance.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Receipt Submitted</h3>
            <p className="text-sm text-gray-500 max-w-sm mb-6">
              Our admin team will verify your transaction ID shortly. Once approved, the amount of{' '}
              <strong className="text-gray-900 font-semibold">${Number(amountDollars).toFixed(2)}</strong> will be credited directly to your wallet!
            </p>
            <Button onClick={handleReset} className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-xl py-2 font-medium">
              Close Window
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* QR Code Scan Area */}
            <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center justify-center border border-dashed border-gray-200">
              <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                <QrCode className="w-3.5 h-3.5" /> Scan QR to Pay
              </span>
              
              {/* SVG QR Code */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="140" height="140" className="border-4 border-white rounded-lg shadow bg-white text-gray-900">
                <rect x="10" y="10" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="4"/>
                <rect x="14" y="14" width="12" height="12" fill="currentColor"/>
                
                <rect x="70" y="10" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="4"/>
                <rect x="74" y="14" width="12" height="12" fill="currentColor"/>
                
                <rect x="10" y="70" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="4"/>
                <rect x="14" y="74" width="12" height="12" fill="currentColor"/>

                <rect x="35" y="10" width="5" height="5" fill="currentColor"/>
                <rect x="45" y="15" width="5" height="10" fill="currentColor"/>
                <rect x="55" y="10" width="10" height="5" fill="currentColor"/>
                
                <rect x="10" y="35" width="5" height="5" fill="currentColor"/>
                <rect x="15" y="45" width="10" height="5" fill="currentColor"/>
                <rect x="10" y="55" width="5" height="10" fill="currentColor"/>

                <rect x="35" y="35" width="10" height="10" fill="currentColor"/>
                <rect x="50" y="35" width="5" height="5" fill="currentColor"/>
                <rect x="40" y="50" width="15" height="5" fill="currentColor"/>
                <rect x="35" y="60" width="5" height="10" fill="currentColor"/>
                
                <rect x="60" y="45" width="10" height="10" fill="currentColor"/>
                <rect x="75" y="35" width="5" height="15" fill="currentColor"/>
                <rect x="70" y="55" width="10" height="5" fill="currentColor"/>

                <rect x="45" y="70" width="5" height="10" fill="currentColor"/>
                <rect x="55" y="75" width="10" height="15" fill="currentColor"/>
                <rect x="70" y="75" width="5" height="5" fill="currentColor"/>
                <rect x="80" y="70" width="10" height="10" fill="currentColor"/>
              </svg>
              
              <p className="text-[11px] text-gray-500 mt-2 text-center max-w-[240px]">
                Scan this QR code with any payment app to transfer money.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="donorName" className="text-xs text-gray-600 font-medium">Full Name</Label>
                <Input
                  id="donorName"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Your Name"
                  required
                  className="mt-1 h-9 rounded-lg border-gray-200 focus:border-primary-500 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="donorEmail" className="text-xs text-gray-600 font-medium">Email Address</Label>
                <Input
                  id="donorEmail"
                  type="email"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  placeholder="name@domain.com"
                  required
                  className="mt-1 h-9 rounded-lg border-gray-200 focus:border-primary-500 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="amountUSD" className="text-xs text-gray-600 font-medium">Amount (USD $)</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2.5 text-gray-400 text-xs">$</span>
                  <Input
                    id="amountUSD"
                    type="number"
                    step="0.01"
                    min="1"
                    value={amountDollars}
                    onChange={(e) => setAmountDollars(e.target.value)}
                    placeholder="250.00"
                    required
                    className="pl-7 h-9 rounded-lg border-gray-200 focus:border-primary-500 text-sm"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="transactionId" className="text-xs text-gray-600 font-medium">Transaction ID / Ref</Label>
                <Input
                  id="transactionId"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="TXN12345678"
                  required
                  className="mt-1 h-9 rounded-lg border-gray-200 focus:border-primary-500 text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2 text-[11px] text-gray-500 bg-amber-50/55 p-3 rounded-lg border border-amber-100/50">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Verify that you copy the transaction ID exactly. Providing an incorrect reference may delay or invalidate your request.
              </span>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="flex-1 rounded-xl h-10 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 text-sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl h-10 bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50 text-sm"
              >
                {loading ? 'Submitting...' : 'Submit Payment'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
