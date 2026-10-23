import { describe, it, expect, vi, beforeEach } from "vitest";
const { rpc, readProof, saveProof } = vi.hoisted(() => ({
  rpc: vi.fn(),
  readProof: vi.fn(),
  saveProof: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({
  createServiceClient: vi.fn(async () => ({ rpc })),
}));
vi.mock("@/lib/customer-proof", async () => {
  const { z } = await import("zod");
  return {
    customerTokenSchema: z.string().regex(/^[a-f0-9]{32}$/),
    readCustomerProof: readProof,
    saveCustomerProof: saveProof,
  };
});
const { profileMock } = vi.hoisted(() => ({ profileMock: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/merqo-vendor-profile", () => ({
  getOrCreateVendorProfile: profileMock,
}));
beforeEach(() => {
  profileMock.mockResolvedValue({ stall_name: "Kaya Toast" });
});
import { claimEarnAction } from "./actions";
import { marketingConsentText } from "@/lib/marketing-consent";
const order = "00560000-0000-0000-0000-000000000100";
const vendor = "00560000-0000-0000-0000-000000000001";
const token = "a".repeat(32);
function form(overrides: Record<string, string | undefined> = {}) {
  const data = new FormData();
  for (const [key, value] of Object.entries({
    order,
    phone: "91234567",
    name: "Tan",
    ...overrides,
  }))
    if (value !== undefined) data.set(key, value);
  return data;
}
const result = {
  vendor_id: vendor,
  card_token: token,
  stamp_count: 4,
  stamps_required: 10,
  reward_text: "Free coffee",
};
beforeEach(() => {
  vi.resetAllMocks();
  readProof.mockResolvedValue(null);
  saveProof.mockResolvedValue(undefined);
});
describe("claimEarnAction capability boundary", () => {
  it.each([
    { order: "bad" },
    { phone: "123" },
    { name: "x".repeat(101) },
    { token: "bad" },
  ])("rejects invalid input before DB", async (input) => {
    expect(
      (await claimEarnAction({ status: "idle" }, form(input))).status,
    ).toBe("error");
    expect(rpc).not.toHaveBeenCalled();
  });
  it("rejects unknown orders before reading a cookie", async () => {
    rpc.mockResolvedValueOnce({ data: null, error: null });
    expect((await claimEarnAction({ status: "idle" }, form())).status).toBe(
      "error",
    );
    expect(readProof).not.toHaveBeenCalled();
  });
  it("allows a new enrollment and stores only its returned proof in the cookie", async () => {
    rpc
      .mockResolvedValueOnce({ data: vendor, error: null })
      .mockResolvedValueOnce({ data: result, error: null });
    const state = await claimEarnAction({ status: "idle" }, form());
    expect(state).toEqual({
      status: "success",
      stampCount: 4,
      stampsRequired: 10,
      rewardText: "Free coffee",
    });
    expect(rpc).toHaveBeenLastCalledWith("customer_qkit_earn_claim", {
      p_order_id: order,
      p_phone: "+6591234567",
      p_name: "Tan",
      p_token: null,
    });
    expect(saveProof).toHaveBeenCalledWith(vendor, token);
    expect(JSON.stringify(state)).not.toContain(token);
  });
  it("uses vendor-scoped saved proof for an existing card", async () => {
    readProof.mockResolvedValue(token);
    rpc
      .mockResolvedValueOnce({ data: vendor, error: null })
      .mockResolvedValueOnce({ data: result, error: null });
    expect((await claimEarnAction({ status: "idle" }, form())).status).toBe(
      "success",
    );
    expect(readProof).toHaveBeenCalledWith(vendor);
    expect(rpc).toHaveBeenLastCalledWith(
      "customer_qkit_earn_claim",
      expect.objectContaining({ p_token: token }),
    );
  });
  it("accepts manually recovered proof without trusting a browser-supplied vendor", async () => {
    rpc
      .mockResolvedValueOnce({ data: vendor, error: null })
      .mockResolvedValueOnce({ data: result, error: null });
    expect(
      (await claimEarnAction({ status: "idle" }, form({ token }))).status,
    ).toBe("success");
    expect(readProof).not.toHaveBeenCalled();
  });
  it("maps unauthorized existing or replay claims to recovery without exposing DB details", async () => {
    rpc
      .mockResolvedValueOnce({ data: vendor, error: null })
      .mockResolvedValueOnce({
        data: null,
        error: { message: "victim phone and token details" },
      });
    const state = await claimEarnAction({ status: "idle" }, form());
    expect(state.status).toBe("error");
    expect(state.message).toContain("recover your card");
    expect(JSON.stringify(state)).not.toContain("victim");
    expect(saveProof).not.toHaveBeenCalled();
  });
  it.each([
    { ...result, vendor_id: "00560000-0000-0000-0000-000000000002" },
    { ...result, card_token: "bad" },
    { ...result, stamp_count: -1 },
    null,
  ])("fails closed on unexpected response", async (data) => {
    rpc
      .mockResolvedValueOnce({ data: vendor, error: null })
      .mockResolvedValueOnce({ data, error: null });
    expect((await claimEarnAction({ status: "idle" }, form())).status).toBe(
      "error",
    );
    expect(saveProof).not.toHaveBeenCalled();
  });
  it("allows retry after a transport rejection", async () => {
    rpc.mockRejectedValueOnce(new Error("transport"));
    expect((await claimEarnAction({ status: "idle" }, form())).status).toBe(
      "error",
    );
    rpc
      .mockResolvedValueOnce({ data: vendor, error: null })
      .mockResolvedValueOnce({ data: result, error: null });
    expect((await claimEarnAction({ status: "idle" }, form())).status).toBe(
      "success",
    );
  });
  it("reports cookie-save rejection without disclosing the capability", async () => {
    rpc
      .mockResolvedValueOnce({ data: vendor, error: null })
      .mockResolvedValueOnce({ data: result, error: null });
    saveProof.mockRejectedValueOnce(new Error("cookie unavailable"));
    expect((await claimEarnAction({ status: "idle" }, form())).status).toBe(
      "error",
    );
  });
});
describe("claimEarnAction marketing opt-in", () => {
  beforeEach(() => {
    profileMock.mockResolvedValue({ stall_name: "Kaya Toast" });
  });
  it("records a ticked opt-in with the returned card proof", async () => {
    rpc
      .mockResolvedValueOnce({ data: vendor, error: null })
      .mockResolvedValueOnce({ data: result, error: null })
      .mockResolvedValueOnce({ data: true, error: null });
    const state = await claimEarnAction(
      { status: "idle" },
      form({ marketing: "yes", marketing_shop: "Kaya Toast" }),
    );
    expect(state.status).toBe("success");
    expect(state.marketingSaveFailed).toBeUndefined();
    expect(rpc).toHaveBeenLastCalledWith("customer_set_marketing_consent", {
      p_vendor: vendor,
      p_phone: "+6591234567",
      p_token: token,
      p_granted: true,
      p_wording_version: expect.any(String),
      p_wording_text: marketingConsentText("Kaya Toast"),
      p_source: "earn",
    });
  });
  it("keeps the stamp and flags a failed consent save", async () => {
    rpc
      .mockResolvedValueOnce({ data: vendor, error: null })
      .mockResolvedValueOnce({ data: result, error: null })
      .mockResolvedValueOnce({ data: null, error: { message: "down" } });
    const state = await claimEarnAction(
      { status: "idle" },
      form({ marketing: "yes", marketing_shop: "Kaya Toast" }),
    );
    expect(state).toMatchObject({
      status: "success",
      marketingSaveFailed: true,
    });
  });
  it("stores the fallback wording when the form showed no shop name", async () => {
    profileMock.mockRejectedValue(new Error("merqo down"));
    rpc
      .mockResolvedValueOnce({ data: vendor, error: null })
      .mockResolvedValueOnce({ data: result, error: null })
      .mockResolvedValueOnce({ data: true, error: null });
    const state = await claimEarnAction(
      { status: "idle" },
      form({ marketing: "yes", marketing_shop: "" }),
    );
    expect(state.marketingSaveFailed).toBeUndefined();
    expect(rpc).toHaveBeenLastCalledWith(
      "customer_set_marketing_consent",
      expect.objectContaining({ p_wording_text: marketingConsentText(null) }),
    );
  });
  it("skips the consent write when the shown shop name cannot be confirmed", async () => {
    profileMock.mockRejectedValue(new Error("merqo down"));
    rpc
      .mockResolvedValueOnce({ data: vendor, error: null })
      .mockResolvedValueOnce({ data: result, error: null });
    const state = await claimEarnAction(
      { status: "idle" },
      form({ marketing: "yes", marketing_shop: "Kaya Toast" }),
    );
    expect(state).toMatchObject({
      status: "success",
      marketingSaveFailed: true,
    });
    expect(rpc).toHaveBeenCalledTimes(2);
  });
});
