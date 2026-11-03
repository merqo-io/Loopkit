import { describe, it, expect, beforeEach, vi } from "vitest";

const { listUsersMock, rpcMock } = vi.hoisted(() => ({
  listUsersMock: vi.fn(),
  rpcMock: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({
  createServiceClient: vi.fn(async () => ({
    auth: { admin: { listUsers: listUsersMock } },
    rpc: rpcMock,
  })),
}));

import { POST } from "@/app/api/merqo/entitlement/route";

const USER_ID = "11111111-1111-1111-8111-111111111111";

const payload = {
  email: "vendor@x.com",
  kit: "loopkit",
  tier: "paid",
  founder: false,
  stats_window: "90d",
  event_pass: null,
  valid_until: "2027-01-01T00:00:00+00:00",
  issued_at: "2026-11-03T00:00:00+00:00",
};

function req(body: unknown, auth?: string) {
  return new Request("http://localhost/api/merqo/entitlement", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(auth ? { Authorization: auth } : {}),
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/merqo/entitlement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.MERQO_PROVISION_SECRET = "test-secret";
    listUsersMock.mockResolvedValue({
      data: { users: [{ id: USER_ID, email: "Vendor@x.com" }] },
      error: null,
    });
    rpcMock.mockResolvedValue({ data: null, error: null });
  });

  it("401 when the bearer is missing", async () => {
    const res = await POST(req(payload));
    expect(res.status).toBe(401);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("401 when the bearer is wrong", async () => {
    const res = await POST(req(payload, "Bearer nope"));
    expect(res.status).toBe(401);
  });

  it("400 on a body that is not JSON", async () => {
    const res = await POST(req("not json", "Bearer test-secret"));
    expect(res.status).toBe(400);
  });

  it("400 when the payload fails the contract", async () => {
    const res = await POST(
      req({ ...payload, tier: "gold" }, "Bearer test-secret"),
    );
    expect(res.status).toBe(400);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("400 when the kit is not loopkit", async () => {
    const res = await POST(
      req({ ...payload, kit: "qkit", tier: "starter" }, "Bearer test-secret"),
    );
    expect(res.status).toBe(400);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("404 unknown_vendor when no auth user has the email", async () => {
    listUsersMock.mockResolvedValue({
      data: { users: [{ id: "u2", email: "other@x.com" }] },
      error: null,
    });
    const res = await POST(req(payload, "Bearer test-secret"));
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ ok: false, error: "unknown_vendor" });
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("503 when the user directory is unavailable", async () => {
    listUsersMock.mockResolvedValue({ data: null, error: { message: "down" } });
    const res = await POST(req(payload, "Bearer test-secret"));
    expect(res.status).toBe(503);
  });

  it("200 and stores the entitlement through the ordered upsert", async () => {
    const res = await POST(req(payload, "Bearer test-secret"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(rpcMock).toHaveBeenCalledWith("upsert_vendor_entitlement", {
      p_vendor_id: USER_ID,
      p_tier: "paid",
      p_founder: false,
      p_stats_window: "90d",
      p_valid_until: payload.valid_until,
      p_issued_at: payload.issued_at,
    });
  });

  it("200 for a stale push, which the SQL function ignores", async () => {
    const res = await POST(
      req(
        { ...payload, issued_at: "2020-01-01T00:00:00+00:00" },
        "Bearer test-secret",
      ),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("500 when the upsert fails", async () => {
    rpcMock.mockResolvedValue({ data: null, error: { message: "boom" } });
    const res = await POST(req(payload, "Bearer test-secret"));
    expect(res.status).toBe(500);
  });
});
