import { PRICING_LINE } from "./waitlist";

type FaqEntry = { q: string; a: string };

const FAQ: FaqEntry[] = [
  {
    q: "Do customers need to download an app?",
    a: "No. Customers scan a QR at your counter and their stamp card lives on a web page, nothing to install.",
  },
  {
    q: "How long does it take to set up a loyalty program?",
    a: "Pick stamps, points, or a lucky-draw reward, print the QR, and you're running a program.",
  },
  {
    q: "What happens when a customer completes their card?",
    a: "They show their card at your counter and you redeem the reward you set up, such as a free item or a discount.",
  },
  {
    q: "What does it cost?",
    a: PRICING_LINE,
  },
];

function FaqItem({ q, a }: FaqEntry) {
  return (
    <details className="group overflow-hidden rounded-xl border border-border bg-card open:border-primary/50">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-4 outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-inset">
        <span className="text-base font-semibold leading-snug text-foreground">
          {q}
        </span>
        <span
          aria-hidden
          className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-border text-lg leading-none text-muted-foreground transition-transform group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="px-5 pb-5 text-sm leading-relaxed text-foreground/80">
        {a}
      </div>
    </details>
  );
}

export function Faq() {
  return (
    <section id="faq" className="border-t">
      <div className="mx-auto max-w-3xl px-5 py-16">
        <p className="text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Questions
        </p>
        <h2 className="mt-3 text-balance text-center font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Still wondering?
        </h2>
        <div className="mt-10 space-y-3">
          {FAQ.map((item) => (
            <FaqItem key={item.q} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}
