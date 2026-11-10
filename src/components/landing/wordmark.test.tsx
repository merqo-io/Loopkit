// @vitest-environment jsdom
import { expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Wordmark } from "./wordmark";

it("renders LoopKit with the two gold stamp dots hidden from assistive tech", () => {
  const { container } = render(<Wordmark className="extra" />);
  const root = container.firstElementChild as HTMLElement;
  expect(root.tagName).toBe("SPAN");
  expect(root).toHaveTextContent("LoopKit");
  expect(root).toHaveClass(
    "font-display",
    "text-lg",
    "font-semibold",
    "tracking-tight",
    "extra",
  );
  const dots = root.querySelector("span");
  expect(dots).toHaveTextContent("oo");
  expect(dots).toHaveClass("text-gold");
  expect(dots).toHaveAttribute("aria-hidden", "true");
});
