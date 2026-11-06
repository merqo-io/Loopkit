import { describe, it, expect, vi, beforeEach } from "vitest";

const { requireVendorMock, rpcMock, revalidatePathMock } = vi.hoisted(() => ({
  requireVendorMock: vi.fn(),
  rpcMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}));

vi.mock("@/features/auth", () => ({ requireVendor: requireVendorMock }));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(async () => ({ rpc: rpcMock })),
}));

vi.mock("next/cache", () => ({ revalidatePath: revalidatePathMock }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

import {
  activateProgramAction,
  scheduleRetirementAction,
} from "@/app/setup/actions";

function form(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

const futureDate = () => new Date(Date.now() + 7 * 86_400_000).toISOString();

describe("activateProgramAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireVendorMock.mockResolvedValue({ user: { id: "v1" } });
    rpcMock.mockResolvedValue({ data: true, error: null });
  });

  it("activates the card, revalidates and redirects to its dashboard", async () => {
    await expect(activateProgramAction({}, form({ id: "p1" }))).rejects.toThrow(
      "REDIRECT:/dashboard?p=p1",
    );

    expect(rpcMock).toHaveBeenCalledWith("activate_program", {
      p_program: "p1",
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/setup", "layout");
    expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard");
  });

  it("errors when no id is submitted", async () => {
    const res = await activateProgramAction({}, form({}));

    expect(res.error).toMatch(/could not find that card/i);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("errors when the RPC fails or reports nothing activated", async () => {
    rpcMock.mockResolvedValue({ data: null, error: { code: "XX000" } });
    const failed = await activateProgramAction({}, form({ id: "p1" }));
    expect(failed.error).toMatch(/could not activate/i);

    rpcMock.mockResolvedValue({ data: false, error: null });
    const empty = await activateProgramAction({}, form({ id: "p1" }));
    expect(empty.error).toMatch(/could not activate/i);
  });
});

describe("scheduleRetirementAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireVendorMock.mockResolvedValue({ user: { id: "v1" } });
    rpcMock.mockResolvedValue({ data: true, error: null });
  });

  it("schedules the cutover, revalidates and redirects to the list", async () => {
    await expect(
      scheduleRetirementAction(
        {},
        form({ id: "p1", successor_id: "p2", date: futureDate() }),
      ),
    ).rejects.toThrow("REDIRECT:/setup");

    expect(rpcMock).toHaveBeenCalledWith(
      "schedule_retirement",
      expect.objectContaining({ p_program: "p1", p_successor: "p2" }),
    );
    expect(revalidatePathMock).toHaveBeenCalledWith("/setup", "layout");
  });

  it("requires a successor and a date", async () => {
    const res = await scheduleRetirementAction({}, form({ id: "p1" }));

    expect(res.error).toMatch(/pick a successor/i);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("rejects a date that is not in the future", async () => {
    const res = await scheduleRetirementAction(
      {},
      form({ id: "p1", successor_id: "p2", date: "2000-01-01" }),
    );

    expect(res.error).toMatch(/future/i);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("maps the Pro-only DB error to an upsell message", async () => {
    rpcMock.mockResolvedValue({ data: null, error: { code: "42501" } });

    const res = await scheduleRetirementAction(
      {},
      form({ id: "p1", successor_id: "p2", date: futureDate() }),
    );

    expect(res.error).toMatch(/pro feature/i);
  });

  it("returns a generic error for any other failure", async () => {
    rpcMock.mockResolvedValue({ data: null, error: { code: "XX000" } });

    const res = await scheduleRetirementAction(
      {},
      form({ id: "p1", successor_id: "p2", date: futureDate() }),
    );

    expect(res.error).toMatch(/could not schedule/i);
  });
});
