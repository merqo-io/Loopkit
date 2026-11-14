// @vitest-environment jsdom
//
// The page fetches merqo's plan catalog server-side and renders the shared
// PricingLadder; global fetch is stubbed so no test touches the network.
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/features/auth", () => ({ requireVendor: vi.fn(async () => ({})) }));

const program = { id: "p1", name: "Coffee Stamps", type: "stamp" };

vi.mock("@/lib/program", () => ({
  isPro: vi.fn(async () => false),
  listPrograms: vi.fn(async () => [program]),
  currentProgram: (progs: { id: string }[], id?: string) =>
    progs.find((p) => p.id === id) ?? null,
}));
vi.mock("@/lib/stats", () => ({
  getProgramStats: vi.fn(async () => ({
    enrolled: 5,
    repeatVisitRate: 0.6,
    rewardsTotal: 3,
  })),
}));

import PlanPage from "./page";

const catalog = {
  plans: [
    {
      slug: "starter",
      kind: "free",
      name: "Starter",
      monthly_cents: 0,
      annual_cents: 0,
      kits: [],
    },
    {
      slug: "qkit",
      kind: "kit",
      name: "qkit",
      monthly_cents: 2900,
      annual_cents: 29000,
      kits: ["qkit"],
    },
    {
      slug: "all_access",
      kind: "bundle",
      name: "All-Access",
      monthly_cents: 4900,
      annual_cents: 49000,
      kits: ["qkit", "loopkit"],
    },
  ],
  event_pass: { per_cup_cents: 20, min_cents: 500, cap_cents: 5000, days: 1 },
};

function stubFetch(impl: () => Promise<Response>) {
  vi.stubGlobal("fetch", vi.fn(impl));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

async function renderPage(p?: string) {
  return render(
    await PlanPage({ searchParams: Promise.resolve(p ? { p } : {}) }),
  );
}

describe("PlanPage", () => {
  it("renders the ladder with prices and All-Access recommended, no Event Pass", async () => {
    stubFetch(async () => Response.json(catalog));
    await renderPage();
    expect(screen.getByText("All-Access")).toBeInTheDocument();
    expect(screen.getByText("S$49")).toBeInTheDocument();
    expect(screen.getByText(/recommended/i)).toBeInTheDocument();
    expect(screen.queryByText(/event pass/i)).not.toBeInTheDocument();
    expect(
      screen.getByText(/change plan from your merqo account/i),
    ).toBeInTheDocument();
  });

  it("shows the pilot notice above the ladder", async () => {
    stubFetch(async () => Response.json(catalog));
    await renderPage();
    expect(
      screen.getByText(/merqo is free during the pilot\./i),
    ).toBeInTheDocument();
  });

  it("shows the current plan and an unavailable line when the fetch rejects", async () => {
    stubFetch(async () => {
      throw new Error("down");
    });
    await renderPage();
    expect(screen.getByText(/prices are unavailable/i)).toBeInTheDocument();
    expect(screen.getByText("Free")).toBeInTheDocument();
    expect(screen.queryByText(/\$\s?\d/)).not.toBeInTheDocument();
  });

  it("falls back on a non-2xx response", async () => {
    stubFetch(async () => new Response("no", { status: 503 }));
    await renderPage();
    expect(screen.getByText(/prices are unavailable/i)).toBeInTheDocument();
    expect(screen.queryByText(/\$\s?\d/)).not.toBeInTheDocument();
  });

  it("shows the Free badge and one-program note for a Free vendor", async () => {
    stubFetch(async () => new Response("no", { status: 503 }));
    await renderPage();
    expect(screen.getByText("Free")).toBeInTheDocument();
    expect(screen.getByText(/one active loyalty program/i)).toBeInTheDocument();
  });

  it("shows the Pro badge, message and program stats for a Pro vendor", async () => {
    stubFetch(async () => new Response("no", { status: 503 }));
    const { isPro } = await import("@/lib/program");
    vi.mocked(isPro).mockResolvedValueOnce(true);
    await renderPage("p1");
    expect(screen.getByText("Pro")).toBeInTheDocument();
    expect(
      screen.getByText(/unlimited loyalty programs are unlocked/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/how your program is doing/i)).toBeInTheDocument();
  });
});
