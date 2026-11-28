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
    tonedae4ef: "var(--art-cup-dae4ef)",
    tonec1ccd7: "var(--art-cup-c1ccd7)",
    tonea8b4c1: "var(--art-cup-a8b4c1)",
    tone909caa: "var(--art-cup-909caa)",
    tone798694: "var(--art-cup-798694)",
    tone4a4f56: "var(--art-cup-4a4f56)",
    tonef5ecd8: "var(--art-cup-f5ecd8)",
    tone3d2413: "var(--art-cup-3d2413)",
    tone4a3420: "var(--art-cup-4a3420)",
    mixb89e77Black15:
      "color-mix(in oklch, var(--art-cup-b89e77), var(--art-black) 15%)",
    toneb89e77: "var(--art-cup-b89e77)",
    tonef5e9d2: "var(--art-cup-f5e9d2)",
    toned9c29e: "var(--art-cup-d9c29e)",
    tone8a5a2f: "var(--art-cup-8a5a2f)",
    tonef0e2c8: "var(--art-cup-f0e2c8)",
    tonec9b393: "var(--art-cup-c9b393)",
    toned3bd97: "var(--art-cup-d3bd97)",
    tonef3e6cd: "var(--art-cup-f3e6cd)",
    mixb89e77Black20:
      "color-mix(in oklch, var(--art-cup-b89e77), var(--art-black) 20%)",
    tone9a713f: "var(--art-cup-9a713f)",
    tonec9a063: "var(--art-cup-c9a063)",
    toned9b878: "var(--art-cup-d9b878)",
    tone7a5230: "var(--art-cup-7a5230)",
    tonea97c50: "var(--art-cup-a97c50)",
    tone5a3820: "var(--art-cup-5a3820)",
    tone2a1810: "var(--art-cup-2a1810)",
    tone6b4326: "var(--art-cup-6b4326)",
  },
  flame: {
    tone7c2d12: "var(--art-flame-7c2d12)",
    tonee8590c: "var(--art-flame-e8590c)",
    toneff9d4d: "var(--art-flame-ff9d4d)",
    tone5c3d24: "var(--art-flame-5c3d24)",
    tone9c7248: "var(--art-flame-9c7248)",
    tonefde047: "var(--art-flame-fde047)",
    tonef97316: "var(--art-flame-f97316)",
    tonefffbeb: "var(--art-flame-fffbeb)",
    toneea580c: "var(--art-flame-ea580c)",
    tone7f1d1d: "var(--art-flame-7f1d1d)",
    tone9ca3af: "var(--art-flame-9ca3af)",
    toneffdd88: "var(--art-flame-ffdd88)",
    toneffb84d: "var(--art-flame-ffb84d)",
    tonefff4d6: "var(--art-flame-fff4d6)",
    tonefdba74: "var(--art-flame-fdba74)",
    tonefde68a: "var(--art-flame-fde68a)",
    tone9a3412: "var(--art-flame-9a3412)",
    tonefffdf5: "var(--art-flame-fffdf5)",
    tonefef9e0: "var(--art-flame-fef9e0)",
    tonefbbf24: "var(--art-flame-fbbf24)",
    toneb45309: "var(--art-flame-b45309)",
    tonefef3c7: "var(--art-flame-fef3c7)",
    tonef59e0b: "var(--art-flame-f59e0b)",
    tonec2410c: "var(--art-flame-c2410c)",
  },
  scratch: {
    rgba0_0_0_0_07: "var(--art-black-07)",
    rgba230_180_90_0_4: "var(--art-scratch-230-180-90-04)",
    rgba230_180_90_0_55: "var(--art-scratch-230-180-90-055)",
    tonee8c374: "var(--art-scratch-e8c374)",
    tone201d19: "var(--art-scratch-201d19)",
    tone2c2924: "var(--art-scratch-2c2924)",
    tone3a3630: "var(--art-scratch-3a3630)",
    rgba255_233_214_0_92: "var(--art-scratch-255-233-214-092)",
    tone4a121c: "var(--art-scratch-4a121c)",
    tone6a1c2a: "var(--art-scratch-6a1c2a)",
    tone8a2436: "var(--art-scratch-8a2436)",
    rgba42_26_6_0_9: "var(--art-scratch-42-26-6-09)",
    tone8a691f: "var(--art-scratch-8a691f)",
    tonecaa042: "var(--art-scratch-caa042)",
    tonefbe8b8: "var(--art-scratch-fbe8b8)",
    tone2a1a06: "var(--art-scratch-2a1a06)",
  },
  wheel: {
    tonefbe8b8: "var(--art-wheel-fbe8b8)",
    dropShadow:
      "drop-shadow(0 1px 1.5px color-mix(in oklch, var(--art-black) 40%, transparent))",
    tonefff7e0: "var(--art-wheel-fff7e0)",
  },
  stamp: {
    hexc9a36a: "#c9a36a",
  },
} as const;

/** A 2D canvas fill cannot take `var()`, so canvas art reads the token's
 * computed value from the element it draws on. */
export function resolveArtColor(el: Element, value: string): string {
  const name = /^var\((--[\w-]+)\)$/.exec(value)?.[1];
  if (!name) return value;
  return getComputedStyle(el).getPropertyValue(name).trim() || value;
}
