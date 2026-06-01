'use client';

import Link from 'next/link';

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <h2 className="text-xl font-bold text-text-dark mb-2">Something went wrong</h2>
      <p className="text-text-muted text-sm mb-6 max-w-sm">{error.message || 'An unexpected error occurred.'}</p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-lg bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="px-5 py-2.5 rounded-lg border-2 border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
