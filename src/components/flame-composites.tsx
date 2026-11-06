import { MECHANIC_ART } from "@/lib/tokens/mechanic-art";
import {
  flameCur,
  seeded,
  type FlameShapeFn,
  type FlameTemp,
} from "./flame-geometry";

export function FlameComposite({
  shapeFn,
  cx,
  baseY,
  h,
  w,
  temp,
  sparkCount,
  wisp,
  coreScale = 0.55,
  idPrefix,
  seedBase,
}: {
  shapeFn: FlameShapeFn;
  cx: number;
  baseY: number;
  h: number;
  w: number;
  temp: FlameTemp;
  sparkCount: number;
  wisp: boolean;
  coreScale?: number;
  idPrefix: string;
  seedBase: number;
}) {
  const glowId = `${idPrefix}-glow`;
  const outerId = `${idPrefix}-outer`;
  const coreId = `${idPrefix}-core`;

  const sparks = Array.from({ length: sparkCount }, (_, i) => {
    const seed = seedBase + i;
    return (
      <circle
        key={i}
        className="motion-safe:animate-flame-spark-rise"
        cx={cx + seeded(seed, -w * 0.7, w * 0.7)}
        cy={baseY - seeded(seed + 0.5, h * 1.1, h * 1.9)}
        r={seeded(seed + 0.25, 0.7, 1.6)}
        fill={MECHANIC_ART.flame.hexffdd88}
        style={{
          animationDelay: `${seeded(seed + 0.75, 0, 2)}s`,
          animationDuration: `${seeded(seed + 0.1, 1.1, 2)}s`,
        }}
      />
    );
  });

  return (
    <>
      <defs>
        <filter id={glowId} x="-70%" y="-70%" width="240%" height="240%">
          <feGaussianBlur stdDeviation={Math.max(1, h * 0.07)} />
        </filter>
        <linearGradient id={outerId} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={temp.base} />
          <stop offset="55%" stopColor={temp.mid} />
          <stop offset="100%" stopColor={temp.tip} />
        </linearGradient>
        <linearGradient id={coreId} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={temp.coreLo} />
          <stop offset="100%" stopColor={temp.coreHi} />
        </linearGradient>
      </defs>
      <path
        className="motion-safe:animate-flame-glow-pulse"
        d={shapeFn(cx, baseY, h * 1.06, w * 1.08)}
        fill={temp.mid}
        opacity={0.45}
        filter={`url(#${glowId})`}
        style={{ animationDuration: `${seeded(seedBase, 1.6, 2.4)}s` }}
      />
      <path
        className="[transform-box:fill-box] origin-bottom motion-safe:animate-flame-flicker-outer"
        d={shapeFn(cx, baseY, h, w)}
        fill={`url(#${outerId})`}
        style={{ animationDuration: `${seeded(seedBase + 1, 1.8, 2.5)}s` }}
      />
      <path
        className="[transform-box:fill-box] origin-bottom motion-safe:animate-flame-flicker-inner"
        d={shapeFn(cx, baseY - 0.4, h * coreScale, w * coreScale * 0.85)}
        fill={`url(#${coreId})`}
        opacity={0.92}
        style={{ animationDuration: `${seeded(seedBase + 2, 1.3, 1.9)}s` }}
      />
      {wisp && (
        <path
          className="motion-safe:animate-flame-wisp-drift"
          d={`M${cx - 1} ${baseY - h * 0.75} C${cx - 3} ${baseY - h * 0.95} ${cx + 2} ${baseY - h * 1.05} ${cx} ${baseY - h * 1.25}
              C${cx + 3} ${baseY - h * 1.05} ${cx + 1} ${baseY - h * 0.9} ${cx + 1.5} ${baseY - h * 0.72} Z`}
          fill={temp.tip}
          opacity={0.35}
          filter={`url(#${glowId})`}
          style={{
            animationDuration: `${seeded(seedBase + 3, 2, 3)}s`,
            animationDelay: `${seeded(seedBase + 3.5, 0, 1.5)}s`,
          }}
        />
      )}
      {sparks}
    </>
  );
}

