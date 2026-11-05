// aria-busy plus sr-only text lets screen readers announce the pending route
// that the pulse blocks only convey visually.
export default function CustomerDetailLoading() {
  return (
    <div role="status" aria-busy="true" className="space-y-8">
      <span className="sr-only">Loading customer</span>
      <div className="space-y-2">
        <div className="h-3 w-20 animate-pulse rounded bg-muted" />
        <div className="h-9 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-64 animate-pulse rounded bg-muted" />
      </div>
      <div className="space-y-3">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-2xl border bg-card p-4 shadow-sm">
            <div className="h-4 w-40 animate-pulse rounded bg-muted" />
            <div className="mt-3 h-3 w-full animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="h-11 w-full animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  );
}
