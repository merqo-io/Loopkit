// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { claimEarnActionMock } = vi.hoisted(() => ({
  claimEarnActionMock: vi.fn(),
}));

vi.mock("./actions", () => ({
  claimEarnAction: claimEarnActionMock,
}));

import { EarnForm } from "./earn-form";

describe("EarnForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the phone/name inputs and submit button with the order id in a hidden field", () => {
    const { container } = render(<EarnForm shopName="Kaya" orderId="o1" />);
    expect(screen.getByLabelText("Your phone number")).toBeInTheDocument();
    expect(screen.getByLabelText("Name (optional)")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Claim stamp" }),
    ).toBeInTheDocument();
    const hidden = container.querySelector('input[name="order"]');
    expect(hidden).toHaveValue("o1");
  });

  it("tells the customer why their phone and name are collected, with a privacy link", () => {
    render(<EarnForm shopName="Kaya" orderId="o1" />);
    expect(
      screen.getByText(
        /We use your phone number and name to track your stamp card and send reward updates\./,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Privacy Policy" }),
    ).toHaveAttribute("href", "/legal/privacy");
  });

  it("shows the vendor name when provided", () => {
    render(
      <EarnForm shopName="Kaya" orderId="o1" vendorName="Kaya Toast Co." />,
    );
    expect(
      screen.getByText("Earn a stamp with Kaya Toast Co.?"),
    ).toBeInTheDocument();
  });

  it("falls back to 'this shop' when no vendor name is given", () => {
    render(<EarnForm shopName="Kaya" orderId="o1" />);
    expect(
      screen.getByText("Earn a stamp with this shop?"),
    ).toBeInTheDocument();
  });

  it("submits phone/name/order, then renders the stamp count on success", async () => {
    claimEarnActionMock.mockResolvedValue({
      status: "success",
      stampCount: 4,
      stampsRequired: 10,
      rewardText: "Free kopi",
    });
    const user = userEvent.setup();
    render(<EarnForm shopName="Kaya" orderId="o1" />);
    await user.type(screen.getByLabelText("Your phone number"), "91234567");
    await user.click(screen.getByRole("button", { name: "Claim stamp" }));

    expect(await screen.findByText("4/10 stamps")).toBeInTheDocument();
    expect(screen.getByText("Free kopi")).toBeInTheDocument();
    expect(claimEarnActionMock).toHaveBeenCalledWith(
      { status: "idle" },
      expect.any(FormData),
    );
  });

  it("shows a role=alert message when the action returns an error", async () => {
    claimEarnActionMock.mockResolvedValue({
      status: "error",
      message: "Enter a valid Singapore phone number.",
    });
    const user = userEvent.setup();
    render(<EarnForm shopName="Kaya" orderId="o1" />);
    await user.type(screen.getByLabelText("Your phone number"), "123");
    await user.click(screen.getByRole("button", { name: "Claim stamp" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Enter a valid Singapore phone number.",
    );
  });

  it("offers an unticked marketing opt-in with the given wording", () => {
    render(<EarnForm shopName="Kaya" orderId="o1" />);
    expect(
      screen.getByRole("checkbox", { name: /^Yes, Kaya may send me offers/ }),
    ).not.toBeChecked();
  });

  it("flags a failed opt-in save next to the stamp result", async () => {
    claimEarnActionMock.mockResolvedValue({
      status: "success",
      stampCount: 1,
      stampsRequired: 10,
      marketingSaveFailed: true,
    });
    const user = userEvent.setup();
    render(<EarnForm shopName="Kaya" orderId="o1" />);
    await user.type(screen.getByLabelText("Your phone number"), "91234567");
    await user.click(screen.getByRole("button", { name: "Claim stamp" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "could not save your offers choice",
    );
  });
});
