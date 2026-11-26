// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CardJourney } from "./card-journey";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function stubReducedMotion(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

function stubScroll(top: () => number) {
  vi.stubGlobal("innerHeight", 800);
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    cb(0);
    return 1;
  });
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
    () => ({ top: top(), height: 300 }) as DOMRect,
  );
}

it("tells the story in exactly three steps with no numerals", () => {
  stubReducedMotion(false);
  render(<CardJourney />);
  expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(3);
  expect(screen.queryByText(/^Step \d/)).toBeNull();
  expect(document.getElementById("how")).not.toBeNull();
});

it("the visitor presses the counter buttons to play steps 2 and 3", async () => {
  stubReducedMotion(false);
  stubScroll(() => 5000);
  const user = userEvent.setup();
  render(<CardJourney />);

  await user.pointer({
    keys: "[TouchA]",
    target: screen.getByRole("button", { name: "Add stamp" }),
  });
  expect(screen.getByText("Stamped 9123 4567, 1/8")).toBeVisible();

  expect(screen.getAllByText("Reward ready!")).toHaveLength(2);
  await user.pointer({
    keys: "[TouchA]",
    target: screen.getByRole("button", { name: "Redeem" }),
  });
  expect(screen.getByText("Reward redeemed for 9123 4567.")).toBeVisible();
  expect(screen.queryByText("Reward ready!")).toBeNull();
});

it("reduced motion shows every step finished and Replay hands back the button", async () => {
  stubReducedMotion(true);
  const user = userEvent.setup();
  render(<CardJourney />);
  expect(screen.getByText("Reward redeemed for 9123 4567.")).toBeVisible();
  expect(screen.queryByRole("button", { name: "Redeem" })).toBeNull();
  const replays = screen.getAllByRole("button", { name: "Replay" });
  expect(replays).toHaveLength(3);

  await user.pointer({ keys: "[TouchA]", target: replays[2] });
  await user.pointer({
    keys: "[TouchA]",
    target: screen.getByRole("button", { name: "Redeem" }),
  });
  expect(screen.getByText("Reward redeemed for 9123 4567.")).toBeVisible();

  await user.pointer({
    keys: "[TouchA]",
    target: screen.getAllByRole("button", { name: "Replay" })[0],
  });
  await user.pointer({
    keys: "[TouchA]",
    target: screen.getByRole("button", { name: "Check my card" }),
  });
  expect(screen.queryByRole("button", { name: "Check my card" })).toBeNull();
});

it("scroll never plays steps 2 and 3, it only builds step 1", () => {
  stubReducedMotion(false);
  let top = 5000;
  stubScroll(() => top);
  render(<CardJourney />);
  expect(screen.getByText(/New here\?/)).toBeVisible();

  top = 100;
  act(() => {
    window.dispatchEvent(new Event("scroll"));
  });
  expect(screen.queryByText(/New here\?/)).toBeNull();
  expect(screen.getByRole("button", { name: "Add stamp" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Redeem" })).toBeInTheDocument();

  top = 5000;
  act(() => {
    window.dispatchEvent(new Event("scroll"));
  });
  expect(screen.getByText(/New here\?/)).toBeVisible();
});

it("a press lapses when scroll moves back up, not when it moves on", async () => {
  stubReducedMotion(false);
  let top = 100;
  stubScroll(() => top);
  render(<CardJourney />);
  await userEvent.click(screen.getByRole("button", { name: "Redeem" }));
  expect(screen.queryByRole("button", { name: "Redeem" })).toBeNull();

  top = -5000;
  act(() => {
    window.dispatchEvent(new Event("scroll"));
  });
  expect(screen.queryByRole("button", { name: "Redeem" })).toBeNull();

  top = 5000;
  act(() => {
    window.dispatchEvent(new Event("scroll"));
  });
  expect(screen.getByRole("button", { name: "Redeem" })).toBeInTheDocument();
});
