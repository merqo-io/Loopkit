import { MECHANIC_ART } from "@/lib/tokens/mechanic-art";
import { FLAME_TEMP, flameSoft, seeded } from "./flame-geometry";

export function CrossedLogs({ gradientId }: { gradientId: string }) {
  const log = (angle: number) => (
    <rect
      key={angle}
      data-flame-log="true"
      x={-22}
      y={-4}
      width={44}
      height={8}
      rx={4}
      fill={`url(#${gradientId})`}
      transform={`translate(50,87) rotate(${angle})`}
    />
  );
  return (
    <>
      {log(-16)}
      {log(16)}
    </>
  );
}

function EmberHotspot({
  x,
  y,
  r,
  fill,
  seed,
}: {
  x: number;
  y: number;
  r: number;
  fill: string;
  seed: number;
}) {
  return (
    <ellipse
      className="[transform-box:fill-box] origin-center motion-safe:animate-flame-ember-pulse"
      cx={x}
      cy={y}
      rx={r}
      ry={r * 0.65}
      fill={fill}
      style={{
        animationDelay: `${seeded(seed, 0, 1.5)}s`,
        animationDuration: `${seeded(seed + 0.3, 1.4, 2.2)}s`,
      }}
    />
  );
}

function SparkPop({
  cx,
  cy,
  seed,
  delay,
}: {
  cx: number;
  cy: number;
  seed: number;
  delay: number;
}) {
  return (
    <circle
      className="[transform-box:fill-box] origin-center motion-safe:animate-flame-spark-pop"
      cx={cx}
      cy={cy}
      r={seeded(seed, 0.7, 1.3)}
      fill={MECHANIC_ART.flame.hexffdd88}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${seeded(seed + 0.4, 0.8, 1.5)}s`,
      }}
    />
  );
}

function GhostFlame({
  cx,
  baseY,
  fill,
  filterId,
  delay,
  seed,
}: {
  cx: number;
  baseY: number;
  fill: string;
  filterId: string;
  delay: number;
  seed: number;
}) {
  return (
    <path
      className="[transform-box:fill-box] origin-bottom motion-safe:animate-flame-spark-fade"
      d={flameSoft(cx, baseY, 5, 2.6)}
      fill={fill}
      opacity={0.55}
      filter={`url(#${filterId})`}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${seeded(seed, 1.3, 1.8)}s`,
      }}
    />
  );
}

export function EmberLayerContent({
  coalGradientId,
}: {
  coalGradientId: string;
}) {
  const coals = Array.from({ length: 6 }, (_, i) => {
    const x = 50 - 10 + i * 4;
    const y = 83 + (i % 2) * 1.2;
    const r = 1.5 + (i % 3) * 0.4;
    return (
      <g key={i}>
        <circle cx={x} cy={y} r={r} fill={`url(#${coalGradientId})`} />
        <EmberHotspot
          x={x}
          y={y}
          r={r * 0.55}
          fill={MECHANIC_ART.flame.hexffb84d}
          seed={i}
        />
      </g>
    );
  });
  return (
    <>
      {coals}
      <SparkPop cx={47} cy={79} seed={30} delay={0} />
      <SparkPop cx={52} cy={77} seed={31} delay={0.4} />
      <SparkPop cx={55} cy={80} seed={32} delay={0.8} />
    </>
  );
}

export function SparkLayerContent({
  coalGradientId,
  ghostBlurId,
}: {
  coalGradientId: string;
  ghostBlurId: string;
}) {
  const temp = FLAME_TEMP.spark;
  const dots = Array.from({ length: 5 }, (_, i) => {
    const angle = seeded(40 + i, 0, Math.PI);
    const radius = seeded(40 + i + 0.5, 2, 4.5);
    return (
      <SparkPop
        key={i}
        cx={49 + Math.cos(angle) * radius}
        cy={79 - Math.sin(angle) * radius}
        seed={40 + i + 0.25}
        delay={seeded(40 + i + 0.75, 0, 0.25)}
      />
    );
  });
  return (
    <>
      <ellipse
        cx={50}
        cy={84.5}
        rx={7.5}
        ry={3.4}
        fill={`url(#${coalGradientId})`}
      />
      <ellipse
        cx={49}
        cy={83}
        rx={4.5}
        ry={2.2}
        fill={`url(#${coalGradientId})`}
        opacity={0.7}
      />
      <EmberHotspot
        x={48}
        y={83.5}
        r={1.4}
        fill={MECHANIC_ART.flame.hexffb84d}
        seed={20}
      />
      <GhostFlame
        cx={47.5}
        baseY={82.5}
        fill={temp.tip}
        filterId={ghostBlurId}
        delay={0}
        seed={21}
      />
      <GhostFlame
        cx={52}
        baseY={82.5}
        fill={temp.tip}
        filterId={ghostBlurId}
        delay={0.6}
        seed={22}
      />
      {dots}
    </>
  );
}
