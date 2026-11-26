"use client";

import { useRef, useState, type ReactNode, type RefObject } from "react";
import {
  Journey,
  JourneyStep,
  PhoneFrame,
  PressButton,
  usePrefersReducedMotion,
  useScrollPlay,
} from "@merqo/ui";

import { CardScreen, CounterScreen, JoinScreen } from "./card-screen";
import {
  CARD_TOTAL,
  CHECK_BUTTON,
  REDEEM_BUTTON,
  STAMP_BUTTON,
  cardCreatedNote,
  redeemedNote,
} from "./card-labels";
import { CONTAINER } from "./rhythm";

const PHONE = "h-[300px] w-[210px] max-w-full min-w-0";
const STAGE =
  "grid w-full grid-cols-1 justify-items-center gap-3 sm:flex sm:flex-wrap sm:justify-center sm:gap-4";
const REPLAY =
  "inline-flex min-h-11 items-center justify-center rounded-lg border-[1.5px] border-border px-4 text-sm font-semibold transition-colors hover:bg-muted active:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/**
 * One step's play head. Scroll plays the step and rewinds it. A tap or the
 * replay control overrides it until the scroll position moves to another step,
 * so scrolling back up still rewinds. Under reduced motion scroll drives
 * nothing: the step shows its finished state and the controls replay it.
 */
function useStepPlay(ref: RefObject<HTMLElement | null>) {
  const reduced = usePrefersReducedMotion();
  const scrollStep = useScrollPlay(ref, 1);
  const [override, setOverride] = useState<{
    at: number;
    value: boolean;
  } | null>(null);
  if (override !== null && !reduced && override.at !== scrollStep) {
    setOverride(null);
  }
  const base = reduced || scrollStep >= 1;
  return {
    played: override ? override.value : base,
    play: () => setOverride({ at: scrollStep, value: true }),
    rewind: () => setOverride({ at: scrollStep, value: false }),
  };
}

function Stage({
  stageRef,
  played,
  rewind,
  children,
}: {
  stageRef: RefObject<HTMLDivElement | null>;
  played: boolean;
  rewind: () => void;
  children: ReactNode;
}) {
  return (
    <div ref={stageRef} className="flex w-full flex-col items-center gap-3">
      <div className={STAGE}>{children}</div>
      {played ? (
        <button type="button" onClick={rewind} className={REPLAY}>
          Replay
        </button>
      ) : null}
    </div>
  );
}

function JoinStage() {
  const ref = useRef<HTMLDivElement>(null);
  const { played, play, rewind } = useStepPlay(ref);
  return (
    <Stage stageRef={ref} played={played} rewind={rewind}>
      <PhoneFrame label="Customer's phone" size="small" className={PHONE}>
        {played ? (
          <CardScreen stamps={0} />
        ) : (
          <JoinScreen
            action={
              <PressButton onClick={play} className="h-11 text-sm">
                {CHECK_BUTTON}
              </PressButton>
            }
          />
        )}
      </PhoneFrame>
    </Stage>
  );
}

function StampStage() {
  const ref = useRef<HTMLDivElement>(null);
  const { played, play, rewind } = useStepPlay(ref);
  return (
    <Stage stageRef={ref} played={played} rewind={rewind}>
      <PhoneFrame label="Vendor's counter" size="small" className={PHONE}>
        <CounterScreen
          stamps={played ? 1 : 0}
          note={played ? cardCreatedNote : undefined}
          action={
            played ? undefined : (
              <PressButton
                onClick={play}
                className="h-11 px-2 text-sm leading-tight text-balance"
              >
                {STAMP_BUTTON}
              </PressButton>
            )
          }
        />
      </PhoneFrame>
      <PhoneFrame label="Customer's phone" size="small" className={PHONE}>
        <CardScreen
          key={played ? "on" : "off"}
          stamps={played ? 1 : 0}
          popLast
        />
      </PhoneFrame>
    </Stage>
  );
}

function RedeemStage() {
  const ref = useRef<HTMLDivElement>(null);
  const { played, play, rewind } = useStepPlay(ref);
  return (
    <Stage stageRef={ref} played={played} rewind={rewind}>
      <PhoneFrame label="Vendor's counter" size="small" className={PHONE}>
        <CounterScreen
          stamps={played ? 0 : CARD_TOTAL}
          ready={!played}
          note={played ? redeemedNote : undefined}
          action={
            played ? undefined : (
              <PressButton onClick={play} className="h-11 text-sm">
                {REDEEM_BUTTON}
              </PressButton>
            )
          }
        />
      </PhoneFrame>
      <PhoneFrame label="Customer's phone" size="small" className={PHONE}>
        <CardScreen
          stamps={played ? 0 : CARD_TOTAL}
          status={played ? "redeemed" : "ready"}
        />
      </PhoneFrame>
    </Stage>
  );
}

export function CardJourney() {
  return (
    <div className="border-t">
      <div className={CONTAINER}>
        <Journey
          id="how"
          title="One card, three steps."
          className="max-w-none px-0"
        >
          <JourneyStep
            label="Watch"
            heading="They scan the QR and join."
            say="A phone number is all it takes. The card opens on a web page, no app needed."
            stage={<JoinStage />}
          />
          <JourneyStep
            label="Tap"
            heading="You tap, a stamp lands."
            say="One press at the counter and the stamp shows on their card."
            stage={<StampStage />}
          />
          <JourneyStep
            label="Come back"
            heading="The card fills, the reward is ready."
            say="When it is full you redeem it from the counter and their card shows it."
            stage={<RedeemStage />}
          />
        </Journey>
      </div>
    </div>
  );
}
