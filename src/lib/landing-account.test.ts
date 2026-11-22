import { describe, it, expect, vi, beforeEach } from "vitest";

const { getUserMock, maybeSingleMock, eqMock, schemaMock, createServiceMock } =
  vi.hoisted(() => ({
    getUserMock: vi.fn(),
    maybeSingleMock: vi.fn(),
    eqMock: vi.fn(),
    schemaMock: vi.fn(),
    createServiceMock: vi.fn(),
  }));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn().mockResolvedValue({
    auth: { getUser: getUserMock },
  }),
  createServiceClient: createServiceMock,
}));

import { getLandingAccount } from "./landing-account";

const fullNameUser = {
  id: "u1",
  email: "a@b.sg",
  user_metadata: {
    full_name: "Clarence Lee",
    avatar_url: "https://x/y.png",
  },
};

beforeEach(() => {
  eqMock.mockReset().mockReturnValue({ maybeSingle: maybeSingleMock });
  schemaMock.mockReset().mockReturnValue({
    from: () => ({ select: () => ({ eq: eqMock }) }),
  });
  createServiceMock.mockReset().mockResolvedValue({ schema: schemaMock });
  getUserMock.mockReset().mockResolvedValue({ data: { user: fullNameUser } });
});

describe("getLandingAccount", () => {
  it("returns null when signed out", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    expect(await getLandingAccount()).toBeNull();
    expect(createServiceMock).not.toHaveBeenCalled();
  });

  it("labels the account with the shared stall name, not the full name", async () => {
    maybeSingleMock.mockResolvedValue({
      data: { stall_name: "My Stall" },
      error: null,
    });
    expect(await getLandingAccount()).toEqual({
      name: "My Stall",
      email: "a@b.sg",
      avatarUrl: "https://x/y.png",
    });
  });

  it("reads merqo.vendor_profile scoped to the viewer's own id", async () => {
    maybeSingleMock.mockResolvedValue({ data: null, error: null });
    await getLandingAccount();
    expect(schemaMock).toHaveBeenCalledWith("merqo");
    expect(eqMock).toHaveBeenCalledWith("vendor_id", "u1");
  });

  it("falls back to the auth user's name when there is no profile row", async () => {
    maybeSingleMock.mockResolvedValue({ data: null, error: null });
    expect((await getLandingAccount())?.name).toBe("Clarence Lee");
  });

  it("falls back when the read returns an error", async () => {
    maybeSingleMock.mockResolvedValue({ data: null, error: { message: "x" } });
    expect((await getLandingAccount())?.name).toBe("Clarence Lee");
  });

  it("falls back without throwing when the read throws", async () => {
    createServiceMock.mockRejectedValue(new Error("no key"));
    expect((await getLandingAccount())?.name).toBe("Clarence Lee");
  });
});
