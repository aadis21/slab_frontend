import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary-50 text-primary-700 ring-primary-600/20',
        secondary: 'bg-gray-100 text-gray-700 ring-gray-500/20',
        success: 'bg-green-50 text-green-700 ring-green-600/20',
        destructive: 'bg-red-50 text-red-700 ring-red-600/20',
        warning: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
        gold: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20 font-semibold',
        outline: 'border border-current bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
