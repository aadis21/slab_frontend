import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="stat-card">
            <Skeleton className="h-10 w-10 rounded-lg mb-3" />
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-7 w-28" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <Skeleton className="h-5 w-40 mb-4" />
          <Skeleton className="h-16 w-full" />
        </div>
        <div className="card">
          <Skeleton className="h-5 w-28 mb-4" />
          <Skeleton className="h-14 w-full mb-3 rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
