'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export interface Plan {
  _id: string;
  name: string;
  priceUSD: number;           // cents
  minInvestmentUSD: number;   // cents
  annualReturnPercent: number; // e.g. 14 for 14%
  durationDays: number;
  features: string[];
  isRecommended: boolean;
  isActive: boolean;
  color: string;
}

interface UsePlansReturn {
  plans: Plan[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePlans(): UsePlansReturn {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/plans');
      setPlans(res.data.data.plans);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch plans';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return { plans, loading, error, refetch: fetchPlans };
}
