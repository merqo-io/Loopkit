import { createHash } from "node:crypto";
import { describe, it, expect, vi, beforeEach } from "vitest";

const { rpc, headersMock } = vi.hoisted(() => ({
  rpc: vi.fn(),
  headersMock: vi.fn(),
}));
vi.mock("next/headers", () => ({ headers: headersMock }));
vi.mock("@/lib/supabase/server", () => ({
  createServiceClient: vi.fn(async () => ({ rpc })),
}));

import {
  ANON_IP_LIMIT,
  ANON_PHONE_IP_LIMIT,
  ANON_PHONE_LIMIT,
  ANON_WINDOW_SECONDS,
  allowAnonymousAction,
  clientIp,
} from "./rate-limit";

const sha = (v: string) => createHash("sha256").update(v).digest("hex");
const phone = "+6591234567";

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  headersMock.mockResolvedValue(new Headers({ "x-real-ip": "1.1.1.1" }));
});

describe("clientIp", () => {
  it("prefers x-vercel-forwarded-for over x-real-ip", () => {
    const h = new Headers({
      "x-vercel-forwarded-for": "2.2.2.2, 3.3.3.3",
      "x-real-ip": "1.1.1.1",
      "x-forwarded-for": "9.9.9.9",
    });
    expect(clientIp(h)).toBe("2.2.2.2");
  });

  it("falls back to x-real-ip and never reads x-forwarded-for", () => {
    expect(clientIp(new Headers({ "x-real-ip": "1.1.1.1" }))).toBe("1.1.1.1");
    expect(clientIp(new Headers({ "x-forwarded-for": "9.9.9.9" }))).toBeNull();
  });
});

describe("allowAnonymousAction", () => {
  it("allows when every counter is under its limit, with hashed keys", async () => {
    rpc.mockResolvedValue({ data: true, error: null });
    expect(await allowAnonymousAction("earn", phone)).toBe(true);
    const calls = rpc.mock.calls.map(([, args]) => args);
    expect(calls).toEqual([
      {
        p_key: `ip:${sha("1.1.1.1")}`,
        p_limit: ANON_IP_LIMIT,
        p_window_seconds: ANON_WINDOW_SECONDS,
      },
      {
        p_key: `earn:phone-ip:${sha(phone)}:${sha("1.1.1.1")}`,
        p_limit: ANON_PHONE_IP_LIMIT,
        p_window_seconds: ANON_WINDOW_SECONDS,
      },
      {
        p_key: `earn:phone:${sha(phone)}`,
        p_limit: ANON_PHONE_LIMIT,
        p_window_seconds: ANON_WINDOW_SECONDS,
      },
    ]);
    for (const c of calls) {
      expect(c.p_key).not.toContain("1.1.1.1");
      expect(c.p_key).not.toContain("91234567");
    }
  });

  it("skips the IP bucket when no IP header is present", async () => {
    headersMock.mockResolvedValue(new Headers());
    rpc.mockResolvedValue({ data: true, error: null });
    expect(await allowAnonymousAction("earn", phone)).toBe(true);
    const keys = rpc.mock.calls.map(([, args]) => args.p_key as string);
    expect(keys).toHaveLength(2);
    expect(keys.some((k) => k.startsWith("ip:"))).toBe(false);
  });

  it("blocks on the IP counter without spending phone hits", async () => {
    rpc.mockResolvedValue({ data: false, error: null });
    expect(await allowAnonymousAction("earn", phone)).toBe(false);
    expect(rpc).toHaveBeenCalledTimes(1);
  });

  it("blocks on the strict (phone, IP) counter", async () => {
    rpc
      .mockResolvedValueOnce({ data: true, error: null })
      .mockResolvedValueOnce({ data: false, error: null });
    expect(await allowAnonymousAction("card-check", phone)).toBe(false);
    expect(rpc).toHaveBeenCalledTimes(2);
  });

  it("blocks on the looser per-phone counter", async () => {
    rpc
      .mockResolvedValueOnce({ data: true, error: null })
      .mockResolvedValueOnce({ data: true, error: null })
      .mockResolvedValueOnce({ data: false, error: null });
    expect(await allowAnonymousAction("card-check", phone)).toBe(false);
  });

  it("fails closed and logs without phone or IP when the RPC errors", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "down" } });
    expect(await allowAnonymousAction("earn", phone)).toBe(false);
    const logged = JSON.stringify(vi.mocked(console.error).mock.calls);
    expect(logged).toContain("rate limiter error (earn)");
    expect(logged).not.toContain("91234567");
    expect(logged).not.toContain("1.1.1.1");
  });

  it("fails closed and logs when the limiter throws", async () => {
    rpc.mockRejectedValue(new Error("transport"));
    expect(await allowAnonymousAction("earn", phone)).toBe(false);
    expect(console.error).toHaveBeenCalled();
  });
});
