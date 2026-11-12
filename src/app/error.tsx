"use client";

import { ErrorPage } from "@merqo/ui";
import { Wordmark } from "@/components/landing/wordmark";

/**
 * Root error boundary: replaces the raw Next error overlay in production if an
 * RSC throws (e.g. Supabase unreachable on a patchy stall connection).
 */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorPage
      error={error}
      reset={reset}
      wordmark={<Wordmark className="text-2xl" />}
      eyebrow="Something went wrong"
      title="That did not load"
      description="This is usually a flaky connection. Try again in a moment."
      resetLabel="Try again"
    />
  );
}
