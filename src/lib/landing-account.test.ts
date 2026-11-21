import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  getUserMock,
  maybeSingleMock,
  eqMock,
  createServerClientMock,
  getOrCreateMock,
} = vi.hoisted(() => ({
  getUserMock: vi.fn(),
  maybeSingleMock: vi.fn(),
  eqMock: vi.fn(),
  createServerClientMock: vi.fn(),
  getOrCreateMock: vi.fn(),
}));

vi.mock("@/lib/merqo-vendor-profile", () => ({
  getOrCreateVendorProfile: getOrCreateMock,
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: createServerClientMock,
}));

import { getLandingAccount } from "./landing-account";

beforeEach(() => {
  getOrCreateMock.mockReset().mockRejectedValue(new Error("rpc down"));
  eqMock.mockReset().mockReturnValue({ maybeSingle: maybeSingleMock });
  createServerClientMock.mockReset().mockResolvedValue({
    auth: { getUser: getUserMock },
    from: () => ({ select: () => ({ eq: eqMock }) }),
  });
});

describe("getLandingAccount", () => {
  it("returns null when signed out", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    expect(await getLandingAccount()).toBeNull();
  });

  it("names the account after the shared stall name the dashboard shows", async () => {
    getUserMock.mockResolvedValue({
      data: {
        user: {
          id: "u1",
          email: "a@b.sg",
          user_metadata: { full_name: "Clarence Lee" },
        },
      },
    });
    maybeSingleMock.mockResolvedValue({ data: null });
    getOrCreateMock.mockResolvedValue({ stall_name: "My Stall" });
    expect((await getLandingAccount())?.name).toBe("My Stall");
    expect(getOrCreateMock).toHaveBeenCalledWith(expect.anything(), "u1", null);
  });

  it("falls back to the local vendor name when the shared read fails", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "u1", email: "a@b.sg" } },
    });
    maybeSingleMock.mockResolvedValue({ data: { name: "Aunty Lim" } });
    expect((await getLandingAccount())?.name).toBe("Aunty Lim");
  });

  it("maps the shared stall name, email and avatar when signed in", async () => {
    getUserMock.mockResolvedValue({
      data: {
        user: {
          id: "u1",
          email: "a@b.sg",
          user_metadata: { avatar_url: "https://x/y.png" },
        },
      },
    });
    maybeSingleMock.mockResolvedValue({ data: { name: "Aunty Lim" } });
    getOrCreateMock.mockResolvedValue({ stall_name: "Aunty Lim Kopi" });
    expect(await getLandingAccount()).toEqual({
      name: "Aunty Lim Kopi",
      email: "a@b.sg",
      avatarUrl: "https://x/y.png",
    });
  });

  it("scopes the vendor read to the signed-in user's own row", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1", email: "" } } });
    maybeSingleMock.mockResolvedValue({ data: null });
    await getLandingAccount();
    expect(eqMock).toHaveBeenCalledWith("vendor_id", "u1");
  });

  it("falls back to the email local part without a vendor row", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "u1", email: "a@b.sg" } },
    });
    maybeSingleMock.mockResolvedValue({ data: null });
    expect((await getLandingAccount())?.name).toBe("a");
  });
});
