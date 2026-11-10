import { cn } from "@merqo/ui/primitives";

const bar = "animate-pulse rounded bg-muted";

/**
 * Shared pieces for the admin routes' loading.tsx files, shaped like the
 * dashboard's skeleton: header, optional stat tiles, then one card.
 */
export function AdminLoadingShell({
  tiles = 0,
  rows = 6,
}: {
  tiles?: number;
  rows?: number;
}) {
  return (
    <main
      aria-busy="true"
      className="mx-auto w-full max-w-7xl space-y-8 px-5 py-7"
    >
      <span role="status" className="sr-only">
        Loading
      </span>
      <div className="space-y-2">
        <div className={cn(bar, "h-3 w-16")} />
        <div className="h-9 w-48 animate-pulse rounded-lg bg-muted" />
      </div>
      {tiles > 0 && (
        <div
          className={cn(
            "grid grid-cols-2 gap-3",
            tiles === 4 ? "sm:grid-cols-4" : "sm:grid-cols-3 lg:grid-cols-5",
          )}
        >
          {Array.from({ length: tiles }).map((_, i) => (
            <div
              key={i}
              data-testid="skeleton-tile"
              className="rounded-2xl border bg-card p-4 shadow-sm"
            >
              <div className={cn(bar, "h-7 w-16")} />
              <div className={cn(bar, "mt-2 h-3 w-24")} />
            </div>
          ))}
        </div>
      )}
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className={cn(bar, "h-4 w-32")} />
        <div className="mt-4 space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className={cn(bar, "h-5 w-full")} />
          ))}
        </div>
      </div>
    </main>
  );
}
