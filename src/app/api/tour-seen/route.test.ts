import { beforeEach, describe, expect, it, vi } from "vitest";

const { getUserMock, createServerClientMock, stampTourSeenMock } = vi.hoisted(
  () => ({
    getUserMock: vi.fn(),
    createServerClientMock: vi.fn(),
    stampTourSeenMock: vi.fn(),
  }),
);

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: createServerClientMock,
}));

vi.mock("@/lib/tour-prefs", () => ({
  stampTourSeen: stampTourSeenMock,
}));

beforeEach(() => {
  getUserMock.mockReset();
  stampTourSeenMock.mockReset().mockResolvedValue(undefined);
  createServerClientMock.mockReset().mockResolvedValue({
    auth: { getUser: getUserMock },
  });
});

const sameOrigin = () =>
  new Request("https://loopkit.merqo.io/api/tour-seen", {
    method: "POST",
    headers: { "sec-fetch-site": "same-origin" },
  });

describe("POST /api/tour-seen", () => {
  it("refuses a cross-site request before reading the session", async () => {
    const { POST } = await import("./route");
    const res = await POST(
      new Request("https://loopkit.merqo.io/api/tour-seen", {
        method: "POST",
        headers: {
          "sec-fetch-site": "cross-site",
          origin: "https://evil.example",
        },
      }),
    );

    expect(res.status).toBe(403);
    expect(createServerClientMock).not.toHaveBeenCalled();
    expect(stampTourSeenMock).not.toHaveBeenCalled();
  });

  it("refuses a sibling merqo.io host", async () => {
    const { POST } = await import("./route");
    const res = await POST(
      new Request("https://loopkit.merqo.io/api/tour-seen", {
        method: "POST",
        headers: { origin: "https://qkit.merqo.io" },
      }),
    );

    expect(res.status).toBe(403);
    expect(stampTourSeenMock).not.toHaveBeenCalled();
  });

  it("stamps tour_seen_at on the signed-in vendor's own row", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "v1" } } });

    const { POST } = await import("./route");
    const res = await POST(sameOrigin());

    expect(res.status).toBe(204);
    expect(stampTourSeenMock).toHaveBeenCalledWith(expect.anything(), "v1");
  });

  it("does nothing when no user is signed in", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });

    const { POST } = await import("./route");
    const res = await POST(sameOrigin());

    expect(res.status).toBe(204);
    expect(stampTourSeenMock).not.toHaveBeenCalled();
  });
});
