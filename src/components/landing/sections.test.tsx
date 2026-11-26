// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LandingClosing, LandingFaq } from "./sections";
import { PRICING_LINE, WAITLIST_URL } from "./waitlist";

describe("LandingFaq", () => {
  it("shows exactly three rows", () => {
    const { container } = render(<LandingFaq />);
    expect(container.querySelectorAll("details")).toHaveLength(3);
    expect(
      screen.getByText("Do customers need to download an app?"),
    ).toBeInTheDocument();
  });
});

describe("LandingClosing", () => {
  it("carries the unchanged pricing line and the waitlist call", () => {
    render(<LandingClosing />);
    expect(screen.getByText(PRICING_LINE)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Join the waitlist" }),
    ).toHaveAttribute("href", WAITLIST_URL);
  });

  it("sends a signed-in vendor to the dashboard", () => {
    render(<LandingClosing authed />);
    expect(
      screen.getByRole("link", { name: "Go to dashboard" }),
    ).toHaveAttribute("href", "/dashboard");
  });
});
