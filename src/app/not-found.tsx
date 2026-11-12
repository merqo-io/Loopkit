import Link from "next/link";
import { NotFound } from "@merqo/ui";
import { Wordmark } from "@/components/landing/wordmark";
import { Button } from "@merqo/ui/primitives";

/** Branded 404: reached e.g. when a customer opens a stale or mistyped card link. */
export default function NotFoundPage() {
  return (
    <NotFound
      wordmark={<Wordmark className="text-2xl" />}
      code="404"
      title="Page not found"
      description="This page does not exist. Ask the shop for their loyalty link to check your stamps."
      action={
        <Button asChild className="h-11 rounded-xl px-6 font-semibold">
          <Link href="/">Back to home</Link>
        </Button>
      }
      LinkComponent={Link}
    />
  );
}
