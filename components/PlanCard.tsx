'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle2, Star, TrendingUp, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plan } from '@/hooks/usePlans';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface PlanCardProps {
  plan: Plan;
}

export function PlanCard({ plan }: PlanCardProps) {
  const router = useRouter();

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-2xl border-2 bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1',
        plan.isRecommended
          ? 'border-amber-500 shadow-md'
          : 'border-gray-150 hover:border-primary-200'
      )}
    >
      {/* Top accent bar */}
      <div
        className="h-1.5 rounded-t-2xl"
        style={{ backgroundColor: plan.color }}
      />

      {/* Most Popular badge */}
      {plan.isRecommended && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <Badge variant="gold" className="px-4 py-1 text-[10px] font-extrabold shadow-sm bg-amber-500 text-white rounded-full uppercase tracking-wider">
            <Star className="w-3 h-3 mr-1 fill-current inline-block" />
            Recommended
          </Badge>
        </div>
      )}

      <div className="flex flex-col flex-1 p-6 pt-5 gap-4">
        {/* Plan name & return */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl font-bold text-text-dark">{plan.name}</h2>
            <span
              className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: plan.color + '1A', color: plan.color }}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              {plan.annualReturnPercent}% p.a.
            </span>
          </div>
          <p className="text-text-muted text-xs">
            Min. capital: <span className="font-semibold text-text-dark">{formatCurrency(plan.minInvestmentUSD)}</span>
          </p>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black text-text-dark">
            {formatCurrency(plan.priceUSD)}
          </span>
          <span className="text-text-muted text-xs font-semibold">one-time cost</span>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100" />

        {/* Features */}
        <ul className="flex flex-col gap-2.5 flex-1">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
              <CheckCircle2
                className="w-4 h-4 mt-0.5 flex-shrink-0"
                style={{ color: plan.color }}
              />
              <span className="leading-tight">{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Button
          id={`choose-plan-${plan._id}`}
          onClick={() => router.push(`/confirm/${plan._id}`)}
          className={cn(
            'w-full mt-2 font-bold text-base h-12 rounded-xl transition-all duration-200 text-white',
            plan.isRecommended
              ? 'bg-amber-500 hover:bg-amber-600 shadow'
              : 'bg-primary-600 hover:bg-primary-700'
          )}
        >
          Select {plan.name}
        </Button>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-text-muted">
          <Shield className="w-3.5 h-3.5" />
          <span>Manual Admin Verification</span>
        </div>
      </div>
    </div>
  );
}
