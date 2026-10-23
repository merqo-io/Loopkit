import { describe, it, expect, vi, beforeEach } from "vitest";

const { result, eqMock } = vi.hoisted(() => ({
  result: { current: { data: null as unknown, error: null as unknown } },
  eqMock: vi.fn(),
}));

function query() {
  const chain = {
    select: () => chain,
    eq: (...args: unknown[]) => {
      eqMock(...args);
      return chain;
    },
    order: () => chain,
    limit: () => chain,
    maybeSingle: async () => result.current,
  };
  return chain;
}

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(async () => ({ from: () => query() })),
}));

import { getMarketingConsentStatus } from "./customers";

beforeEach(() => vi.clearAllMocks());

describe("getMarketingConsentStatus", () => {
  it("returns null when the customer never opted in", async () => {
    result.current = { data: null, error: null };
    expect(await getMarketingConsentStatus("+6591234567")).toBeNull();
    expect(eqMock).toHaveBeenCalledWith("phone", "+6591234567");
  });

  it("maps the latest row", async () => {
    result.current = {
      data: {
        granted: false,
        recorded_at: "2026-10-21T02:00:00Z",
        source: "vendor_recorded",
      },
      error: null,
    };
    expect(await getMarketingConsentStatus("+6591234567")).toEqual({
      granted: false,
      recordedAt: "2026-10-21T02:00:00Z",
      vendorRecorded: true,
    });
  });

  it("throws on a read error", async () => {
    result.current = { data: null, error: { message: "denied" } };
    await expect(getMarketingConsentStatus("+6591234567")).rejects.toThrow(
      "getMarketingConsentStatus: denied",
    );
  });
});
