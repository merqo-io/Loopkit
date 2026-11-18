const BENEFITS = [
  {
    title: "Regulars, not one-offs",
    body: "A reason to come back beats a one-time sale. loopkit gives them the reason: a reward they're already halfway to.",
  },
  {
    title: "Customers need no app or card",
    body: "No app for customers, no plastic cards, no hardware. A phone number is the whole thing.",
  },
  {
    title: "Built for a stall",
    body: "Made for home kitchens, pop-ups, and small cafes. Plain and fast, sized for one counter.",
  },
];

export function Benefits() {
  return (
    <section className="border-t">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-5">
        <div className="md:col-span-2">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Why vendors switch
          </p>
          <h2 className="mt-3 max-w-xl text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Less setup, more regulars.
          </h2>
        </div>
        <dl className="divide-y md:col-span-3">
          {BENEFITS.map((b) => (
            <div key={b.title} className="py-5 first:pt-0 last:pb-0">
              <dt className="font-display text-lg font-bold">{b.title}</dt>
              <dd className="mt-2 max-w-prose text-sm leading-6 text-muted-foreground">
                {b.body}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
