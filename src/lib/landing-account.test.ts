import { describe, it, expect, vi, beforeEach } from "vitest";

const { getUserMock, maybeSingleMock, eqMock, createServerClientMock } =
  vi.hoisted(() => ({
    getUserMock: vi.fn(),
    maybeSingleMock: vi.fn(),
    eqMock: vi.fn(),
    createServerClientMock: vi.fn(),
  }));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: createServerClientMock,
}));

import { getLandingAccount } from "./landing-account";

beforeEach(() => {
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

  it("names the account after the vendor row when signed in", async () => {
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
    expect(await getLandingAccount()).toEqual({
      name: "Aunty Lim",
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
