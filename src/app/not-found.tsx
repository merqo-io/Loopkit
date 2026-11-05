import Link from "next/link";
import { Wordmark } from "@/components/landing/wordmark";
import { Button } from "@/components/ui/button";

/** Branded 404 — reached e.g. when a customer opens a stale or mistyped card link. */
export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-4 px-6 text-center">
      <Wordmark className="text-2xl" />
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Error 404
      </p>
      <h1 className="font-display text-3xl font-semibold">Page not found</h1>
      <p className="text-sm text-muted-foreground">
        This page does not exist. Ask the shop for their loyalty link to check
        your stamps.
      </p>
      <Button asChild className="h-11 rounded-xl px-6 font-semibold">
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}
