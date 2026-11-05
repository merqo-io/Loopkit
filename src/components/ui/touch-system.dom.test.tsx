// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import { Button } from "./button";
import { Input } from "./input";
import { SelectTrigger, Select } from "./select";
import { ToggleGroup, ToggleGroupItem } from "./toggle-group";
import { FormCard } from "../form-card";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

/** The `@media (pointer: coarse)` block, brace-matched. */
function coarseBlock(): string {
  const start = css.indexOf("@media (pointer: coarse)");
  expect(start).toBeGreaterThan(-1);
  let depth = 0;
  for (let i = css.indexOf("{", start); i < css.length; i++) {
    if (css[i] === "{") depth++;
    if (css[i] === "}" && --depth === 0) return css.slice(start, i + 1);
  }
  throw new Error("unterminated coarse-pointer block");
}

const rules = (block: string) => {
  const inner = block.slice(block.indexOf("{") + 1, block.lastIndexOf("}"));
  return inner
    .replace(/\/\*[^*]*(?:\*(?!\/)[^*]*)*\*\//g, "")
    .split("}")
    .filter((chunk) => chunk.includes("{"))
    .map((chunk) => {
      const [selector, body] = chunk.split("{");
      return { selector: selector.trim(), body };
    });
};

describe("coarse-pointer touch targets", () => {
  const block = coarseBlock();
  const all = rules(block);
  const minHeight = all.find(
    (r) =>
      r.body.includes("min-height: 2.75rem") &&
      r.selector.includes('[data-slot="input"]'),
  )!;

  it("raises default, sm, lg and icon buttons, inputs and select triggers via min-height", () => {
    expect(minHeight.selector).toContain("[data-variant][data-size]");
    expect(minHeight.selector).toContain('[data-slot="select-trigger"]');
    expect(minHeight.selector).toContain('input[type="time"]');
    expect(block).toMatch(
      /\[data-size\^="icon"\][^{]*\{\s*min-width: 2\.75rem/,
    );
  });

  it("excludes link variants and the xs sizes from min-height", () => {
    expect(minHeight.selector).toContain('[data-variant="link"]');
    expect(minHeight.selector).toContain('[data-size="xs"]');
    expect(minHeight.selector).toContain('[data-size="icon-xs"]');
    expect(minHeight.selector).not.toContain("textarea");
  });

  it("gives xs sizes an invisible 44px hit area instead", () => {
    const hit = all.find(
      (r) => r.selector.includes("::after") && r.selector.includes('"xs"'),
    )!;
    expect(hit.selector).toContain('[data-size="icon-xs"]::after');
    expect(hit.body).toContain("position: absolute");
    expect(hit.body).toContain("max(100%, 2.75rem)");
  });

  it("keeps the .tap-area utility and the menu item floor", () => {
    expect(block).toContain(".tap-area::after");
    expect(block).toContain('[data-slot="dropdown-menu-item"]');
  });

  it("lets toggle-group items grow deliberately (segmented controls are tap targets)", () => {
    expect(minHeight.selector).toContain('[data-slot="toggle-group-item"]');
    const { container } = render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    );
    expect(
      container.querySelector("[data-slot=toggle-group-item]"),
    ).not.toBeNull();
  });
});

describe("fine-pointer density and radii", () => {
  it.each([
    ["default", "h-9"],
    ["sm", "h-8"],
    ["xs", "h-6"],
  ] as const)("Button %s stays %s with data markers", (size, h) => {
    const { getByRole } = render(<Button size={size}>Go</Button>);
    const button = getByRole("button");
    expect(button.dataset.variant).toBe("default");
    expect(button.dataset.size).toBe(size);
    expect(button.className).toContain(h);
    expect(button.className).toContain("rounded-sm");
  });

  it("Input is h-9, 16px on mobile, 14px from md, 12px radius", () => {
    const { container } = render(<Input />);
    const cls = container.querySelector("input")!.className;
    expect(cls).toContain("h-9");
    expect(cls).toContain("text-base");
    expect(cls).toContain("md:text-sm");
    expect(cls).toContain("rounded-lg");
  });

  it("SelectTrigger matches Input's radius", () => {
    const { container } = render(
      <Select>
        <SelectTrigger />
      </Select>,
    );
    const cls = container.querySelector(
      "[data-slot=select-trigger]",
    )!.className;
    expect(cls).toContain("rounded-lg");
    expect(cls).toContain("data-[size=default]:h-9");
  });

  it("FormCard is flat with a printed bottom edge", () => {
    const { container } = render(<FormCard />);
    const cls = container.querySelector("form")!.className;
    expect(cls).toContain("border-b-2");
    expect(cls).toContain("shadow-none");
  });
});

describe("small-text tokens", () => {
  it("defines --text-2xs and --text-xs-plus", () => {
    expect(css).toContain("--text-2xs: 0.625rem");
    expect(css).toContain("--text-xs-plus: 0.6875rem");
  });
});