export function LargeFlameComposite({
  cx,
  baseY,
  idPrefix,
}: {
  cx: number;
  baseY: number;
  idPrefix: string;
}) {
  const glowId = `${idPrefix}-glow`;
  const outerId = `${idPrefix}-outer`;
  const coreId = `${idPrefix}-core`;

  const sparks = Array.from({ length: 7 }, (_, i) => {
    const seed = 50 + i;
    return (
      <circle
        key={i}
        className="motion-safe:animate-flame-spark-rise"
        cx={cx + seeded(seed, -10, 10)}
        cy={baseY - seeded(seed + 0.5, 18, 36)}
        r={seeded(seed + 0.25, 0.9, 1.8)}
        fill={MECHANIC_ART.flame.hexffdd88}
        style={{
          animationDelay: `${seeded(seed + 0.75, 0, 2.2)}s`,
          animationDuration: `${seeded(seed + 0.1, 1.2, 2.1)}s`,
        }}
      />
    );
  });

  const smokePuffs = Array.from({ length: 3 }, (_, i) => {
    const seed = 60 + i;
    const sx = cx + seeded(seed, -4, 4);
    return (
      <path
        key={i}
        className="motion-safe:animate-flame-smoke-drift"
        d={`M${sx - 3} ${baseY - 34} C${sx - 6} ${baseY - 44} ${sx + 4} ${baseY - 50} ${sx} ${baseY - 60}
            C${sx + 5} ${baseY - 52} ${sx - 2} ${baseY - 44} ${sx + 2} ${baseY - 34} Z`}
        fill={MECHANIC_ART.flame.hex9ca3af}
        style={{
          animationDelay: `${seeded(seed + 0.5, 0, 4)}s`,
          animationDuration: `${seeded(seed + 0.25, 3.5, 5.5)}s`,
        }}
      />
    );
  });

  return (
    <>
      <defs>
        <filter id={glowId} x="-70%" y="-70%" width="240%" height="240%">
          <feGaussianBlur stdDeviation={2.4} />
        </filter>
        <linearGradient id={outerId} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={MECHANIC_ART.flame.hex7f1d1d} />
          <stop offset="45%" stopColor={MECHANIC_ART.flame.hexea580c} />
          <stop offset="100%" stopColor={MECHANIC_ART.flame.hexfde047} />
        </linearGradient>
        <linearGradient id={coreId} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={MECHANIC_ART.flame.hexf97316} />
          <stop offset="100%" stopColor={MECHANIC_ART.flame.hexfffbeb} />
        </linearGradient>
      </defs>
      {smokePuffs}
      <path
        className="motion-safe:animate-flame-glow-pulse"
        d={flameCur(cx, baseY, 34, 17)}
        fill={MECHANIC_ART.flame.hexf97316}
        opacity={0.5}
        filter={`url(#${glowId})`}
        style={{ animationDuration: `${seeded(70, 1.6, 2.4)}s` }}
      />
      <path
        className="[transform-box:fill-box] origin-bottom motion-safe:animate-flame-flicker-outer"
        d={flameCur(cx, baseY, 33, 16)}
        fill={`url(#${outerId})`}
        style={{ animationDuration: `${seeded(71, 1.9, 2.5)}s` }}
      />
      <path
        className="[transform-box:fill-box] origin-bottom motion-safe:animate-flame-flicker-inner"
        d={flameCur(cx, baseY - 1, 19, 7)}
        fill={`url(#${coreId})`}
        opacity={0.92}
        style={{ animationDuration: `${seeded(72, 1.4, 1.9)}s` }}
      />
      <path
        className="motion-safe:animate-flame-wisp-drift"
        d={`M${cx - 1} ${baseY - 24} C${cx - 3} ${baseY - 30} ${cx + 2} ${baseY - 33} ${cx} ${baseY - 40}
            C${cx + 3} ${baseY - 34} ${cx + 1} ${baseY - 29} ${cx + 1.5} ${baseY - 23} Z`}
        fill={MECHANIC_ART.flame.hexfde047}
        opacity={0.4}
        style={{
          animationDuration: `${seeded(73, 2, 3)}s`,
          animationDelay: `${seeded(73.5, 0, 1.5)}s`,
        }}
      />
      {sparks}
    </>
  );
}
