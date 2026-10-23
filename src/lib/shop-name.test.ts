import { describe, it, expect, vi, beforeEach } from "vitest";

const { profileMock } = vi.hoisted(() => ({ profileMock: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({
  createServiceClient: vi.fn(async () => ({})),
}));
vi.mock("@/lib/merqo-vendor-profile", () => ({
  getOrCreateVendorProfile: profileMock,
}));

import { getShopName, shownConsentWording } from "./shop-name";
import { marketingConsentText } from "./marketing-consent";

beforeEach(() => profileMock.mockReset());

describe("getShopName", () => {
  it("returns the trimmed shared stall name", async () => {
    profileMock.mockResolvedValue({ stall_name: " Kaya Toast " });
    expect(await getShopName("v1")).toBe("Kaya Toast");
    expect(profileMock).toHaveBeenCalledWith({}, "v1", null);
  });

  it("returns null for a blank name or a merqo failure", async () => {
    profileMock.mockResolvedValueOnce({ stall_name: " " });
    expect(await getShopName("v1")).toBeNull();
    profileMock.mockRejectedValueOnce(new Error("down"));
    expect(await getShopName("v1")).toBeNull();
  });
});

describe("shownConsentWording", () => {
  it("rebuilds the wording for the current shop name", async () => {
    profileMock.mockResolvedValue({ stall_name: "Kaya Toast" });
    expect(await shownConsentWording("v1", "Kaya Toast")).toBe(
      marketingConsentText("Kaya Toast"),
    );
  });

  it("uses the fallback without a lookup when the form showed none", async () => {
    expect(await shownConsentWording("v1", "")).toBe(
      marketingConsentText(null),
    );
    expect(profileMock).not.toHaveBeenCalled();
  });

  it("returns null for a stale name or a failed lookup", async () => {
    profileMock.mockResolvedValueOnce({ stall_name: "New Name" });
    expect(await shownConsentWording("v1", "Old Name")).toBeNull();
    profileMock.mockRejectedValueOnce(new Error("down"));
    expect(await shownConsentWording("v1", "Old Name")).toBeNull();
  });
});
