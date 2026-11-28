/** Game art colours. Each value is a CSS custom property defined in
 * src/app/globals.css, so the art follows the theme tokens. The `setup` and
 * `stamp` values are defaults stored as hex in the database and fed to colour
 * inputs, which only accept hex, so they stay literal. */
export const MECHANIC_ART = {
  setup: {
    hexfb7185: "#fb7185",
    hex10b981: "#10b981",
  },
  cup: {
    steel1: "var(--art-cup-steel-1)",
    steel2: "var(--art-cup-steel-2)",
    steel3: "var(--art-cup-steel-3)",
    steel4: "var(--art-cup-steel-4)",
    steel5: "var(--art-cup-steel-5)",
    steel6: "var(--art-cup-steel-6)",
    cream1: "var(--art-cup-cream-1)",
    wood8: "var(--art-cup-wood-8)",
    wood7: "var(--art-cup-wood-7)",
    sandShade15:
      "color-mix(in oklch, var(--art-cup-sand), var(--paper-foreground) 15%)",
    sand: "var(--art-cup-sand)",
    cream2: "var(--art-cup-cream-2)",
    cream5: "var(--art-cup-cream-5)",
    wood3: "var(--art-cup-wood-3)",
    cream4: "var(--art-cup-cream-4)",
    cream8: "var(--art-cup-cream-8)",
    cream6: "var(--art-cup-cream-6)",
    cream3: "var(--art-cup-cream-3)",
    sandShade20:
      "color-mix(in oklch, var(--art-cup-sand), var(--paper-foreground) 20%)",
    wood2: "var(--art-cup-wood-2)",
    brass: "var(--art-cup-brass)",
    cream7: "var(--art-cup-cream-7)",
    wood4: "var(--art-cup-wood-4)",
    wood1: "var(--art-cup-wood-1)",
    wood6: "var(--art-cup-wood-6)",
    wood9: "var(--art-cup-wood-9)",
    wood5: "var(--art-cup-wood-5)",
  },
  flame: {
    orange7: "var(--art-flame-orange-7)",
    orange3: "var(--art-flame-orange-3)",
    amber3: "var(--art-flame-amber-3)",
    char2: "var(--art-flame-char-2)",
    char1: "var(--art-flame-char-1)",
    yellow3: "var(--art-flame-yellow-3)",
    orange1: "var(--art-flame-orange-1)",
    glow2: "var(--art-flame-glow-2)",
    orange2: "var(--art-flame-orange-2)",
    crimson: "var(--art-flame-crimson)",
    ash: "var(--art-flame-ash)",
    yellow2: "var(--art-flame-yellow-2)",
    amber2: "var(--art-flame-amber-2)",
    glow4: "var(--art-flame-glow-4)",
    amber1: "var(--art-flame-amber-1)",
    yellow1: "var(--art-flame-yellow-1)",
    orange6: "var(--art-flame-orange-6)",
    glow1: "var(--art-flame-glow-1)",
    glow3: "var(--art-flame-glow-3)",
    yellow4: "var(--art-flame-yellow-4)",
    orange4: "var(--art-flame-orange-4)",
    glow5: "var(--art-flame-glow-5)",
    amber4: "var(--art-flame-amber-4)",
    orange5: "var(--art-flame-orange-5)",
  },
  scratch: {
    ink07: "var(--art-scratch-ink-07)",
    foil40: "var(--art-scratch-foil-40)",
    foil55: "var(--art-scratch-foil-55)",
    goldLight: "var(--art-scratch-gold-light)",
    charcoal1: "var(--art-scratch-charcoal-1)",
    charcoal2: "var(--art-scratch-charcoal-2)",
    charcoal3: "var(--art-scratch-charcoal-3)",
    blush92: "var(--art-scratch-blush-92)",
    wine1: "var(--art-scratch-wine-1)",
    wine2: "var(--art-scratch-wine-2)",
    wine3: "var(--art-scratch-wine-3)",
    umber90: "var(--art-scratch-umber-90)",
    goldDark: "var(--art-scratch-gold-dark)",
    goldMid: "var(--art-scratch-gold-mid)",
    goldPale: "var(--art-scratch-gold-pale)",
    umber: "var(--art-scratch-umber)",
  },
  wheel: {
    wheelHighlight: "var(--art-wheel-highlight)",
    dropShadow:
      "drop-shadow(0 1px 1.5px color-mix(in oklch, var(--paper-foreground) 40%, transparent))",
    wheelSheen: "var(--art-wheel-sheen)",
  },
  stamp: {
    hexc9a36a: "#c9a36a",
  },
} as const;

/** Literal stand-ins for the scratch tokens, used when a canvas draws before
 * the stylesheet resolves a property. A canvas ignores `var()` as an invalid
 * colour, so the fallback must be a real colour. */
export const ART_FALLBACKS: Record<string, string> = {
  "--art-scratch-ink-07": "rgba(0, 0, 0, 0.07)",
  "--art-scratch-foil-40": "rgba(230, 180, 90, 0.4)",
  "--art-scratch-foil-55": "rgba(230, 180, 90, 0.55)",
  "--art-scratch-gold-light": "#e8c374",
  "--art-scratch-charcoal-1": "#201d19",
  "--art-scratch-charcoal-2": "#2c2924",
  "--art-scratch-charcoal-3": "#3a3630",
  "--art-scratch-blush-92": "rgba(255, 233, 214, 0.92)",
  "--art-scratch-wine-1": "#4a121c",
  "--art-scratch-wine-2": "#6a1c2a",
  "--art-scratch-wine-3": "#8a2436",
  "--art-scratch-umber-90": "rgba(42, 26, 6, 0.9)",
  "--art-scratch-gold-dark": "#8a691f",
  "--art-scratch-gold-mid": "#caa042",
  "--art-scratch-gold-pale": "#fbe8b8",
  "--art-scratch-umber": "#2a1a06",
};

/** A 2D canvas fill cannot take `var()`, so canvas art reads the token's
 * computed value from the element it draws on. */
export function resolveArtColor(el: Element, value: string): string {
  const name = /^var\((--[\w-]+)\)$/.exec(value)?.[1];
  if (!name) return value;
  return (
    getComputedStyle(el).getPropertyValue(name).trim() ||
    ART_FALLBACKS[name] ||
    "transparent"
  );
}
