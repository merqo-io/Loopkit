// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("not-found");
  }),
  useRouter: () => ({ refresh: vi.fn() }),
}));
vi.mock("@/lib/admin", () => ({ requireAdmin: vi.fn(async () => ({})) }));
vi.mock("@/lib/admin-data", () => ({ getProgramDetail: vi.fn() }));

import { metadata } from "./page";

describe("AdminProgramDetailPage", () => {
  it("sets a page title", () => {
    expect(metadata.title).toBe("Program");
  });
});
