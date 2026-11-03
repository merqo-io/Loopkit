// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));
vi.mock("@/lib/admin", () => ({ requireAdmin: vi.fn(async () => ({})) }));
vi.mock("@/lib/admin-data", () => ({
  listVendors: vi.fn(async () => [
    {
      vendor_id: "v1",
      email: "pro@example.com",
      program_count: 2,
      is_pro: true,
    },
    {
      vendor_id: "v2",
      email: "free@example.com",
      program_count: 1,
      is_pro: false,
    },
  ]),
}));

import AdminVendorsPage from "./page";

describe("AdminVendorsPage", () => {
  it("renders vendors and tiers", async () => {
    render(await AdminVendorsPage());
    expect(screen.getByText("Vendors")).toBeInTheDocument();
    expect(screen.getByText("pro@example.com")).toBeInTheDocument();
    expect(screen.getAllByText("Pro").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Free").length).toBeGreaterThan(0);
    expect(screen.getByText("free@example.com")).toBeInTheDocument();
  });

  it("shows an empty state when there are no vendors", async () => {
    const { listVendors } = await import("@/lib/admin-data");
    vi.mocked(listVendors).mockResolvedValueOnce([]);
    render(await AdminVendorsPage());
    expect(screen.getByText("No vendors yet.")).toBeInTheDocument();
  });
});
