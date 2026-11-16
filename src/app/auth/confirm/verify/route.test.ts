import { beforeEach, describe, expect, it, vi } from "vitest";

const verifyOtp = vi.hoisted(() => vi.fn());
vi.mock("@/lib/supabase/server", () => ({
  createServerClient: async () => ({ auth: { verifyOtp } }),
}));
import { POST } from "./route";

const ORIGIN = "https://loopkit.merqo.io";
const post = (fields: Record<string, string>, headers: HeadersInit = {}) =>
  POST(
    new Request(`${ORIGIN}/auth/confirm/verify`, {
      method: "POST",
      headers: { origin: ORIGIN, ...headers },
      body: new URLSearchParams(fields),
    }),
  );
const location = (r: Response) => r.headers.get("location");

beforeEach(() => {
  vi.clearAllMocks();
  verifyOtp.mockResolvedValue({ data: {}, error: null });
});

describe("auth confirm verify", () => {
  it("lands on /dashboard after a successful sign-in link", async () => {
    const res = await post({ token_hash: "abc", type: "magiclink" });
    expect(res.status).toBe(303);
    expect(location(res)).toBe(`${ORIGIN}/dashboard`);
    expect(verifyOtp).toHaveBeenCalledWith({
      token_hash: "abc",
      type: "magiclink",
    });
  });

  it("sends a recovery link to /reset-password", async () => {
    const res = await post({ token_hash: "abc", type: "recovery" });
    expect(location(res)).toBe(`${ORIGIN}/reset-password`);
  });

  it("goes to /login?error=link when verification fails", async () => {
    verifyOtp.mockResolvedValue({ data: {}, error: new Error("expired") });
    const res = await post({ token_hash: "abc", type: "recovery" });
    expect(location(res)).toBe(`${ORIGIN}/login?error=link`);
  });

  it("rejects a cross-origin POST without calling Supabase", async () => {
    const res = await post(
      { token_hash: "abc", type: "recovery" },
      { origin: "https://evil.example" },
    );
    expect(location(res)).toBe(`${ORIGIN}/login?error=link`);
    expect(verifyOtp).not.toHaveBeenCalled();
  });
});
