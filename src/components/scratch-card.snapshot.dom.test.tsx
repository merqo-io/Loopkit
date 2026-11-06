// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { ScratchCard, type ScratchCoverStyle } from "./scratch-card";

const STYLES: ScratchCoverStyle[] = ["foil", "wax", "ticket"];

beforeEach(() => {
  vi.spyOn(Math, "random").mockReturnValue(0.5);
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ScratchCard markup", () => {
  it.each(STYLES)("renders the %s cover unchanged", (coverStyle) => {
    const { container } = render(
      <ScratchCard
        revealed={false}
        scratching={false}
        label="Free coffee"
        reward
        coverStyle={coverStyle}
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();
  });

  it("renders the mid-scratch strokes unchanged", () => {
    const { container } = render(
      <ScratchCard revealed={false} scratching label="Free coffee" reward />,
    );
    expect(container.innerHTML).toMatchSnapshot();
  });

  it("renders the revealed card unchanged", () => {
    const { container } = render(
      <ScratchCard
        revealed
        scratching={false}
        label="Try again"
        reward={false}
      />,
    );
    expect(container.innerHTML).toMatchSnapshot();
  });

  it("renders the self-driven canvas slot unchanged", () => {
    const { container } = render(
      <ScratchCard revealed={false} label="Free coffee" reward />,
    );
    expect(container.innerHTML).toMatchSnapshot();
  });
});
