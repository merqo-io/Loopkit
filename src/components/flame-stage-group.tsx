import type { ReactNode } from "react";

type LayerKey = "ember" | "spark" | "small" | "medium" | "large";

const LAYER_STAGE: Record<LayerKey, number> = {
  ember: 0,
  spark: 1,
  small: 2,
  medium: 3,
  large: 4,
};

// Ember<->Spark, and the Full Campfire->Ember redemption jump, cross in
// place: no delay, both layers scale together. Small->Medium->Large instead
// grow immediately while the old layer lingers, then shrinks late — reads as
// the flame growing from within itself rather than two shapes swapping.
const SYNC_TRANSITION_MS = 550;
const GROW_TRANSITION_MS = 600;
const SHRINK_TRANSITION_MS = 500;
const SHRINK_DELAY_MS = 300;
const TRANSITION_EASE = "cubic-bezier(0.22,0.8,0.32,1)";

function layerTransition(
  layer: LayerKey,
  stage: number,
): { durationMs: number; delayMs: number } {
  if (layer === "ember" || layer === "spark") {
    return { durationMs: SYNC_TRANSITION_MS, delayMs: 0 };
  }
  if (stage === LAYER_STAGE[layer]) {
    return { durationMs: GROW_TRANSITION_MS, delayMs: 0 };
  }
  if (layer === "large" && stage === 0) {
    return { durationMs: SYNC_TRANSITION_MS, delayMs: 0 };
  }
  return { durationMs: SHRINK_TRANSITION_MS, delayMs: SHRINK_DELAY_MS };
}

export function StageGroup({
  layer,
  stage,
  coalHook,
  children,
}: {
  layer: LayerKey;
  stage: number;
  coalHook?: boolean;
  children: ReactNode;
}) {
  const isActive = stage === LAYER_STAGE[layer];
  const { durationMs, delayMs } = layerTransition(layer, stage);
  return (
    <g
      data-flame-layer={layer}
      data-flame-coal={coalHook && stage === 0 ? "true" : undefined}
      className="motion-safe:transition-transform"
      style={{
        transformBox: "fill-box",
        transformOrigin: "50% 100%",
        transform: isActive ? "scale(1)" : "scale(0)",
        transitionTimingFunction: TRANSITION_EASE,
        transitionDuration: `${durationMs}ms`,
        transitionDelay: `${delayMs}ms`,
      }}
    >
      {children}
    </g>
  );
}
