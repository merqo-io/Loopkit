import type { ScratchCoverStyle } from "@/lib/engine/chance";
import { MECHANIC_ART } from "@/lib/tokens/mechanic-art";

export type Stroke = { id: number; d: string; delayMs: number; width: number };

const STROKE_BANDS: [number, number][] = [
  [6, 22],
  [22, 40],
  [38, 54],
];
const STEPS_PER_STROKE = 5;
// Canvas card size in CSS px, matches the `h-28 w-48` outer box in ScratchCard.
export const CANVAS_W = 192;
export const CANVAS_H = 112;

// SVG strokes provide a reveal fallback when a canvas context is unavailable.
// Their staggered irregular paths mimic overlapping scratch marks.
export function makeStrokes(): Stroke[] {
  return STROKE_BANDS.map(([yMin, yMax], i) => {
    const dir = i % 2 === 0 ? 1 : -1;
    const parts: string[] = [];
    for (let step = 0; step <= STEPS_PER_STROKE; step++) {
      const t = step / STEPS_PER_STROKE;
      const x = dir === 1 ? t * 100 : (1 - t) * 100;
      const y = yMin + Math.random() * (yMax - yMin);
      parts.push(`${step === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return {
      id: i,
      d: parts.join(" "),
      delayMs: i * 120,
      width: 11 + Math.random() * 5,
    };
  });
}

export type CoverVisual = {
  gradFrom: string;
  gradTo: string;
  textColor: string;
  text: string;
  pattern?: "foil-fleck";
  decoration?: "wax-medallion" | "ticket-lines";
  // Canvas equivalents of the two gradient stops above — CSS `color-mix()`/
  // `var()` aren't resolvable inside a 2D canvas fill, so the canvas draw
  // path needs its own literal colors matching the same material.
  canvasFrom: string;
  canvasMid: string;
  canvasTo: string;
  canvasText: string;
};

export const COVER_STYLES: Record<ScratchCoverStyle, CoverVisual> = {
  foil: {
    gradFrom: MECHANIC_ART.scratch.hexfbe8b8,
    gradTo: "color-mix(in oklch, var(--color-gold) 55%, black)",
    textColor: MECHANIC_ART.scratch.hex2a1a06,
    text: "Scratch to reveal",
    pattern: "foil-fleck",
    canvasFrom: MECHANIC_ART.scratch.hexfbe8b8,
    canvasMid: MECHANIC_ART.scratch.hexcaa042,
    canvasTo: MECHANIC_ART.scratch.hex8a691f,
    canvasText: MECHANIC_ART.scratch.c_rgba_42_26_6_0_9,
  },
  wax: {
    gradFrom: "var(--color-primary)",
    gradTo: "color-mix(in oklch, var(--color-primary) 55%, black)",
    textColor: "var(--color-primary-foreground)",
    text: "Scratch to reveal",
    pattern: "foil-fleck",
    decoration: "wax-medallion",
    canvasFrom: MECHANIC_ART.scratch.hex8a2436,
    canvasMid: MECHANIC_ART.scratch.hex6a1c2a,
    canvasTo: MECHANIC_ART.scratch.hex4a121c,
    canvasText: MECHANIC_ART.scratch.c_rgba_255_233_214_0_92,
  },
  ticket: {
    gradFrom: "color-mix(in oklch, var(--color-muted) 90%, black 10%)",
    gradTo: "color-mix(in oklch, var(--color-muted) 60%, black 40%)",
    textColor: "var(--color-gold)",
    text: "SCRATCH & WIN",
    decoration: "ticket-lines",
    canvasFrom: MECHANIC_ART.scratch.hex3a3630,
    canvasMid: MECHANIC_ART.scratch.hex2c2924,
    canvasTo: MECHANIC_ART.scratch.hex201d19,
    canvasText: MECHANIC_ART.scratch.hexe8c374,
  },
};

// Draws one style's cover art onto the canvas — the real, pointer-driven
// reveal layer. Kept as plain 2D canvas calls (gradients, a few strokes,
// fillText) rather than an image asset, so it stays in sync with the SVG
// fallback's own material choices without shipping two asset pipelines.
export function drawCanvasCover(
  ctx: CanvasRenderingContext2D,
  coverStyle: ScratchCoverStyle,
) {
  const visual = COVER_STYLES[coverStyle];
  ctx.globalCompositeOperation = "source-over";
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

  const grad = ctx.createLinearGradient(0, 0, CANVAS_W, CANVAS_H);
  grad.addColorStop(0, visual.canvasFrom);
  grad.addColorStop(0.55, visual.canvasMid);
  grad.addColorStop(1, visual.canvasTo);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  if (coverStyle === "foil") {
    ctx.strokeStyle = MECHANIC_ART.scratch.c_rgba_0_0_0_0_07;
    ctx.lineWidth = 1;
    for (let i = 0; i < 60; i++) {
      const y = Math.random() * CANVAS_H;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_W, y + (Math.random() * 6 - 3));
      ctx.stroke();
    }
  } else if (coverStyle === "wax") {
    ctx.strokeStyle = MECHANIC_ART.scratch.c_rgba_230_180_90_0_55;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.arc(CANVAS_W / 2, CANVAS_H / 2 - 14, 16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.arc(CANVAS_W / 2, CANVAS_H / 2 - 14, 11, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.strokeStyle = MECHANIC_ART.scratch.c_rgba_230_180_90_0_4;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_W / 2, 8);
    ctx.lineTo(CANVAS_W / 2, CANVAS_H - 8);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.fillStyle = visual.canvasText;
  ctx.font = '700 13px "Plus Jakarta Sans", ui-sans-serif, sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    visual.text,
    CANVAS_W / 2,
    CANVAS_H / 2 + (coverStyle === "wax" ? 18 : 0),
  );
}
