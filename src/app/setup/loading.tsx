export default function SetupLoading() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col p-5 md:max-w-4xl">
      <div role="status" aria-busy="true" className="w-full space-y-6">
        <span className="sr-only">Loading</span>
        <div className="h-9 w-32 animate-pulse rounded-lg bg-muted" />
        <div className="space-y-2">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-8 w-56 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="h-11 w-full animate-pulse rounded-xl bg-muted" />
          <div className="h-11 w-full animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    </main>
  );
}
