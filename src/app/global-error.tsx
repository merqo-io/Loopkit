"use client";

import "./globals.css";

// Root error boundary. Next renders this ONLY when the root layout itself throws
// (nested errors are caught closer); it replaces the layout, so it must ship its
// own <html>/<body>. It imports the global stylesheet for the theme tokens but
// not the next/font variables (those live on the layout it replaces), so type
// falls back to the system stack. Kept dependency-free beyond that.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
        <div className="max-w-sm text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Something went wrong
          </p>
          <h1 className="font-display mt-3 text-3xl font-semibold">
            That did not load
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            An unexpected error interrupted the page. Try again, and refresh in
            a moment if it keeps happening.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-6 h-11 cursor-pointer rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
