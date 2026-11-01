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
  ANON_PHONE_LIMIT,
  ANON_WINDOW_SECONDS,
  allowAnonymousAction,
  clientIp,
} from "./rate-limit";

beforeEach(() => {
  vi.resetAllMocks();
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
    expect(clientIp(new Headers({ "x-forwarded-for": "9.9.9.9" }))).toBe(
      "unknown",
    );
  });
});

describe("allowAnonymousAction", () => {
  it("allows when both counters are under their limits", async () => {
    rpc.mockResolvedValue({ data: true, error: null });
    expect(await allowAnonymousAction("earn", "+6591234567")).toBe(true);
    expect(rpc).toHaveBeenNthCalledWith(1, "check_rate_limit", {
      p_key: "ip:1.1.1.1",
      p_limit: ANON_IP_LIMIT,
      p_window_seconds: ANON_WINDOW_SECONDS,
    });
    expect(rpc).toHaveBeenNthCalledWith(2, "check_rate_limit", {
      p_key: "earn:phone:+6591234567",
      p_limit: ANON_PHONE_LIMIT,
      p_window_seconds: ANON_WINDOW_SECONDS,
    });
  });

  it("blocks on the IP counter without spending a phone hit", async () => {
    rpc.mockResolvedValue({ data: false, error: null });
    expect(await allowAnonymousAction("earn", "+6591234567")).toBe(false);
    expect(rpc).toHaveBeenCalledTimes(1);
  });

  it("blocks on the phone counter", async () => {
    rpc
      .mockResolvedValueOnce({ data: true, error: null })
      .mockResolvedValueOnce({ data: false, error: null });
    expect(await allowAnonymousAction("card-check", "+6591234567")).toBe(false);
  });

  it("fails closed when the limiter RPC errors", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "down" } });
    expect(await allowAnonymousAction("earn", "+6591234567")).toBe(false);
  });

  it("fails closed when the limiter throws", async () => {
    rpc.mockRejectedValue(new Error("transport"));
    expect(await allowAnonymousAction("earn", "+6591234567")).toBe(false);
  });
});
