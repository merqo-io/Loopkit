// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { toastErrorMock, toastSuccessMock } = vi.hoisted(() => ({
  toastErrorMock: vi.fn(),
  toastSuccessMock: vi.fn(),
}));
vi.mock("sonner", () => ({
  toast: { success: toastSuccessMock, error: toastErrorMock },
}));

import { CardLinkActions } from "./card-link";

describe("CardLinkActions", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("copies the link on tap and toasts", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    render(<CardLinkActions link="https://x.test/c" />);
    await user.pointer({
      keys: "[TouchA]",
      target: screen.getByRole("button", { name: "Copy link" }),
    });
    await waitFor(() =>
      expect(toastSuccessMock).toHaveBeenCalledWith("Link copied"),
    );
    expect(writeText).toHaveBeenCalledWith("https://x.test/c");
    expect(screen.getByRole("button", { name: "Copied" })).toBeTruthy();
  });

  it("tells the vendor to long-press when the clipboard is unavailable", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("navigator", {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
    });
    render(<CardLinkActions link="https://x.test/c" />);
    await user.pointer({
      keys: "[TouchA]",
      target: screen.getByRole("button", { name: /copy/i }),
    });
    await waitFor(() =>
      expect(toastErrorMock).toHaveBeenCalledWith(
        "Could not copy, long-press the link to copy it.",
      ),
    );
    expect(toastSuccessMock).not.toHaveBeenCalled();
  });
});
