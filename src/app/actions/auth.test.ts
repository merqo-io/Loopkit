import { describe, it, expect, vi } from "vitest";

const { signOutMock, redirectMock } = vi.hoisted(() => ({
  signOutMock: vi.fn().mockResolvedValue({}),
  redirectMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: async () => ({ auth: { signOut: signOutMock } }),
}));
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

import { signOutAction } from "./auth";

describe("signOutAction", () => {
  it("signs out and redirects to /login", async () => {
    await signOutAction();
    expect(signOutMock).toHaveBeenCalled();
    expect(redirectMock).toHaveBeenCalledWith("/login");
  });
});
