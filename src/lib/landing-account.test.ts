import { describe, it, expect, vi, beforeEach } from "vitest";

const { getUserMock, maybeSingleMock, createServerClientMock } = vi.hoisted(
  () => ({
    getUserMock: vi.fn(),
    maybeSingleMock: vi.fn(),
    createServerClientMock: vi.fn(),
  }),
);

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: createServerClientMock,
}));

import { getLandingAccount } from "./landing-account";

beforeEach(() => {
  createServerClientMock.mockReset().mockResolvedValue({
    auth: { getUser: getUserMock },
    from: () => ({ select: () => ({ maybeSingle: maybeSingleMock }) }),
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
        user: { email: "a@b.sg", user_metadata: { avatar_url: "http://x/y" } },
      },
    });
    maybeSingleMock.mockResolvedValue({ data: { name: "Aunty Lim" } });
    expect(await getLandingAccount()).toEqual({
      email: "a@b.sg",
      name: "Aunty Lim",
      avatarUrl: "http://x/y",
    });
  });

  it("falls back to nulls when the vendor row and metadata are missing", async () => {
    getUserMock.mockResolvedValue({ data: { user: { email: null } } });
    maybeSingleMock.mockResolvedValue({ data: null });
    expect(await getLandingAccount()).toEqual({
      email: "",
      name: null,
      avatarUrl: null,
    });
  });
});
