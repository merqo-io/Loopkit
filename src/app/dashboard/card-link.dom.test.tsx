// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

const { toastErrorMock, toastSuccessMock } = vi.hoisted(() => ({
  toastErrorMock: vi.fn(),
  toastSuccessMock: vi.fn(),
}));
vi.mock("sonner", () => ({
  toast: { success: toastSuccessMock, error: toastErrorMock },
}));

import { CardLinkActions } from "./card-link";

describe("CardLinkActions", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("tells the vendor to long-press when the clipboard is unavailable", async () => {
    vi.stubGlobal("navigator", {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
    });
    render(<CardLinkActions link="https://x.test/c" />);
    fireEvent.click(screen.getByRole("button", { name: /copy/i }));
    await waitFor(() =>
      expect(toastErrorMock).toHaveBeenCalledWith(
        "Could not copy, long-press the link to copy it.",
      ),
    );
  });
});
