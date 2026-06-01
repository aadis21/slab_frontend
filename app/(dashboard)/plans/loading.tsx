import { Skeleton } from '@/components/ui/skeleton';

export default function PlansLoading() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Skeleton className="h-9 w-64 mx-auto mb-3" />
        <Skeleton className="h-4 w-96 mx-auto" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border-2 border-gray-100 bg-white p-6 space-y-4">
            <Skeleton className="h-1.5 w-full" />
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
    </div>
  );
}
