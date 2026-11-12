"use client";

import { GlobalError } from "@merqo/ui";

// Next renders this only when the root layout itself throws, before any
// stylesheet loads, so the colours are literal copies of the light tokens in
// globals.css and the font is a system stack (the next/font variables live on
// the layout it replaces).
const COLORS = {
  background: "oklch(0.97 0.013 56.3)",
  foreground: "oklch(0.22 0.035 28.9)",
  mutedForeground: "oklch(0.45 0.035 15)",
  primary: "oklch(0.463 0.186 19)",
  primaryForeground: "oklch(1 0 0)",
};

const SYSTEM_FONT =
  'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export default function GlobalErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <GlobalError
      reset={reset}
      colors={COLORS}
      radius="0.75rem"
      fontFamily={SYSTEM_FONT}
      title="That did not load"
      description="An unexpected error interrupted the page. Try again, and refresh in a moment if it keeps happening."
      resetLabel="Try again"
    />
  );
}
