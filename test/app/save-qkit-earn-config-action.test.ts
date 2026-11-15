import { describe, it, expect, vi, beforeEach } from "vitest";

const { requireVendorMock, isProMock, upsertMock } = vi.hoisted(() => ({
  requireVendorMock: vi.fn(),
  isProMock: vi.fn(),
  upsertMock: vi.fn(),
}));

vi.mock("@/features/auth", () => ({ requireVendor: requireVendorMock }));
vi.mock("@/lib/program", () => ({ isPro: isProMock }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(async () => ({
    from: vi.fn(() => ({ upsert: upsertMock })),
  })),
}));

import { saveQkitEarnConfigAction } from "@/app/dashboard/settings-actions";

function form(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

describe("saveQkitEarnConfigAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireVendorMock.mockResolvedValue({ user: { id: "v1" } });
    upsertMock.mockResolvedValue({ error: null });
  });

  it("states the plan limit without asking the vendor to upgrade", async () => {
    isProMock.mockResolvedValue(false);

    const res = await saveQkitEarnConfigAction(
      form({ enabled: "on", program_id: "p1" }),
    );

    expect(res).toEqual({
      success: false,
      error: "Qkit stamp earning is not on your plan.",
    });
    expect(upsertMock).not.toHaveBeenCalled();
  });
});
