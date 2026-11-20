// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { NavAccount } from "./nav-account";
import { submitFeedbackAction } from "@/app/actions/feedback";
import { submitSupportMessageAction } from "@/app/actions/support";

vi.mock("@/app/actions/feedback", () => ({
  submitFeedbackAction: vi.fn(async () => ({ success: true })),
}));
vi.mock("@/app/actions/support", () => ({
  submitSupportMessageAction: vi.fn(async () => ({ success: true })),
}));

type Actions = {
  submitSupport: (i: { category: string; message: string }) => Promise<unknown>;
  submitFeedback: (i: { nps: number; message?: string }) => Promise<unknown>;
};
let captured: { actions: Actions; kit: string; dashboardHref: string };

vi.mock("@merqo/ui", () => ({
  LandingAccountNav: (props: typeof captured) => {
    captured = props;
    return null;
  },
}));

describe("NavAccount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(
      <NavAccount
        user={{ email: "a@b.co", name: "Aunty" }}
        signOut={vi.fn()}
      />,
    );
  });

  it("points the shared nav at the loopkit dashboard", () => {
    expect(captured.kit).toBe("loopkit");
    expect(captured.dashboardHref).toBe("/dashboard");
  });

  it("sends support messages as the action's body field", async () => {
    await captured.actions.submitSupport({ category: "bug", message: "help" });
    expect(submitSupportMessageAction).toHaveBeenCalledWith({
      category: "bug",
      body: "help",
    });
  });

  it("forwards feedback score and message to the feedback action", async () => {
    await captured.actions.submitFeedback({ nps: 9, message: "great" });
    expect(submitFeedbackAction).toHaveBeenCalledWith({
      nps: 9,
      message: "great",
    });
  });
});
