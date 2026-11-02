// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProgramCardStatus } from "@/features/card-check/components/program-card-status";
import { PointsCatalogPicker } from "@/features/card-check/components/points-catalog-picker";
import type { CardStatus } from "@/features/card-check/types";
import { metadata } from "@/app/layout";
import { Nav } from "./nav";
import { Hero } from "./hero";
import { HowItWorks } from "./how-it-works";
import { Benefits } from "./benefits";
import { Faq } from "./faq";
import { Footer } from "./footer";
import { PRICING_LINE, WAITLIST_URL } from "./waitlist";

const { selectMock, toastSuccess } = vi.hoisted(() => ({
  selectMock: vi.fn(),
  toastSuccess: vi.fn(),
}));
vi.mock("@/features/card-check/api/actions", () => ({
  regenerateCardAction: vi.fn(),
  selectPointsRewardAction: selectMock,
}));
vi.mock("sonner", () => ({
  toast: { success: toastSuccess, error: vi.fn() },
}));
vi.mock("next/font/google", () => {
  const font = () => ({ variable: "" });
  return { Fraunces: font, Plus_Jakarta_Sans: font, IBM_Plex_Mono: font };
});

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

  it("keeps em dashes out of the public card components and metadata", async () => {
    const card = {
      programId: "p1",
      name: "Grow-a-kopi",
      label: "Sip",
      reward_text: "Free kopi",
      rewardReady: false,
      expired: false,
      active: false,
      replacedByName: "Sprout",
      carriedOverCount: null,
      activeVouchers: [],
      qr: null,
      view: { kind: "dots", filled: 1, total: 4, variant: "dots" },
    } as unknown as CardStatus;
    const retired = render(
      <ProgramCardStatus card={card} phone="+6591234567" />,
    );
    expect(retired.container.textContent).toContain("This card is retired.");
    expect(retired.container.textContent).not.toContain("—");
    retired.unmount();

    selectMock.mockResolvedValue({
      success: true,
      id: "v1",
      phone: "+6591234567",
      rewardText: "Free drink",
      qr: "<svg>mock</svg>",
    });
    const user = userEvent.setup();
    render(
      <PointsCatalogPicker
        programId="p1"
        phone="+6591234567"
        items={[{ id: "a", label: "Free drink", cost: 100 }]}
        onSelected={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: /free drink/i }));
    await user.click(screen.getByRole("button", { name: "Redeem" }));
    const message = toastSuccess.mock.calls[0]?.[0] as string;
    expect(message).toBe("Free drink redeemed. Show the QR to the shop.");
    expect(message).not.toContain("—");

    expect(String(metadata.description)).not.toContain("—");
  });
});
