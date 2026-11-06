import { MECHANIC_ART } from "@/lib/tokens/mechanic-art";

// ---------- shape geometry (ported verbatim from the approved reference) ----------

export type FlameShapeFn = (
  cx: number,
  baseY: number,
  h: number,
  w: number,
) => string;

// asymmetric single-lick silhouette — curls in on the left only, tip leans
// right; a mirrored/symmetric one reads as a leaf, not fire
export function flameCur(
  cx: number,
  baseY: number,
  h: number,
  w: number,
): string {
  return `M${cx - w} ${baseY}
    C${cx - w * 1.05} ${baseY - h * 0.1} ${cx - w * 0.9} ${baseY - h * 0.62} ${cx - w * 0.25} ${baseY - h * 0.55}
    C${cx - w * 0.55} ${baseY - h * 0.72} ${cx - w * 0.15} ${baseY - h * 0.92} ${cx + w * 0.1} ${baseY - h}
    C${cx + w * 0.05} ${baseY - h * 0.78} ${cx + w * 0.35} ${baseY - h * 0.66} ${cx + w * 0.3} ${baseY - h * 0.42}
    C${cx + w * 0.55} ${baseY - h * 0.5} ${cx + w * 0.85} ${baseY - h * 0.28} ${cx + w} ${baseY}
    C${cx + w * 0.4} ${baseY + h * 0.04} ${cx - w * 0.4} ${baseY + h * 0.04} ${cx - w} ${baseY}
    Z`;
}

export function flameSoft(
  cx: number,
  baseY: number,
  h: number,
  w: number,
): string {
  return `M${cx - w} ${baseY}
    C${cx - w} ${baseY - h * 0.55} ${cx - w * 0.55} ${baseY - h * 0.95} ${cx - w * 0.1} ${baseY - h}
    C${cx + w * 0.3} ${baseY - h * 0.92} ${cx + w} ${baseY - h * 0.5} ${cx + w} ${baseY} Z`;
}

export function flameCandle(
  cx: number,
  baseY: number,
  h: number,
  w: number,
): string {
  return `M${cx - w * 0.7} ${baseY}
    C${cx - w * 0.75} ${baseY - h * 0.3} ${cx - w * 0.3} ${baseY - h * 0.55} ${cx - w * 0.15} ${baseY - h * 0.75}
    C${cx - w * 0.35} ${baseY - h * 0.85} ${cx - w * 0.1} ${baseY - h * 0.95} ${cx + w * 0.05} ${baseY - h}
    C${cx + w * 0.15} ${baseY - h * 0.9} ${cx + w * 0.15} ${baseY - h * 0.78} ${cx + w * 0.28} ${baseY - h * 0.68}
    C${cx + w * 0.5} ${baseY - h * 0.5} ${cx + w * 0.7} ${baseY - h * 0.25} ${cx + w * 0.65} ${baseY}
    Z`;
}

export function flameTriTongue(
  cx: number,
  baseY: number,
  h: number,
  w: number,
): string {
  const one = (ox: number, sh: number, sw: number) =>
    flameCandle(cx + ox, baseY, h * sh, w * sw);
  return one(-w * 0.5, 0.62, 0.55) + one(0, 1, 0.6) + one(w * 0.5, 0.7, 0.5);
}

// deterministic stand-in for the reference's Math.random() jitter — same
// visual variety (organic, non-uniform timing/scatter) without a
// server/client hydration mismatch
export function seeded(seed: number, min: number, max: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  const frac = x - Math.floor(x);
  return min + frac * (max - min);
}

export type FlameTemp = {
  base: string;
  mid: string;
  tip: string;
  coreLo: string;
  coreHi: string;
};

export const FLAME_TEMP: Record<"spark" | "small" | "medium", FlameTemp> = {
  spark: {
    base: MECHANIC_ART.flame.hexc2410c,
    mid: MECHANIC_ART.flame.hexf59e0b,
    tip: MECHANIC_ART.flame.hexfef3c7,
    coreLo: MECHANIC_ART.flame.hexfde68a,
    coreHi: MECHANIC_ART.flame.hexfffbeb,
  },
  small: {
    base: MECHANIC_ART.flame.hexb45309,
    mid: MECHANIC_ART.flame.hexfbbf24,
    tip: MECHANIC_ART.flame.hexfef9e0,
    coreLo: MECHANIC_ART.flame.hexfde68a,
    coreHi: MECHANIC_ART.flame.hexfffdf5,
  },
  medium: {
    base: MECHANIC_ART.flame.hex9a3412,
    mid: MECHANIC_ART.flame.hexf97316,
    tip: MECHANIC_ART.flame.hexfde68a,
    coreLo: MECHANIC_ART.flame.hexfdba74,
    coreHi: MECHANIC_ART.flame.hexfff4d6,
  },
};
