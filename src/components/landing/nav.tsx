import { LandingNav, type NavUser } from "@merqo/ui";
import Link from "next/link";
import { Button } from "@merqo/ui/primitives";
import { Wordmark } from "./wordmark";
import { WAITLIST_URL } from "./waitlist";
import { NavAccount } from "./nav-account";
import { signOutAction } from "@/app/actions/auth";

export function Nav({
  authed = false,
  account = null,
}: {
  authed?: boolean;
  account?: NavUser | null;
}) {
  return (
    <LandingNav
      wordmark={
        <Link
          href="/"
          className="rounded-sm outline-none transition-opacity hover:opacity-80 focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <Wordmark className="text-3xl" />
          <span className="sr-only">loopkit home</span>
        </Link>
      }
      end={
        <>
          <Link
            href="/about"
            className="rounded-sm px-1 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            About
          </Link>
          <Link
            href="/faq"
            className="rounded-sm px-1 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            FAQ
          </Link>
          {authed && account ? (
            <NavAccount user={account} signOut={signOutAction} />
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-sm px-1 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                Sign in
              </Link>
              <Button asChild size="sm">
                <a href={WAITLIST_URL}>Join the waitlist</a>
              </Button>
            </>
          )}
        </>
      }
    />
  );
}
