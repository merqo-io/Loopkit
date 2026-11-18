// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

const { usePathname } = vi.hoisted(() => ({ usePathname: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname }));

import { WarmWash } from "./warm-wash";

function wash(path: string) {
  usePathname.mockReturnValue(path);
  const { container, unmount } = render(<WarmWash />);
  const found = container.querySelector(".warm-wash");
  unmount();
  return found;
}

describe("WarmWash", () => {
  it.each([
    "/",
    "/about",
    "/faq",
    "/faq/",
    "/legal/privacy",
    "/legal/terms",
    "/earn",
    "/c",
  ])("is absent on public page %s", (path) => {
    expect(wash(path)).toBeNull();
  });

  it.each([
    "/dashboard",
    "/dashboard/stats",
    "/setup",
    "/setup/abc/edit",
    "/login",
    "/reset-password",
    "/mfa",
    "/auth/confirm",
    "/legal/accept",
    "/admin",
  ])("is present on %s", (path) => {
    expect(wash(path)).not.toBeNull();
  });
});
