import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Shown where a list or panel has nothing in it yet: a headline ("No X yet."),
 * one helpful sentence and up to two next steps. Self-contained so it can move
 * to the shared UI package unchanged.
 */
export function EmptyState({
  title,
  children,
  actions,
  className,
}: {
  title: ReactNode;
  /** One muted sentence saying what to do next. */
  children?: ReactNode;
  /** Up to two links or buttons; the first may be the primary one. */
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed bg-card/50 px-6 py-10 text-center",
        className,
      )}
    >
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
      {children && (
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          {children}
        </p>
      )}
      {actions && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}
