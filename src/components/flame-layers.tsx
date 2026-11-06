"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";
import { MECHANIC_ART } from "@/lib/tokens/mechanic-art";
import { FLAME_TEMP, flameCandle, flameTriTongue } from "./flame-geometry";
import { StageGroup } from "./flame-stage-group";
import {
  CrossedLogs,
  EmberLayerContent,
  SparkLayerContent,
} from "./flame-ember-layers";
import { FlameComposite, LargeFlameComposite } from "./flame-composites";

export function FlameLayers({
  stage,
  className,
}: {
  stage: number;
  className?: string;
}) {
  const id = useId();
  const logGradId = `${id}-log`;
  const coalGradId = `${id}-coal`;
  const ghostBlurId = `${id}-ghost-blur`;

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div
        data-flame-stage={stage}
        className="flex size-[166px] flex-col items-center justify-end gap-1 pb-1"
      >
        <svg viewBox="0 0 100 100" aria-hidden="true" className="size-[146px]">
          <defs>
            <linearGradient id={logGradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={MECHANIC_ART.flame.hex9c7248} />
              <stop offset="100%" stopColor={MECHANIC_ART.flame.hex5c3d24} />
            </linearGradient>
            <radialGradient id={coalGradId} cx="40%" cy="30%" r="75%">
              <stop offset="0%" stopColor={MECHANIC_ART.flame.hexff9d4d} />
              <stop offset="55%" stopColor={MECHANIC_ART.flame.hexe8590c} />
              <stop offset="100%" stopColor={MECHANIC_ART.flame.hex7c2d12} />
            </radialGradient>
            <filter
              id={ghostBlurId}
              x="-60%"
              y="-60%"
              width="220%"
              height="220%"
            >
              <feGaussianBlur stdDeviation={0.6} />
            </filter>
          </defs>

          <CrossedLogs gradientId={logGradId} />

          <StageGroup layer="ember" stage={stage} coalHook>
            <EmberLayerContent coalGradientId={coalGradId} />
          </StageGroup>

          <StageGroup layer="spark" stage={stage}>
            <SparkLayerContent
              coalGradientId={coalGradId}
              ghostBlurId={ghostBlurId}
            />
          </StageGroup>

          <StageGroup layer="small" stage={stage}>
            <FlameComposite
              shapeFn={flameCandle}
              cx={50}
              baseY={82}
              h={17}
              w={10}
              temp={FLAME_TEMP.small}
              sparkCount={2}
              wisp={false}
              idPrefix={`${id}-small`}
              seedBase={1}
            />
          </StageGroup>

          <StageGroup layer="medium" stage={stage}>
            <FlameComposite
              shapeFn={flameTriTongue}
              cx={50}
              baseY={82}
              h={25}
              w={13}
              temp={FLAME_TEMP.medium}
              sparkCount={4}
              wisp
              idPrefix={`${id}-medium`}
              seedBase={5}
            />
          </StageGroup>

          <StageGroup layer="large" stage={stage}>
            <LargeFlameComposite cx={50} baseY={82} idPrefix={`${id}-large`} />
          </StageGroup>
        </svg>
      </div>
    </div>
  );
}
