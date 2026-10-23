// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { setMarketingConsentAction, toastMock } = vi.hoisted(() => ({
  setMarketingConsentAction: vi.fn(),
  toastMock: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("../api/actions", () => ({ setMarketingConsentAction }));
vi.mock("sonner", () => ({ toast: toastMock }));

import { MarketingConsentToggle } from "./marketing-consent-toggle";
import { marketingConsentText } from "@/lib/marketing-consent";

const text = marketingConsentText("Kaya");

describe("MarketingConsentToggle", () => {
  beforeEach(() => vi.clearAllMocks());

  it("withdraws when switched off", async () => {
    setMarketingConsentAction.mockResolvedValue({
      success: true,
      granted: false,
    });
    const user = userEvent.setup();
    render(
      <MarketingConsentToggle
        vendorId="v1"
        phone="+6591234567"
        initial={{ granted: true, shopName: "Kaya", saveFailed: false }}
      />,
    );
    expect(screen.getByText(text)).toBeInTheDocument();
    await user.click(screen.getByRole("switch", { name: "Offers by message" }));
    await waitFor(() => expect(screen.getByRole("switch")).not.toBeChecked());
    const fd = setMarketingConsentAction.mock.calls[0][0] as FormData;
    expect(fd.get("granted")).toBe("false");
    expect(fd.get("vendor")).toBe("v1");
    expect(fd.get("marketing_shop")).toBe("Kaya");
    expect(toastMock.success).toHaveBeenCalledWith("Offers turned off.");
  });

  it("shows the wording before opting in and keeps state on failure", async () => {
    setMarketingConsentAction.mockResolvedValue({
      success: false,
      error: "Nope",
    });
    const user = userEvent.setup();
    render(
      <MarketingConsentToggle
        vendorId="v1"
        phone="+6591234567"
        initial={{ granted: false, shopName: "Kaya", saveFailed: true }}
      />,
    );
    expect(
      screen.getByText(`Off. Turn on to agree: ${text}`),
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("could not save");
    await user.click(screen.getByRole("switch"));
    await waitFor(() => expect(toastMock.error).toHaveBeenCalledWith("Nope"));
    expect(screen.getByRole("switch")).not.toBeChecked();
  });

  it("confirms an opt-in", async () => {
    setMarketingConsentAction.mockResolvedValue({
      success: true,
      granted: true,
    });
    const user = userEvent.setup();
    render(
      <MarketingConsentToggle
        vendorId="v1"
        phone="+6591234567"
        initial={{ granted: false, shopName: null, saveFailed: false }}
      />,
    );
    await user.click(screen.getByRole("switch"));
    await waitFor(() =>
      expect(toastMock.success).toHaveBeenCalledWith("Offers turned on."),
    );
  });
});
