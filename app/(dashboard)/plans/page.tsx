'use client';

import { usePlans } from '@/hooks/usePlans';
import { PlanCard } from '@/components/PlanCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function PlansPage() {
  const { plans, loading, error } = usePlans();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <h1 className="text-3xl font-extrabold text-text-dark">Investment Plans</h1>
        <p className="text-text-muted mt-2">
          Choose a plan that matches your financial goals. All investment contracts are secure and verified.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border-2 border-gray-100 bg-white p-6 space-y-4">
              <Skeleton className="h-1.5 w-full rounded-full" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-px w-full" />
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-4 w-full" />
              ))}
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">
          <p className="font-medium">{error}</p>
          <p className="text-sm text-text-muted mt-1">Make sure the backend is running on port 5000.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 items-start">
          {plans.map((plan) => (
            <PlanCard key={plan._id} plan={plan} />
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-center text-xs text-text-muted pt-4">
        * Returns are indicative and based on historical data. Past performance is not a guarantee of future results.
      </p>
    </div>
  );
}
