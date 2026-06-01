'use client';

import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Payment {
  _id: string;
  plan: { name: string; color: string };
  amount: number; // paise
  status: 'pending' | 'success' | 'failed';
  createdAt: string;
}

interface PaymentHistoryProps {
  payments: Payment[];
  loading: boolean;
}

const statusVariantMap: Record<string, 'success' | 'warning' | 'destructive' | 'default'> = {
  success: 'success',
  pending: 'warning',
  failed: 'destructive',
};

export function PaymentHistory({ payments, loading }: PaymentHistoryProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-10 text-text-muted">
        <p className="text-sm">No payment history yet.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Plan</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment._id}>
            <TableCell className="text-text-muted">{formatDate(payment.createdAt)}</TableCell>
            <TableCell>
              <span className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: payment.plan?.color || '#ccc' }}
                />
                {payment.plan?.name || 'Unknown Plan'}
              </span>
            </TableCell>
            <TableCell className="font-semibold">{formatCurrency(payment.amount)}</TableCell>
            <TableCell>
              <Badge variant={statusVariantMap[payment.status] || 'default'}>
                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
