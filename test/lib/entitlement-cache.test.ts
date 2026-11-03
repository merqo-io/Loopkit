import { describe, it, expect, beforeEach, vi } from "vitest";

const { maybeSingleMock } = vi.hoisted(() => ({ maybeSingleMock: vi.fn() }));
vi.mock("@/features/auth", () => ({
  requireVendor: vi.fn(async () => ({ user: { id: "v1" } })),
}));
vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(async () => ({
    from: (table: string) => {
      if (table !== "vendor_entitlements") throw new Error(table);
      return {
        select: () => ({ eq: () => ({ maybeSingle: maybeSingleMock }) }),
      };
    },
  })),
}));

import { isPaidEntitlement } from "@/lib/entitlement-cache";
import { isPro } from "@/lib/program";

const NOW = new Date("2026-11-03T00:00:00Z");

describe("isPaidEntitlement", () => {
  it("is false without a cached row", () => {
    expect(isPaidEntitlement(null, NOW)).toBe(false);
    expect(isPaidEntitlement(undefined, NOW)).toBe(false);
  });

  it("is false for any tier other than paid", () => {
    for (const tier of ["free", "starter", "qkit"]) {
      expect(isPaidEntitlement({ tier, valid_until: null }, NOW)).toBe(false);
    }
  });

  it("treats paid with no valid_until as open (legacy carry-over)", () => {
    expect(isPaidEntitlement({ tier: "paid", valid_until: null }, NOW)).toBe(
      true,
    );
  });

  it("is true for paid until valid_until", () => {
    expect(
      isPaidEntitlement(
        { tier: "paid", valid_until: "2026-12-01T00:00:00Z" },
        NOW,
      ),
    ).toBe(true);
  });

  it("lapses to not Pro once valid_until has passed, with no new push", () => {
    expect(
      isPaidEntitlement(
        { tier: "paid", valid_until: "2026-11-02T23:59:59Z" },
        NOW,
      ),
    ).toBe(false);
    expect(
      isPaidEntitlement({ tier: "paid", valid_until: NOW.toISOString() }, NOW),
    ).toBe(false);
  });
});

describe("isPro", () => {
  beforeEach(() => vi.clearAllMocks());

  it("is false with no cached entitlement", async () => {
    maybeSingleMock.mockResolvedValue({ data: null });
    expect(await isPro()).toBe(false);
  });

  it("is true for a paid, unexpired entitlement", async () => {
    maybeSingleMock.mockResolvedValue({
      data: { tier: "paid", valid_until: null },
    });
    expect(await isPro()).toBe(true);
  });

  it("is false once a paid entitlement has lapsed", async () => {
    maybeSingleMock.mockResolvedValue({
      data: { tier: "paid", valid_until: "2020-01-01T00:00:00Z" },
    });
    expect(await isPro()).toBe(false);
  });
});
