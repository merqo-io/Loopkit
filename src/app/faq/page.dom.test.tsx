// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { getUser } = vi.hoisted(() => ({ getUser: vi.fn() }));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(async () => ({
    auth: { getUser: () => getUser() },
  })),
}));

import FaqRoute, { metadata } from "./page";
import { FAQ_GROUPS } from "./faq-content";

async function renderPage() {
  getUser.mockResolvedValue({ data: { user: null } });
  return render(await FaqRoute());
}

describe("FaqRoute", () => {
  it("renders the title, intro and the three groups with ten rows", async () => {
    const { container } = await renderPage();

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Frequently asked questions",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/in build, built but not yet tried/),
    ).toBeInTheDocument();
    for (const name of [
      "Getting started",
      "Customers and their cards",
      "Cost and your data",
    ]) {
      expect(
        screen.getByRole("heading", { level: 2, name }),
      ).toBeInTheDocument();
    }
    expect(container.querySelectorAll("main details")).toHaveLength(10);
    expect(FAQ_GROUPS.flatMap((g) => g.rows)).toHaveLength(10);
  });

  it("omits the phone-number row and the closing line", async () => {
    const { container } = await renderPage();
    expect(container.textContent).not.toMatch(/changes their phone number/i);
    expect(container.textContent).not.toMatch(/legal@merqo\.io/);
  });

  it("uses the stamp-card wording for completed cards", async () => {
    await renderPage();
    expect(
      screen.getByText(
        "On a stamp card, they show their card at your counter and you redeem the reward you set up, such as a free item or a discount.",
      ),
    ).toBeInTheDocument();
  });

  it("emits FAQPage JSON-LD", async () => {
    const { container } = await renderPage();
    const script = container.querySelector(
      'script[type="application/ld+json"]',
    );
    expect(script).not.toBeNull();
    const data = JSON.parse(script?.textContent ?? "{}");
    expect(data["@type"]).toBe("FAQPage");
    expect(data.mainEntity).toHaveLength(10);
  });

  it("opens a row by touch", async () => {
    const user = userEvent.setup();
    await renderPage();
    const summary = screen
      .getByText("Can I choose the reward?")
      .closest("summary") as HTMLElement;
    const details = summary.closest("details") as HTMLDetailsElement;
    expect(details.open).toBe(false);
    await user.pointer({ keys: "[TouchA]", target: summary });
    expect(details.open).toBe(true);
  });

  it("keeps nav and footer, with the page title set", async () => {
    await renderPage();
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(metadata.title).toBe("FAQ");
  });

  it("publishes no price, em dash, exclamation or readiness claim", async () => {
    const { container } = await renderPage();
    const text = container.querySelector("main")?.textContent ?? "";
    expect(text).not.toContain("$");
    expect(text).not.toContain("—");
    expect(text).not.toContain("!");
    expect(text).not.toMatch(/\b(live|now available|proven|tiers?|pro)\b/i);
  });
});
