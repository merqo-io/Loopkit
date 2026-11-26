"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
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
  SAMPLE_PHONE,
  STAMP_BUTTON,
  redeemedNote,
  stampedNote,
} from "./card-labels";
import { CONTAINER } from "./rhythm";

const PHONE =
  "h-[236px] w-[165px] max-w-full min-w-0 sm:h-[260px] sm:w-[210px]";
const STAGE = "flex w-full flex-nowrap justify-center gap-2 sm:gap-4";
const REPLAY =
  "inline-flex min-h-11 items-center justify-center rounded-lg border-[1.5px] border-border px-4 text-sm font-semibold transition-colors hover:bg-muted active:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/** Frames of the join walk-through: empty field, typing, button pressed, card. */
const JOIN_FRAMES = 3;
const JOIN_TICK_MS = 700;
const JOIN_TYPED = ["", "9123 4", SAMPLE_PHONE, SAMPLE_PHONE];

/**
 * Steps 2 and 3 are the visitor's to press. Scrolling never plays them: it
 * only rewinds a press once the scroll position moves on. Under reduced motion
 * the step rests on its finished state and Replay hands back the button.
 */
function useTapPlay() {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const scrollStep = useScrollPlay(ref, 1);
  const [override, setOverride] = useState<{
    at: number;
    value: boolean;
  } | null>(null);
  if (override !== null && !reduced) {
    if (scrollStep < override.at) setOverride(null);
    // Raising `at` keeps a press alive while scrolling on; only scrolling back
    // above the press point rewinds it.
    else if (scrollStep > override.at)
      setOverride({ ...override, at: scrollStep });
  }
  return {
    ref,
    played: override ? override.value : reduced,
    play: () => setOverride({ at: scrollStep, value: true }),
    rewind: () => setOverride({ at: scrollStep, value: false }),
  };
}

/**
 * Step 1 is a watch: scroll position is the play head and rewinds on the way
 * up. Replay re-runs the frames on a timer; under reduced motion it instead
 * returns to the start with an operable button.
 */
function useJoinPlay() {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const scrollStep = useScrollPlay(ref, JOIN_FRAMES);
  const [override, setOverride] = useState<{
    at: number;
    frame: number;
  } | null>(null);
  if (override !== null && !reduced && override.at !== scrollStep) {
    setOverride(null);
  }
  const running = override !== null && !reduced && override.frame < JOIN_FRAMES;
  useEffect(() => {
    if (!running || override === null) return;
    const t = setTimeout(
      () => setOverride({ at: override.at, frame: override.frame + 1 }),
      JOIN_TICK_MS,
    );
    return () => clearTimeout(t);
  }, [running, override]);
  const restingFrame = reduced
    ? JOIN_FRAMES
    : Math.min(scrollStep, JOIN_FRAMES);
  const frame = override ? override.frame : restingFrame;
  return {
    ref,
    frame,
    reduced,
    replay: () => setOverride({ at: scrollStep, frame: 0 }),
    finish: () => setOverride({ at: scrollStep, frame: JOIN_FRAMES }),
  };
}

function Stage({
  stageRef,
  showReplay,
  replay,
  children,
}: {
  stageRef: RefObject<HTMLDivElement | null>;
  showReplay: boolean;
  replay: () => void;
  children: ReactNode;
}) {
  return (
    <div ref={stageRef} className="flex w-full flex-col items-center gap-3">
      <div className={STAGE}>{children}</div>
      {showReplay ? (
        <button type="button" onClick={replay} className={REPLAY}>
          Replay
        </button>
      ) : null}
    </div>
  );
}

function JoinStage() {
  const { ref, frame, reduced, replay, finish } = useJoinPlay();
  const done = frame === JOIN_FRAMES;
  return (
    <Stage stageRef={ref} showReplay={done} replay={replay}>
      <PhoneFrame label="Customer's phone" size="small" className={PHONE}>
        {done ? (
          <CardScreen stamps={0} />
        ) : (
          <JoinScreen
            phone={JOIN_TYPED[frame]}
            action={
              reduced ? (
                <PressButton
                  onClick={finish}
                  className="h-11 px-2 text-sm leading-tight text-balance"
                >
                  {CHECK_BUTTON}
                </PressButton>
              ) : (
                <PressButton
                  aria-hidden
                  tabIndex={-1}
                  className={`pointer-events-none h-11 px-2 text-sm leading-tight text-balance ${frame === 2 ? "scale-[0.97]" : ""}`}
                >
                  {CHECK_BUTTON}
                </PressButton>
              )
            }
          />
        )}
      </PhoneFrame>
    </Stage>
  );
}

function StampStage() {
  const { ref, played, play, rewind } = useTapPlay();
  return (
    <Stage stageRef={ref} showReplay={played} replay={rewind}>
      <PhoneFrame label="Vendor's counter" size="small" className={PHONE}>
        <CounterScreen
          stamps={played ? 1 : 0}
          note={played ? stampedNote(1) : undefined}
          action={
            played ? undefined : (
              <PressButton onClick={play} className="h-11 text-sm">
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
  const { ref, played, play, rewind } = useTapPlay();
  return (
    <Stage stageRef={ref} showReplay={played} replay={rewind}>
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
          status={played ? "stamping" : "ready"}
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
            heading="The card fills, you redeem the reward."
            say="When the card is full the reward is ready. Redeem it from the counter and the card starts again."
            stage={<RedeemStage />}
          />
        </Journey>
      </div>
    </div>
  );
}
