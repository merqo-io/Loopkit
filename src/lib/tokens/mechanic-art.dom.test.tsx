// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { Cup } from "@/components/cup";
import { FlameLayers } from "@/components/flame-layers";
import { Wheel } from "@/components/wheel";

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

function tokenIds(group: string): Set<string> {
  const ids = new Set<string>();
  for (const m of CSS.matchAll(
    new RegExp(`--art-${group}-([0-9a-f]{6}):\\s*oklch\\(`, "g"),
  )) {
    ids.add(`#${m[1]}`);
  }
  return ids;
}

function referencedTokens(list: string[]): string[] {
  return list.flatMap((c) =>
    [...c.matchAll(/var\((--art-[\w-]+)\)/g)].map((m) => m[1]),
  );
}

describe("mechanic art colours", () => {
  it("defines an art token for every original colour", () => {
    expect(tokenIds("cup")).toEqual(ORIGINAL.cup);
    expect(tokenIds("flame")).toEqual(ORIGINAL.flame);
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
    expect(found).toContain("var(--art-wheel-fbe8b8)");
    expect(found).toContain("var(--art-wheel-fff7e0)");
    expect(literals(container)).toEqual([]);
  });
});
