// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Nav } from "./nav";
import { Hero } from "./hero";
import { HowItWorks } from "./how-it-works";
import { Benefits } from "./benefits";
import { Faq } from "./faq";
import { Footer } from "./footer";
import { PRICING_LINE, WAITLIST_URL } from "./waitlist";

function renderLanding() {
  return render(
    <>
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <Benefits />
        <Faq />
      </main>
      <Footer />
    </>,
  );
}

describe("landing copy guardrails", () => {
  it("publishes no price, em dash or banned word", () => {
    const { container } = renderLanding();
    const text = container.textContent ?? "";
    expect(text).not.toContain("$");
    expect(text).not.toContain("—");
    expect(text).not.toMatch(
      /\b(live|now|available today|proven|tiers?|pro|shopkit|reachkit)\b/i,
    );
    expect(text).not.toMatch(/\/(month|day)\b/i);
  });

  it("shows the readiness badge, explainer and exact pricing line", () => {
    renderLanding();
    expect(screen.getByText("In build")).toBeInTheDocument();
    expect(
      screen.getByText("Built, not yet tried with vendors."),
    ).toBeInTheDocument();
    expect(screen.getByText(PRICING_LINE)).toBeInTheDocument();
    expect(PRICING_LINE).toBe(
      "Free during the pilot. If we start charging, you'll get at least 30 days' notice first.",
    );
  });

  it("points every signup CTA at the waitlist", () => {
    renderLanding();
    const ctas = screen.getAllByRole("link", { name: /join the waitlist/i });
    expect(ctas).toHaveLength(2);
    for (const cta of ctas) expect(cta).toHaveAttribute("href", WAITLIST_URL);
    expect(WAITLIST_URL).toBe("https://merqo.io/waitlist?kit=loopkit");
    expect(screen.queryByText("Get started")).toBeNull();
    expect(document.querySelector('a[href*="mode=signup"]')).toBeNull();
  });
});
