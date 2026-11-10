/* eslint-disable no-restricted-syntax -- ImageResponse needs literal CSS colours */
import { brandIcon } from "@merqo/ui";
import type { ReactElement } from "react";

// "Sealing Wax" marks, approximated from the OKLCH theme tokens as concrete
// hex: ImageResponse cannot consume the app's custom properties.
export const BRAND_RASPBERRY = "#a8002c";
export const BRAND_BLUSH = "#fcf3ed";

/**
 * The loopkit "L" app mark for ImageResponse icons. loopkit's display font is
 * Fraunces, a serif, so it uses the same Georgia stand-in as qkit.
 */
export function loopkitIcon(size: number): ReactElement {
  return brandIcon(size, {
    monogram: "L",
    background: BRAND_RASPBERRY,
    foreground: BRAND_BLUSH,
    fontFamily: "Georgia, 'Times New Roman', serif",
    radius: size * 0.22,
  });
}
