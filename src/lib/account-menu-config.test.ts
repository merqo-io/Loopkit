import { describe, it, expect, vi, beforeEach } from "vitest";

const { supportMock, feedbackMock } = vi.hoisted(() => ({
  supportMock: vi.fn(),
  feedbackMock: vi.fn(),
}));

vi.mock("@/app/actions/support", () => ({
  submitSupportMessageAction: supportMock,
}));
vi.mock("@/app/actions/feedback", () => ({
  submitFeedbackAction: feedbackMock,
}));

import {
  ACCOUNT_MENU_HELP,
  submitAccountFeedback,
} from "./account-menu-config";

beforeEach(() => {
  supportMock.mockReset().mockResolvedValue({ success: true });
  feedbackMock.mockReset().mockResolvedValue({ success: true });
});

describe("ACCOUNT_MENU_HELP", () => {
  it("maps message to body and falls back to the other category", async () => {
    await ACCOUNT_MENU_HELP.onSubmit({ message: "hi", category: "nope" });
    expect(supportMock).toHaveBeenCalledWith({ category: "other", body: "hi" });
  });

  it("throws the action error on failure", async () => {
    supportMock.mockResolvedValue({ success: false, error: "bad" });
    await expect(ACCOUNT_MENU_HELP.onSubmit({ message: "hi" })).rejects.toThrow(
      "bad",
    );
  });
});

describe("submitAccountFeedback", () => {
  it("defaults a missing nps to 0", async () => {
    await submitAccountFeedback({ message: "ok" });
    expect(feedbackMock).toHaveBeenCalledWith({ nps: 0, message: "ok" });
  });

  it("throws the action error on failure", async () => {
    feedbackMock.mockResolvedValue({ success: false, error: "no" });
    await expect(submitAccountFeedback({ message: "x" })).rejects.toThrow("no");
  });
});
