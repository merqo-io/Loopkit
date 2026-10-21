// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { withdrawMock, toastMock } = vi.hoisted(() => ({
  withdrawMock: vi.fn(),
  toastMock: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("./actions", () => ({ withdrawMarketingConsentAction: withdrawMock }));
vi.mock("sonner", () => ({ toast: toastMock }));

import { MarketingConsentPanel } from "./marketing-consent-panel";

const phone = "+6591234567";
const at = "2026-10-21T02:00:00Z";

async function confirmOptOut() {
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Record opt-out" }));
  await user.click(
    within(screen.getByRole("alertdialog")).getByRole("button", {
      name: "Record opt-out",
    }),
  );
}

describe("MarketingConsentPanel", () => {
  beforeEach(() => vi.clearAllMocks());

  it("explains that only the customer can opt in", () => {
    render(<MarketingConsentPanel phone={phone} status={null} />);
    expect(screen.getByText(/Not opted in/)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Record opt-out" }),
    ).not.toBeInTheDocument();
  });

  it("labels withdrawals the vendor recorded", () => {
    render(
      <MarketingConsentPanel
        phone={phone}
        status={{ granted: false, recordedAt: at, vendorRecorded: true }}
      />,
    );
    expect(screen.getByText(/recorded by you/)).toBeInTheDocument();
  });

  it("labels customer withdrawals without the vendor note", () => {
    render(
      <MarketingConsentPanel
        phone={phone}
        status={{ granted: false, recordedAt: at, vendorRecorded: false }}
      />,
    );
    expect(screen.getByText(/^Opted out on/)).toBeInTheDocument();
    expect(screen.queryByText(/recorded by you/)).not.toBeInTheDocument();
  });

  it("records an opt-out after confirmation", async () => {
    withdrawMock.mockResolvedValue({ success: true });
    render(
      <MarketingConsentPanel
        phone={phone}
        status={{ granted: true, recordedAt: at, vendorRecorded: false }}
      />,
    );
    expect(screen.getByText(/^Opted in on/)).toBeInTheDocument();
    await confirmOptOut();
    await waitFor(() => expect(withdrawMock).toHaveBeenCalledTimes(1));
    expect((withdrawMock.mock.calls[0][0] as FormData).get("phone")).toBe(
      phone,
    );
    expect(toastMock.success).toHaveBeenCalled();
  });

  it("shows the error when recording fails", async () => {
    withdrawMock.mockResolvedValue({ success: false, error: "Nope" });
    render(
      <MarketingConsentPanel
        phone={phone}
        status={{ granted: true, recordedAt: at, vendorRecorded: false }}
      />,
    );
    await confirmOptOut();
    await waitFor(() => expect(toastMock.error).toHaveBeenCalledWith("Nope"));
  });
});
