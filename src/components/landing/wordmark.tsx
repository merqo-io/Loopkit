import { Wordmark as WordmarkShell } from "@merqo/ui";

/** LoopKit wordmark. The "oo" are two gold stamp dots, the reward motif that
 *  runs through the brand. PascalCase compound, matching the Merqo kit-family
 *  logo convention (Apple's -Kit-style precedent: both halves capitalized). */
export function Wordmark({ className }: { className?: string }) {
  return (
    <WordmarkShell size="sm" className={className}>
      L
      <span className="text-gold" aria-hidden>
        oo
      </span>
      pKit
    </WordmarkShell>
  );
}
