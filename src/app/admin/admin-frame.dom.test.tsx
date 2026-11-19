// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { pathnameMock } = vi.hoisted(() => ({ pathnameMock: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname: pathnameMock }));
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} onClick={(e) => e.preventDefault()} {...rest}>
      {children}
    </a>
  ),
}));

import { AdminFrame } from "./admin-frame";

function renderFrame(path: string) {
  pathnameMock.mockReturnValue(path);
  return render(
    <AdminFrame wordmark={<span>LoopKit</span>} actions={<button>Out</button>}>
      <p>page body</p>
    </AdminFrame>,
  );
}

describe("AdminFrame", () => {
  it("renders the four admin tabs, actions and children", () => {
    renderFrame("/admin");
    const nav = screen.getByRole("navigation", { name: "Admin sections" });
    expect(nav.querySelectorAll("a")).toHaveLength(4);
    expect(screen.getByRole("button", { name: "Out" })).toBeTruthy();
    expect(screen.getByText("page body")).toBeTruthy();
  });

  it("marks only Overview current at the admin root", () => {
    renderFrame("/admin");
    expect(
      screen
        .getByRole("link", { name: "Overview" })
        .getAttribute("aria-current"),
    ).toBe("page");
    expect(
      screen
        .getByRole("link", { name: "Vendors" })
        .getAttribute("aria-current"),
    ).toBeNull();
  });

  it("marks the section tab current on a nested page", () => {
    renderFrame("/admin/vendors/abc");
    expect(
      screen
        .getByRole("link", { name: "Vendors" })
        .getAttribute("aria-current"),
    ).toBe("page");
    expect(
      screen
        .getByRole("link", { name: "Overview" })
        .getAttribute("aria-current"),
    ).toBeNull();
  });

  it("targets the tab href on touch", async () => {
    const user = userEvent.setup();
    renderFrame("/admin");
    const link = screen.getByRole("link", { name: "Programs" });
    await user.pointer({ keys: "[TouchA]", target: link });
    expect(link.getAttribute("href")).toBe("/admin/programs");
  });
});
