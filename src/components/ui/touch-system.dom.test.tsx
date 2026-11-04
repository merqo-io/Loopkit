// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import { Button } from "./button";
import { Input } from "./input";
import { FormCard } from "../form-card";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

describe("shared touch and radius system", () => {
  it("raises buttons and inputs to 44px on coarse pointers", () => {
    const block = css.slice(css.indexOf("@media (pointer: coarse)"));
    expect(block).toContain('[data-slot="input"]');
    expect(block).toContain("min-height: 2.75rem");
    expect(block).toContain(".tap-area::after");
  });

  it("covers icon buttons and defines the small-text tokens", () => {
    const block = css.slice(css.indexOf("@media (pointer: coarse)"));
    expect(block).toContain('[data-size^="icon"]');
    expect(block).toContain("min-width: 2.75rem");
    expect(css).toContain("--text-2xs: 0.625rem");
    expect(css).toContain("--text-xs-plus:");
  });

  it("keeps the variant/size markers the coarse rule keys on, at 8px", () => {
    const { getByRole } = render(<Button size="sm">Go</Button>);
    const button = getByRole("button");
    expect(button.dataset.variant).toBe("default");
    expect(button.dataset.size).toBe("sm");
    expect(button.className).toContain("rounded-sm");
    expect(button.className).not.toContain("rounded-xl");
  });

  it("uses 16px text and a 12px radius on inputs", () => {
    const { container } = render(<Input />);
    const cls = container.querySelector("input")!.className;
    expect(cls).toContain("text-base");
    expect(cls).not.toContain("md:text-sm");
    expect(cls).toContain("rounded-lg");
  });

  it("renders FormCard flat with a printed bottom edge", () => {
    const { container } = render(<FormCard />);
    const cls = container.querySelector("form")!.className;
    expect(cls).toContain("border-b-2");
    expect(cls).toContain("shadow-none");
    expect(cls).not.toContain("rgba");
  });
});
