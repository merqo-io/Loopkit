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
    expect(header).toHaveClass("sticky", "py-4");
    expect(screen.getByText("loopkit home")).toBeInTheDocument();
  });

  it("links to the About page", () => {
    render(<Nav />);
    expect(screen.getAllByRole("link", { name: "About" })[0]).toHaveAttribute(
      "href",
      "/about",
    );
  });

  it("links to the FAQ page", () => {
    render(<Nav />);
    expect(screen.getAllByRole("link", { name: "FAQ" })[0]).toHaveAttribute(
      "href",
      "/faq",
    );
  });

  it("opens About and FAQ from the burger menu below sm", async () => {
    const user = userEvent.setup();
    render(<Nav />);
    await user.click(screen.getByRole("button", { name: "Menu" }));
    expect(
      screen.getAllByRole("link", { name: "About" }).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "FAQ" }).length).toBeGreaterThan(
      0,
    );
  });

  it("keeps Dashboard and the account menu visible at every width when signed in", () => {
    render(<Nav authed account={ACCOUNT} />);
    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveClass(
      "hidden",
    );
    expect(
      screen.getByRole("button", { name: /account menu/i }),
    ).toBeInTheDocument();
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

    const trigger = screen.getByRole("button", { name: /account menu/i });
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
      target: screen.getByRole("button", { name: /account menu/i }),
    });
    expect(await screen.findByText(/switch products/i)).toBeInTheDocument();
  });

  it("shows no account menu without an account", () => {
    render(<Nav authed />);
    expect(screen.queryByRole("button", { name: /account|aunty/i })).toBeNull();
  });
});
