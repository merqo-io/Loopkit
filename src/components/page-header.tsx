import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The top of a screen: a small uppercase label for the area, the one h1 in the
 * display font, an optional muted line, and an optional action on the right.
 * Self-contained so it can move to the shared UI package unchanged.
 */
export function PageHeader({
  eyebrow,
  title,
  children,
  action,
  className,
  ...rest
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  /** Muted line under the title. */
  children?: ReactNode;
  /** A button or control placed beside the title (below it on a phone). */
  action?: ReactNode;
} & Omit<ComponentProps<"header">, "title">) {
  return (
    <header
      className={cn(
        "mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
      {...rest}
    >
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {eyebrow}
        </p>
        <h1 className="font-display text-3xl leading-tight font-semibold sm:text-4xl">
          {title}
        </h1>
        {children && (
          <div className="mt-2 text-sm text-muted-foreground">{children}</div>
        )}
      </div>
      {action}
    </header>
  );
}
