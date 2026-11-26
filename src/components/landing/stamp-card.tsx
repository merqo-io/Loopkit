"use client";

import { useState } from "react";
import { PhoneFrame } from "@merqo/ui";

import { CardScreen, type CardStatus } from "./card-screen";
import { CARD_TOTAL } from "./card-labels";

type StateKey = "joined" | "mid" | "ready";

const STATES: Record<
  StateKey,
  { label: string; stamps: number; status: CardStatus }
> = {
  joined: { label: "Just joined", stamps: 1, status: "stamping" },
  mid: { label: "Mid-card", stamps: 5, status: "stamping" },
  ready: { label: "Reward ready", stamps: CARD_TOTAL, status: "ready" },
};

const ORDER: readonly StateKey[] = ["joined", "mid", "ready"];

/**
 * The hero's product object: one customer's stamp card in a phone, with a
 * segmented control that walks it from a fresh card to a reward. Client state
 * only, so it behaves the same with or without reduced motion.
 */
export function StampCard() {
  const [state, setState] = useState<StateKey>("mid");
  const current = STATES[state];

  return (
    <figure
      className="flex w-full flex-col items-center gap-5"
      aria-label="Sample loopkit stamp card"
    >
      <PhoneFrame
        label="Sample stamp card on a customer's phone"
        size="large"
        className="h-[250px]"
      >
        <CardScreen
          key={state}
          stamps={current.stamps}
          status={current.status}
          popLast
        />
      </PhoneFrame>
      <div
        role="group"
        aria-label="Card status"
        className="flex w-full max-w-[28rem] rounded-lg border border-border p-1"
      >
        {ORDER.map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={state === s}
            onClick={() => setState(s)}
            className="min-h-11 flex-auto whitespace-nowrap rounded-lg px-2 text-xs font-semibold transition-colors hover:bg-muted active:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-pressed:bg-foreground aria-pressed:text-background aria-pressed:hover:bg-foreground/85 sm:px-3 sm:text-sm"
          >
            {STATES[s].label}
          </button>
        ))}
      </div>
    </figure>
  );
}
