// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { Cup } from "@/components/cup";
import { FlameLayers } from "@/components/flame-layers";
import { Wheel } from "@/components/wheel";
import {
  ART_FALLBACKS,
  MECHANIC_ART,
  resolveArtColor,
} from "@/lib/tokens/mechanic-art";

// Colours the mechanic art shipped with. Each one is now an --art-* token in
// globals.css; the rendered DOM must reference exactly these, as tokens.
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

const CSS = readFileSync("src/app/globals.css", "utf8");
const COLOUR_ATTRS = ["fill", "stroke", "stop-color"];

function colours(container: HTMLElement): string[] {
  const found: string[] = [];
  for (const el of container.querySelectorAll("*")) {
    for (const attr of COLOUR_ATTRS) {
      const v = el.getAttribute(attr);
      if (v && /^var\(--art-|^color-mix/.test(v)) found.push(v);
    }
  }
  return found;
}

function literals(container: HTMLElement): string[] {
  const found: string[] = [];
  for (const el of container.querySelectorAll("*")) {
    for (const attr of COLOUR_ATTRS) {
      const v = el.getAttribute(attr);
      if (v && /^#|^rgba?\(|^oklch\(/.test(v)) found.push(v);
    }
  }
  return found;
}

function referencedTokens(list: string[]): string[] {
  return list.flatMap((c) =>
    [...c.matchAll(/var\((--art-[\w-]+)\)/g)].map((m) => m[1]),
  );
}

describe("mechanic art colours", () => {
  it("defines every art token the table references, one per original colour", () => {
    const defined = (group: "cup" | "flame") =>
      Object.values(MECHANIC_ART[group]).flatMap((v) =>
        [...v.matchAll(/var\((--art-[\w-]+)\)/g)].map((m) => m[1]),
      );
    for (const t of [...defined("cup"), ...defined("flame")]) {
      expect(CSS).toContain(`  ${t}: oklch(`);
    }
    const solid = (group: "cup" | "flame") =>
      Object.values(MECHANIC_ART[group]).filter((v) => /^var\(/.test(v));
    expect(solid("cup")).toHaveLength(ORIGINAL.cup.size);
    expect(solid("flame")).toHaveLength(ORIGINAL.flame.size);
  });

  it("names no art token after its hex value", () => {
    expect(CSS).not.toMatch(/--art-[a-z]+-[0-9a-f]{6}:/);
  });

  it("renders the cup from defined art tokens only", () => {
    const { container } = render(
      <Cup stage={4} totalStages={5} wilting={false} />,
    );
    const found = colours(container);
    expect(found.length).toBeGreaterThan(0);
    expect(literals(container)).toEqual([]);
    for (const t of referencedTokens(found)) {
      expect(CSS).toContain(`${t}:`);
    }
  });

  it("renders the flame from defined art tokens only", () => {
    const { container } = render(<FlameLayers stage={3} />);
    const found = colours(container);
    expect(found.length).toBeGreaterThan(0);
    expect(literals(container)).toEqual([]);
    for (const t of referencedTokens(found)) {
      expect(CSS).toContain(`${t}:`);
    }
  });

  it("renders the wheel highlights from art tokens", () => {
    const { container } = render(
      <Wheel
        segments={[{ id: "a", label: "A", reward: true }]}
        landedId={null}
      />,
    );
    const found = colours(container);
    expect(found).toContain("var(--art-wheel-highlight)");
    expect(found).toContain("var(--art-wheel-sheen)");
    expect(literals(container)).toEqual([]);
  });
});

describe("resolveArtColor", () => {
  const el = document.createElement("canvas");
  document.body.append(el);

  it("returns the token's computed value", () => {
    document.documentElement.style.setProperty("--art-scratch-gold-mid", "red");
    expect(resolveArtColor(el, "var(--art-scratch-gold-mid)")).toBe("red");
    document.documentElement.style.removeProperty("--art-scratch-gold-mid");
  });

  it("falls back to a literal colour when the property is empty", () => {
    const out = resolveArtColor(el, "var(--art-scratch-gold-mid)");
    expect(out).toBe(ART_FALLBACKS["--art-scratch-gold-mid"]);
    expect(out).not.toContain("var(");
  });

  it("passes literal values through and never returns var()", () => {
    expect(resolveArtColor(el, "black")).toBe("black");
    expect(resolveArtColor(el, "var(--not-a-token)")).toBe("transparent");
  });

  it("has a literal fallback for every scratch token", () => {
    for (const v of Object.values(MECHANIC_ART.scratch)) {
      const name = /^var\((--[\w-]+)\)$/.exec(v)![1];
      expect(ART_FALLBACKS[name]).toBeTruthy();
    }
  });
});
