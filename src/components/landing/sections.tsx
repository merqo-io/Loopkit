import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ClosingCall, FaqRows } from "@merqo/ui";
import { Button } from "@merqo/ui/primitives";

import { CONTAINER, SECTION_PAD_Y } from "./rhythm";
import { PRICING_LINE, WAITLIST_URL } from "./waitlist";

const H2 =
  "text-balance font-display text-[clamp(32px,4.2vw,52px)] font-semibold leading-[1.05] tracking-[-0.015em]";

export const LANDING_FAQ = [
  {
    q: "Do customers need to download an app?",
    a: "No. Customers scan a QR at your counter and their stamp card lives on a web page, nothing to install.",
  },
  {
    q: "What do I need at the counter?",
    a: "A phone with a camera to scan a customer's code. You can also type in a customer's phone number to find or start their card.",
  },
  {
    q: "What if a customer loses their phone or switches browser?",
    a: "Their card is tied to the browser they joined on, so they need the saved card code to open it again. If they lost the code, you can recover their card from your dashboard and their progress is kept.",
  },
];

export function LandingFaq() {
  return (
    <section id="faq" className={`scroll-mt-20 border-t ${SECTION_PAD_Y}`}>
      <div className={CONTAINER}>
        <div className="grid gap-10 min-[960px]:grid-cols-[1fr_1.4fr] min-[960px]:gap-16">
          <h2 className={H2}>Questions vendors ask first.</h2>
          <FaqRows rows={LANDING_FAQ} />
        </div>
      </div>
    </section>
  );
}

export function LandingClosing({ authed = false }: { authed?: boolean }) {
  return (
    <section className={SECTION_PAD_Y}>
      <div className={CONTAINER}>
        <ClosingCall
          heading="Put a stamp card on your counter."
          line="Stamp by phone, reward the regulars."
          action={
            <Button asChild size="lg" className="h-12 rounded-lg px-[26px]">
              {authed ? (
                <Link href="/dashboard">
                  Go to dashboard
                  <ArrowRight className="size-4" />
                </Link>
              ) : (
                <a href={WAITLIST_URL}>
                  Join the waitlist
                  <ArrowRight className="size-4" />
                </a>
              )}
            </Button>
          }
          aside={<p className="text-lg leading-[1.55]">{PRICING_LINE}</p>}
        />
      </div>
    </section>
  );
}
