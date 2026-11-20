// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Nav } from "./nav";
import type { NavUser } from "@merqo/ui";

vi.mock("@/app/actions/feedback", () => ({ submitFeedbackAction: vi.fn() }));
vi.mock("@/app/actions/support", () => ({
  submitSupportMessageAction: vi.fn(),
}));

const ACCOUNT: NavUser = {
  email: "vendor@example.com",
  name: "Aunty Lim",
};

describe("Nav", () => {
  it("renders the shared sticky header", () => {
    render(<Nav />);

    const header = screen.getByRole("banner");
    expect(header).toHaveClass("sticky", "py-4", "backdrop-blur-md");
    expect(screen.getByText("loopkit home")).toBeInTheDocument();
  });

  it("links to the About page", () => {
    render(<Nav />);
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute(
      "href",
      "/about",
    );
  });

  it("links to the FAQ page", () => {
    render(<Nav />);
    expect(screen.getByRole("link", { name: "FAQ" })).toHaveAttribute(
      "href",
      "/faq",
    );
  });

  it("shows Sign in and no account menu when signed out", () => {
    render(<Nav />);
    expect(screen.getByRole("link", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Dashboard" })).toBeNull();
  });

  it("signed in: Dashboard link plus an account menu with Sign out by touch", async () => {
    const user = userEvent.setup();
    render(<Nav authed account={ACCOUNT} />);

    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "href",
      "/dashboard",
    );
    expect(screen.queryByRole("link", { name: "Sign in" })).toBeNull();

    const trigger = screen.getByRole("button", { name: /account|menu|aunty/i });
    await user.pointer({ keys: "[TouchA]", target: trigger });
    expect(
      await screen.findByRole("menuitem", { name: /sign out/i }),
    ).toBeInTheDocument();
  });

  it("shows the Switch products entry in the account menu", async () => {
    const user = userEvent.setup();
    render(<Nav authed account={ACCOUNT} />);
    await user.pointer({
      keys: "[TouchA]",
      target: screen.getByRole("button", { name: /account|menu|aunty/i }),
    });
    expect(await screen.findByText(/switch products/i)).toBeInTheDocument();
  });

  it("shows no account menu without an account", () => {
    render(<Nav authed />);
    expect(screen.queryByRole("button", { name: /account|aunty/i })).toBeNull();
  });
});
