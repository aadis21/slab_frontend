'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, AlertCircle, RefreshCw, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';

interface OrderData {
  orderId: string;
  amount: number;
  currency: string;
  plan: { id: string; name: string; price: number };
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function PaymentPage({ params }: { params: { planId: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
  const isMockMode = !razorpayKey || razorpayKey === 'rzp_test_xxxxxxxxxx';

  const createOrder = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.post('/payment/order', { planId: params.planId });
      setOrder(res.data.data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to create order';
      toast.error(msg);
      setPaymentStatus('failed');
    } finally {
      setLoading(false);
    }
  }, [params.planId]);

  useEffect(() => {
    createOrder();
  }, [createOrder]);

  // Load Razorpay script
  const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleMockPayment = async () => {
    if (!order) return;
    setPaymentStatus('processing');
    try {
      await api.post('/payment/verify', {
        razorpayOrderId: order.orderId,
        razorpayPaymentId: `pay_mock_${Date.now()}`,
        razorpaySignature: 'mock_signature',
        planId: params.planId,
      });
      setPaymentStatus('success');
      await launchConfetti();
      toast.success('Payment successful! Subscription activated 🎉');
      setTimeout(() => router.push('/dashboard'), 3000);
    } catch {
      setPaymentStatus('failed');
      toast.error('Payment verification failed');
    }
  };

  const handleRazorpayPayment = async () => {
    if (!order) return;
    const loaded = await loadRazorpay();
    if (!loaded) { toast.error('Failed to load Razorpay'); return; }

    setPaymentStatus('processing');
    const rzp = new window.Razorpay({
      key: razorpayKey,
      amount: order.amount,
      currency: order.currency,
      order_id: order.orderId,
      name: 'InvestSlabs',
      description: `${order.plan.name} Plan Subscription`,
      theme: { color: '#1A5C3A' },
      handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
        try {
          await api.post('/payment/verify', {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            planId: params.planId,
          });
          setPaymentStatus('success');
          await launchConfetti();
          toast.success('Payment successful! 🎉');
          setTimeout(() => router.push('/dashboard'), 3000);
        } catch {
          setPaymentStatus('failed');
          toast.error('Payment verification failed');
        }
      },
      modal: {
        ondismiss: () => setPaymentStatus('idle'),
      },
    });
    rzp.open();
  };

  const launchConfetti = async () => {
    const confetti = (await import('canvas-confetti')).default;
    const count = 200;
    const defaults = { origin: { y: 0.7 } };
    function fire(particleRatio: number, opts: Record<string, unknown>) {
      confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) });
    }
    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  };

  if (paymentStatus === 'success') {
    return (
      <div className="max-w-md mx-auto text-center py-16 animate-slide-up">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-text-dark mb-2">Payment Successful!</h1>
        <p className="text-text-muted mb-6">
          Your subscription to the <strong>{order?.plan?.name}</strong> plan is now active.
          Redirecting to dashboard...
        </p>
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="max-w-md mx-auto text-center py-16 animate-slide-up">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-text-dark mb-2">Payment Failed</h1>
        <p className="text-text-muted mb-6">Something went wrong. Please try again.</p>
        <Button id="retry-payment" onClick={() => { setPaymentStatus('idle'); createOrder(); }} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Retry Payment
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto animate-slide-up space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-dark">Complete Payment</h1>
        <p className="text-text-muted text-sm mt-1">You&apos;re one step away from activating your plan</p>
      </div>

      {loading ? (
        <div className="card space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      ) : order ? (
        <div className="card space-y-6">
          {/* Order summary */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
            <p className="text-xs text-text-muted uppercase tracking-wide font-medium mb-3">Order Summary</p>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-text-muted">{order.plan.name} Plan (Monthly)</span>
              <span className="text-sm font-semibold">{formatCurrency(order.amount)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-text-muted">GST (0%)</span>
              <span className="text-sm text-text-muted">₹0</span>
            </div>
            <div className="h-px bg-gray-200 my-2" />
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-text-dark">Total</span>
              <span className="text-xl font-extrabold text-primary-600">{formatCurrency(order.amount)}</span>
            </div>
          </div>

          {isMockMode && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-xs text-amber-800 font-medium">
                🧪 Demo Mode — Razorpay key not configured. Click below to simulate a successful payment.
              </p>
            </div>
          )}

          <Button
            id="pay-now-btn"
            onClick={isMockMode ? handleMockPayment : handleRazorpayPayment}
            loading={paymentStatus === 'processing'}
            className="w-full h-12 text-base font-bold rounded-xl"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            {isMockMode ? 'Simulate Payment' : `Pay ${formatCurrency(order.amount)}`}
          </Button>

          <p className="text-center text-xs text-text-muted">
            🔒 Secured by Razorpay · 256-bit SSL encryption
          </p>
        </div>
      ) : null}
    </div>
  );
}
