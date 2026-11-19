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

  it("returns email, stall name and avatar when signed in", async () => {
    getUserMock.mockResolvedValue({
      data: {
        user: {
          id: "u1",
          email: "a@b.sg",
          user_metadata: { avatar_url: "http://x/y" },
        },
      },
    });
    maybeSingleMock.mockResolvedValue({ data: { name: "Aunty Lim" } });
    expect(await getLandingAccount()).toEqual({
      email: "a@b.sg",
      name: "Aunty Lim",
      avatarUrl: "http://x/y",
    });
  });

  it("scopes the vendor read to the signed-in user's own row", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1", email: "" } } });
    maybeSingleMock.mockResolvedValue({ data: null });
    await getLandingAccount();
    expect(eqMock).toHaveBeenCalledWith("vendor_id", "u1");
  });

  it("ignores a non-string avatar_url", async () => {
    getUserMock.mockResolvedValue({
      data: {
        user: { id: "u1", email: "a@b.sg", user_metadata: { avatar_url: 42 } },
      },
    });
    maybeSingleMock.mockResolvedValue({ data: null });
    expect((await getLandingAccount())?.avatarUrl).toBeNull();
  });

  it("falls back to nulls when the vendor row and metadata are missing", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "u1", email: null } },
    });
    maybeSingleMock.mockResolvedValue({ data: null });
    expect(await getLandingAccount()).toEqual({
      email: "",
      name: null,
      avatarUrl: null,
    });
  });
});
