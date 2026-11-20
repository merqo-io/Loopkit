// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Nav } from "./nav";
import type { LandingAccount } from "@/lib/landing-account";

vi.mock("@/app/actions/feedback", () => ({ submitFeedbackAction: vi.fn() }));
vi.mock("@/app/actions/support", () => ({
  submitSupportMessageAction: vi.fn(),
}));

const ACCOUNT: LandingAccount = {
  email: "vendor@example.com",
  name: "Aunty Lim",
  avatarUrl: null,
};

describe("Nav", () => {
  it("renders the sticky header matching qkit's px-5 py-4 sizing", () => {
    render(<Nav />);

    const header = screen.getByRole("banner");
    expect(header).toHaveClass("px-5", "py-4", "backdrop-blur-md");
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

  it("hides About and FAQ below sm so the nav keeps its gutter at 375px", () => {
    render(<Nav />);
    for (const name of ["About", "FAQ"]) {
      expect(screen.getByRole("link", { name })).toHaveClass(
        "hidden",
        "sm:inline",
      );
    }
    expect(screen.getByRole("link", { name: "Sign in" })).not.toHaveClass(
      "hidden",
    );
  });

  it("keeps Dashboard and the account menu visible at every width when signed in", () => {
    render(<Nav authed account={ACCOUNT} />);
    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveClass(
      "hidden",
    );
    expect(
      screen.getByRole("button", { name: /account|menu|aunty/i }),
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

    const trigger = screen.getByRole("button", { name: /account|menu|aunty/i });
    await user.pointer({ keys: "[TouchA]", target: trigger });
    expect(
      await screen.findByRole("menuitem", { name: /sign out/i }),
    ).toBeInTheDocument();
  });

  it("labels the account trigger 'Account' when there is no name or email", () => {
    render(<Nav authed account={{ email: "", name: "  ", avatarUrl: null }} />);
    expect(
      screen.getByRole("button", { name: /account/i }),
    ).toBeInTheDocument();
  });
});
