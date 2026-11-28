// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "./hero";
import { Nav } from "./nav";
import { WAITLIST_URL } from "./waitlist";

describe("Hero", () => {
  it("shows the In build badge and the waitlist CTA when signed out", () => {
    render(<Hero />);
    expect(screen.getByText("In build")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Join the waitlist" }),
    ).toHaveAttribute("href", WAITLIST_URL);
  });

  it("describes the product as stamp cards for hawkers and small shops", () => {
    render(<Hero />);
    expect(
      screen.getByText("loopkit · stamp cards for hawkers and small shops"),
    ).toBeInTheDocument();
  });

  it("has no entrance animation", () => {
    const { container } = render(<Hero />);
    expect(container.querySelector(".fade-rise")).toBeNull();
  });

  it("uses the same waitlist CTA label in the nav", () => {
    render(<Nav />);
    expect(
      screen.getByRole("link", { name: "Join the waitlist" }),
    ).toHaveAttribute("href", WAITLIST_URL);
  });

  it("swaps the waitlist CTA for the dashboard link when signed in", () => {
    render(<Hero authed />);
    expect(
      screen.queryByRole("link", { name: "Join the waitlist" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Go to dashboard" }),
    ).toHaveAttribute("href", "/dashboard");
  });
});
