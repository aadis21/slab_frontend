'use client';

export default function AuthError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-bold text-text-dark mb-2">Something went wrong</h2>
        <p className="text-text-muted mb-4">{error.message}</p>
        <button onClick={reset} className="btn-primary">Try again</button>
      </div>
    </div>
  );
}
