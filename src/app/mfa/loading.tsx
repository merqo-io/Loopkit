export default function MfaLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center p-5">
      <div
        role="status"
        aria-busy="true"
        className="w-full max-w-md rounded-2xl border bg-card px-7 py-10 shadow-sm"
      >
        <span className="sr-only">Loading</span>
        <div className="h-7 w-28 animate-pulse rounded bg-muted" />
        <div className="mt-6 h-9 w-64 animate-pulse rounded-lg bg-muted" />
        <div className="mt-6 space-y-3">
          <div className="h-11 w-full animate-pulse rounded-xl bg-muted" />
          <div className="h-11 w-full animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    </main>
  );
}
