// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StampCard } from "./stamp-card";

function pressed() {
  return screen
    .getAllByRole("button")
    .filter((b) => b.getAttribute("aria-pressed") === "true")
    .map((b) => b.textContent);
}

describe("StampCard", () => {
  it("starts mid-card with the newest stamp animated", () => {
    const { container } = render(<StampCard />);
    expect(screen.getByText("5 / 8 stamps")).toBeInTheDocument();
    expect(pressed()).toEqual(["Mid-card"]);
    expect(
      container.querySelectorAll(".motion-safe\\:animate-stamp-pop"),
    ).toHaveLength(1);
  });

  it("walks the card through joined, mid-card and reward ready by touch", async () => {
    const user = userEvent.setup();
    render(<StampCard />);
    await user.pointer({
      keys: "[TouchA]",
      target: screen.getByRole("button", { name: "Just joined" }),
    });
    expect(screen.getByText("1 / 8 stamps")).toBeInTheDocument();
    expect(screen.queryByText("Reward ready!")).toBeNull();

    await user.pointer({
      keys: "[TouchA]",
      target: screen.getByRole("button", { name: "Reward ready" }),
    });
    expect(screen.getByText("8 / 8 stamps")).toBeInTheDocument();
    expect(screen.getByText("Reward ready!")).toBeInTheDocument();
    expect(pressed()).toEqual(["Reward ready"]);
  });

  it("has no shadow and keeps one small radius on its own surfaces", () => {
    const { container } = render(<StampCard />);
    expect(container.querySelector('[class*="shadow"]')).toBeNull();
    expect(container.querySelector('[class*="rounded-["]')).toBeNull();
    expect(container.querySelector('[class*="rounded-2"]')).toBeNull();
  });
});
