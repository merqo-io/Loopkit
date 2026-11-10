"use client";

import { useId, useMemo, useState } from "react";
import { cn } from "@merqo/ui/primitives";
import { prefersReducedMotion } from "@/lib/reduced-motion";
import type { ScratchCoverStyle } from "@/lib/engine/chance";
import { COVER_STYLES, makeStrokes } from "./scratch-card-cover";
import { ScratchCardOverlay } from "./scratch-card-overlay";
import { useScratchAutoReveal } from "./use-scratch-auto-reveal";
import { useScratchCanvas } from "./use-scratch-canvas";

export type { ScratchCoverStyle };

export function ScratchCard({
  revealed,
  scratching,
  label,
  reward,
  coverStyle = "foil",
  className,
}: {
  revealed: boolean;
  // Leave unset to let the card drive its own scratch-in beat the instant
  // `revealed` turns true (the real customer card: the result is already
  // decided server-side before this ever mounts, so nothing else would
  // ever flip this prop through a scratching phase — same self-driving
  // pattern Wheel now owns for its own spin, off just `landedId`). Pass an
  // explicit boolean when the caller already runs its own reveal timeline
  // (the setup preview's `usePreviewAnimation`), and this stays fully
  // caller-controlled exactly as before.
  scratching?: boolean;
  label: string;
  reward: boolean;
  coverStyle?: ScratchCoverStyle;
  className?: string;
}) {
  const maskId = useId();
  const filterId = useId();
  const strokes = useMemo(() => makeStrokes(), []);
  const visual = COVER_STYLES[coverStyle];

  const autoManaged = scratching === undefined;
  const [reducedMotion] = useState(prefersReducedMotion);
  const { autoRevealed, autoScratching, commitRef } = useScratchAutoReveal({
    autoManaged,
    revealed,
    reducedMotion,
  });
  const { canvasRef, canvasUsable } = useScratchCanvas({
    enabled: autoManaged && !reducedMotion,
    coverStyle,
    commitRef,
  });

  const effectiveRevealed = autoManaged ? autoRevealed : revealed;
  const effectiveScratching = autoManaged
    ? autoScratching
    : (scratching ?? false);

  return (
    <div
      className={cn(
        // Embossed edge (inner highlight + drop shadow), not a flat
        // border — reads as a physical card, not a pasted rectangle.
        "relative h-28 w-48 overflow-hidden rounded-xl border border-gold/25 shadow-[0_3px_10px_-3px_rgb(0_0_0_/_0.35),inset_0_1px_0_0_rgb(255_255_255_/_0.06)]",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-full flex-col items-center justify-center gap-1 p-3 text-center",
          reward ? "bg-gold/10" : "bg-muted/40",
        )}
      >
        <p
          className={cn(
            "flex items-center gap-1.5 text-sm font-semibold",
            reward ? "text-gold-accent" : "text-muted-foreground",
          )}
        >
          {/* A wax-seal dot marks a win, same motif as the reward wedges
              on Wheel — win/lose reads as more than a color/tone swap. */}
          {reward && (
            <span
              aria-hidden="true"
              className="size-1.5 shrink-0 rounded-full bg-gold ring-1 ring-white/60"
            />
          )}
          {label}
        </p>
      </div>
      {!effectiveRevealed && (
        <>
          {autoManaged && !reducedMotion && (
            <canvas
              ref={canvasRef}
              aria-hidden="true"
              data-testid="scratch-canvas"
              className={cn(
                "absolute inset-0 h-full w-full touch-none",
                !canvasUsable && "hidden",
              )}
            />
          )}
          {/* Guaranteed fallback when the canvas is unusable (jsdom, setup preview). */}
          {!canvasUsable && (
            <ScratchCardOverlay
              maskId={maskId}
              filterId={filterId}
              strokes={strokes}
              visual={visual}
              coverStyle={coverStyle}
              scratching={effectiveScratching}
            />
          )}
        </>
      )}
      {effectiveRevealed && (
        <div
          aria-hidden="true"
          data-testid="scratch-reveal-shine"
          className="scratch-reveal-shine pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent"
        />
      )}
    </div>
  );
}
