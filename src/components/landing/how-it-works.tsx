// A real sequence (set up → stamp → return), so numbered markers carry meaning.
const STEPS = [
  {
    title: "Set up your card",
    body: "Pick how many stamps earn a reward and what the reward is.",
  },
  {
    title: "Stamp by phone",
    body: "At the counter, type the customer's number and tap. No app, no card to carry.",
  },
  {
    title: "They come back",
    body: "When the card's full they redeem the reward, and you've made a regular.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="border-t">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          How it works
        </p>
        <h2 className="mt-3 max-w-xl text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Three steps to a regular.
        </h2>
        <ol className="mt-10 max-w-2xl space-y-8">
          {STEPS.map((s, i) => (
            <li
              key={s.title}
              className="grid grid-cols-[4rem_1fr] items-baseline"
            >
              <span className="font-mono text-4xl font-semibold text-primary">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-display text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {s.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
