import type { ComponentProps } from "react";
import { cn } from "@merqo/ui/primitives";

/** A flat working surface: paper tone with a 2px printed bottom edge, no blur. */
export function FormCard({ className, ...props }: ComponentProps<"form">) {
  return (
    <form
      {...props}
      className={cn(
        "rounded-2xl border border-b-2 bg-card shadow-none",
        className,
      )}
    />
  );
}
