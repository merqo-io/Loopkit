import Link from "next/link";
import { Footer as SharedFooter } from "@merqo/ui";
import { Wordmark } from "./wordmark";

/**
 * loopkit's copy of the family footer. The dashboard passes
 * `showSignIn={false}`, since everyone there is already signed in.
 */
export function Footer({ showSignIn = true }: { showSignIn?: boolean }) {
  return (
    <SharedFooter
      wordmark={
        <Link
          href="/"
          aria-label="loopkit home"
          className="transition-opacity hover:opacity-80"
        >
          <Wordmark className="text-xl" />
        </Link>
      }
      tagline="Loyalty for Singapore’s small vendors."
      kitName="loopkit"
      showSignIn={showSignIn}
    />
  );
}
