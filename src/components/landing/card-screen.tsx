import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@merqo/ui/primitives";

import {
  CARD_TOTAL,
  COUNTER_TITLE,
  JOIN_NOTE,
  REWARD_READY,
  SAMPLE_PHONE,
  SHOP_NAME,
  rewardLine,
  stampsLine,
} from "./card-labels";

export type CardStatus = "stamping" | "ready";

/** The customer's card as /c shows it: dots, the count, the reward, a status. */
export function CardScreen({
  stamps,
  status = "stamping",
  popLast = false,
}: {
  stamps: number;
  status?: CardStatus;
  /** Pop the newest stamp; the caller keys the screen so each change replays it. */
  popLast?: boolean;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 text-left">
      <p className="truncate font-display text-sm font-bold">{SHOP_NAME}</p>
      <div className="grid grid-cols-4 gap-1.5" aria-hidden>
        {Array.from({ length: CARD_TOTAL }).map((_, i) => {
          const stamped = i < stamps;
          return (
            <div
              key={i}
              className={cn(
                "flex aspect-square items-center justify-center rounded-full border-2 text-[10px]",
                stamped
                  ? "border-transparent bg-gold text-gold-foreground"
                  : "border-dashed border-border text-muted-foreground/60",
                popLast && stamped && i === stamps - 1
                  ? "motion-safe:animate-stamp-pop"
                  : null,
              )}
            >
              {stamped ? <Check className="size-3.5" /> : i + 1}
            </div>
          );
        })}
      </div>
      <p className="font-mono text-xs font-medium">{stampsLine(stamps)}</p>
      <p className="text-xs text-muted-foreground">{rewardLine}</p>
      <p
        className="min-h-4 text-xs font-semibold text-gold-accent"
        aria-live="polite"
      >
        {status === "ready" ? REWARD_READY : null}
      </p>
    </div>
  );
}

/** The /c join page: the phone-number prompt a customer sees after the QR. */
export function JoinScreen({
  phone = SAMPLE_PHONE,
  action,
}: {
  /** What is typed in the field so far; empty shows the placeholder caret. */
  phone?: string;
  action: ReactNode;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 text-left">
      <p className="truncate font-display text-sm font-bold">{SHOP_NAME}</p>
      <p className="text-xs text-muted-foreground">{JOIN_NOTE}</p>
      <p className="min-h-[34px] rounded-lg border border-border px-3 py-2 font-mono text-xs">
        {phone}
      </p>
      <div className="mt-auto">{action}</div>
    </div>
  );
}

/** The vendor's counter after a customer is found: phone, count, one action. */
export function CounterScreen({
  stamps,
  ready = false,
  note,
  action,
}: {
  stamps: number;
  ready?: boolean;
  note?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 text-left">
      <p className="truncate font-display text-sm font-bold">{COUNTER_TITLE}</p>
      <p className="font-mono text-xs font-medium">{SAMPLE_PHONE}</p>
      <p className="font-mono text-xs text-muted-foreground">
        {stampsLine(stamps)}
      </p>
      {ready ? (
        <p className="text-xs font-semibold text-gold-accent">{REWARD_READY}</p>
      ) : null}
      {note ? (
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {note}
        </p>
      ) : null}
      {action ? <div className="mt-auto">{action}</div> : null}
    </div>
  );
}
