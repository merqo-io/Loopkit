// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Cup } from "@/components/cup";
import { FlameLayers } from "@/components/flame-layers";
import { Wheel } from "@/components/wheel";

// Colour values the mechanic art shipped with, before they moved to
// src/lib/tokens/mechanic-art.ts. The rendered DOM must not drift from them.
const ORIGINAL = {
  cup: new Set([
    "#2a1810",
    "#3d2413",
    "#4a3420",
    "#4a4f56",
    "#5a3820",
    "#6b4326",
    "#798694",
    "#7a5230",
    "#8a5a2f",
    "#909caa",
    "#9a713f",
    "#a8b4c1",
    "#a97c50",
    "#b89e77",
    "#c1ccd7",
    "#c9a063",
    "#c9b393",
    "#d3bd97",
    "#d9b878",
    "#d9c29e",
    "#dae4ef",
    "#f0e2c8",
    "#f3e6cd",
    "#f5e9d2",
    "#f5ecd8",
    "color-mix(in oklch, #b89e77, black 15%)",
    "color-mix(in oklch, #b89e77, black 20%)",
  ]),
  flame: new Set([
    "#5c3d24",
    "#7c2d12",
    "#7f1d1d",
    "#9a3412",
    "#9c7248",
    "#9ca3af",
    "#b45309",
    "#c2410c",
    "#e8590c",
    "#ea580c",
    "#f59e0b",
    "#f97316",
    "#fbbf24",
    "#fdba74",
    "#fde047",
    "#fde68a",
    "#fef3c7",
    "#fef9e0",
    "#ff9d4d",
    "#ffb84d",
    "#ffdd88",
    "#fff4d6",
    "#fffbeb",
    "#fffdf5",
  ]),
};

const COLOUR_ATTRS = ["fill", "stroke", "stop-color"];

function literalColours(container: HTMLElement): string[] {
  const found: string[] = [];
  for (const el of container.querySelectorAll("*")) {
    for (const attr of COLOUR_ATTRS) {
      const v = el.getAttribute(attr);
      if (v && /^#|^color-mix|^rgba?\(/.test(v)) found.push(v);
    }
  }
  return found;
}

describe("mechanic art colours", () => {
  it("renders the cup with only its original colours", () => {
    const { container } = render(
      <Cup stage={4} totalStages={5} wilting={false} />,
    );
    const colours = literalColours(container);
    expect(colours.length).toBeGreaterThan(0);
    for (const c of colours) expect(ORIGINAL.cup.has(c)).toBe(true);
  });

  it("renders the flame with only its original colours", () => {
    const { container } = render(<FlameLayers stage={3} />);
    const colours = literalColours(container);
    expect(colours.length).toBeGreaterThan(0);
    for (const c of colours) expect(ORIGINAL.flame.has(c)).toBe(true);
  });

  it("renders the wheel with its original highlight colours", () => {
    const { container } = render(
      <Wheel
        segments={[{ id: "a", label: "A", reward: true }]}
        landedId={null}
      />,
    );
    for (const c of ["#fbe8b8", "#fff7e0"]) {
      expect(literalColours(container)).toContain(c);
    }
  });
});
