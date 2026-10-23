import { describe, it, expect, vi, beforeEach } from "vitest";

const { rpc, revalidate } = vi.hoisted(() => ({
  rpc: vi.fn(),
  revalidate: vi.fn(),
}));
vi.mock("@/features/auth", () => ({ requireVendor: vi.fn(async () => ({})) }));
vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(async () => ({ rpc })),
}));
vi.mock("next/cache", () => ({ revalidatePath: revalidate }));

import { withdrawMarketingConsentAction } from "./actions";

function form(phone: string) {
  const fd = new FormData();
  fd.set("phone", phone);
  return fd;
}

beforeEach(() => vi.clearAllMocks());

describe("withdrawMarketingConsentAction", () => {
  it("rejects a bad phone before the database", async () => {
    expect((await withdrawMarketingConsentAction(form("12"))).success).toBe(
      false,
    );
    expect(rpc).not.toHaveBeenCalled();
  });

  it("records the withdrawal under the vendor session", async () => {
    rpc.mockResolvedValue({ data: null, error: null });
    expect(await withdrawMarketingConsentAction(form("91234567"))).toEqual({
      success: true,
    });
    expect(rpc).toHaveBeenCalledWith("vendor_withdraw_marketing_consent", {
      p_phone: "+6591234567",
    });
    expect(revalidate).toHaveBeenCalledWith(
      "/dashboard/customers/%2B6591234567",
    );
  });

  it("maps a database error to a generic message", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "not authorized" } });
    expect(await withdrawMarketingConsentAction(form("91234567"))).toEqual({
      success: false,
      error: "Could not record the opt-out.",
    });
    expect(revalidate).not.toHaveBeenCalled();
  });
});
