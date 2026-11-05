// aria-busy plus sr-only text lets screen readers announce the pending route
// that the pulse blocks only convey visually.
export default function RedeemVoucherLoading() {
  return (
    <div role="status" aria-busy="true" className="mx-auto max-w-md space-y-6">
      <span className="sr-only">Loading voucher</span>
      <div className="space-y-2">
        <div className="h-3 w-20 animate-pulse rounded bg-muted" />
        <div className="h-9 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-64 animate-pulse rounded bg-muted" />
      </div>
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="mt-4 h-20 w-full animate-pulse rounded-xl bg-muted" />
        <div className="mt-5 h-11 w-full animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  );
}
