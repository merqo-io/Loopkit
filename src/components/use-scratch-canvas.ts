import { useEffect, useRef, useState, type RefObject } from "react";
import type { ScratchCoverStyle } from "@/lib/engine/chance";
import { MECHANIC_ART } from "@/lib/tokens/mechanic-art";
import { CANVAS_H, CANVAS_W, drawCanvasCover } from "./scratch-card-cover";

const BRUSH_RADIUS = 13;
// Real scratch cards don't need full coverage to feel "revealed."
const SETTLE_FRACTION = 0.55;

// Real drag-to-scratch: a genuine pointer-driven canvas erase (how every
// production scratch-card widget actually works), layered over the SVG
// strokes above as a progressive enhancement — not a replacement for
// them. Only attempted for the real customer card (autoManaged); the
// setup preview already runs its own externally-timed reveal cycle, and
// dragging through a simulated preview tick isn't a real interaction
// worth wiring up. If a 2D context isn't available (jsdom has none,
// which is exactly why the SVG path above has to stay the guaranteed
// fallback, not an afterthought) this effect leaves `canvasUsable` false
// and the SVG strokes keep doing the job, unaffected, exactly as before.
export function useScratchCanvas({
  enabled,
  coverStyle,
  commitRef,
}: {
  enabled: boolean;
  coverStyle: ScratchCoverStyle;
  commitRef: RefObject<(() => void) | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasUsable, setCanvasUsable] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const canvas = canvasEl;
    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext("2d");
    } catch {
      ctx = null;
    }
    if (!ctx) return;
    const context = ctx;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = CANVAS_W * dpr;
    canvas.height = CANVAS_H * dpr;
    context.scale(dpr, dpr);
    drawCanvasCover(context, coverStyle);
    setCanvasUsable(true);

    let last: { x: number; y: number } | null = null;
    let dragging = false;
    let settled = false;
    let lastCheck = 0;

    function brushAt(x: number, y: number) {
      const grad = context.createRadialGradient(x, y, 0, x, y, BRUSH_RADIUS);
      grad.addColorStop(0, MECHANIC_ART.scratch.c_rgba_0_0_0_1);
      grad.addColorStop(0.75, MECHANIC_ART.scratch.c_rgba_0_0_0_1);
      grad.addColorStop(1, MECHANIC_ART.scratch.c_rgba_0_0_0_0);
      context.globalCompositeOperation = "destination-out";
      context.fillStyle = grad;
      context.beginPath();
      context.arc(x, y, BRUSH_RADIUS, 0, Math.PI * 2);
      context.fill();
    }

    function scratchTo(x: number, y: number) {
      if (last) {
        const dx = x - last.x;
        const dy = y - last.y;
        const dist = Math.hypot(dx, dy);
        const steps = Math.max(1, Math.floor(dist / 4));
        for (let i = 1; i <= steps; i++) {
          brushAt(last.x + (dx * i) / steps, last.y + (dy * i) / steps);
        }
      } else {
        brushAt(x, y);
      }
      last = { x, y };
    }

    function clearedFraction() {
      const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let cleared = 0;
      // Sampled, not every pixel.
      const step = 4 * 17;
      for (let i = 3; i < data.length; i += step) {
        if (data[i] < 40) cleared++;
      }
      return cleared / (data.length / step);
    }

    function checkSettle() {
      if (settled) return;
      // Time-throttled, not event-count-throttled: a real drag fires
      // pointermove at whatever rate the input device gives it, which can
      // spike well above what this needs to sample.
      const now = performance.now();
      if (now - lastCheck < 120) return;
      lastCheck = now;
      if (clearedFraction() >= SETTLE_FRACTION) {
        settled = true;
        commitRef.current?.();
      }
    }

    function pointFromEvent(e: PointerEvent) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * CANVAS_W,
        y: ((e.clientY - rect.top) / rect.height) * CANVAS_H,
      };
    }

    function start(e: PointerEvent) {
      dragging = true;
      last = null;
      const p = pointFromEvent(e);
      scratchTo(p.x, p.y);
      checkSettle();
    }
    function move(e: PointerEvent) {
      if (!dragging) return;
      const p = pointFromEvent(e);
      scratchTo(p.x, p.y);
      checkSettle();
    }
    function end() {
      dragging = false;
      last = null;
    }

    canvas.addEventListener("pointerdown", start);
    canvas.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    return () => {
      canvas.removeEventListener("pointerdown", start);
      canvas.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
    };
    // `coverStyle` is intentionally included: a style change mid-mount
    // (shouldn't happen in practice, the prop is set once per program)
    // still redraws the canvas from scratch rather than showing a stale
    // material underneath a freshly-relabeled prize.
  }, [enabled, coverStyle, commitRef]);

  return { canvasRef, canvasUsable };
}
