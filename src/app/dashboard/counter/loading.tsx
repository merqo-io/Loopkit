// aria-busy plus sr-only text lets screen readers announce the pending route
// that the pulse blocks only convey visually.
export default function CounterLoading() {
  return (
    <div role="status" aria-busy="true" className="mx-auto max-w-4xl space-y-6">
      <span className="sr-only">Loading counter</span>
      <div className="space-y-2">
        <div className="h-3 w-20 animate-pulse rounded bg-muted" />
        <div className="h-9 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-64 animate-pulse rounded bg-muted" />
      </div>
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="mt-4 h-14 w-full animate-pulse rounded-xl bg-muted" />
        <div className="mt-3 h-11 w-full animate-pulse rounded-xl bg-muted" />
      </div>
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-4 w-28 animate-pulse rounded bg-muted" />
              <div className="h-3 w-16 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
