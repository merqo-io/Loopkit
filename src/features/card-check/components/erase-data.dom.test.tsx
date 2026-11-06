// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { eraseMyDataAction, toastMock } = vi.hoisted(() => ({
  eraseMyDataAction: vi.fn(),
  toastMock: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("../api/consent-actions", () => ({ eraseMyDataAction }));
vi.mock("sonner", () => ({ toast: toastMock }));

import { EraseData } from "./erase-data";

function setup(onErased = vi.fn()) {
  render(
    <EraseData
      vendorId="v1"
      phone="+6591234567"
      shopName="Kaya"
      onErased={onErased}
    />,
  );
  return onErased;
}

describe("EraseData", () => {
  beforeEach(() => vi.clearAllMocks());

  it("needs a confirm step before anything is sent", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(
      screen.getByRole("button", { name: "Delete my data at this shop" }),
    );
    expect(eraseMyDataAction).not.toHaveBeenCalled();
    expect(screen.getByText(/permanently deletes/)).toHaveTextContent("Kaya");
    await user.click(screen.getByRole("button", { name: "Keep my data" }));
    expect(
      screen.getByRole("button", { name: "Delete my data at this shop" }),
    ).toBeInTheDocument();
    expect(eraseMyDataAction).not.toHaveBeenCalled();
  });

  it("erases after confirming and reports success", async () => {
    eraseMyDataAction.mockResolvedValue({ success: true });
    const user = userEvent.setup();
    const onErased = setup();
    await user.click(
      screen.getByRole("button", { name: "Delete my data at this shop" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Yes, delete everything" }),
    );
    await waitFor(() => expect(onErased).toHaveBeenCalled());
    const fd = eraseMyDataAction.mock.calls[0][0] as FormData;
    expect(fd.get("vendor")).toBe("v1");
    expect(fd.get("phone")).toBe("+6591234567");
    expect(toastMock.success).toHaveBeenCalled();
  });

  it("shows the error and stays put on failure", async () => {
    eraseMyDataAction.mockResolvedValue({ success: false, error: "Nope" });
    const user = userEvent.setup();
    const onErased = setup();
    await user.click(
      screen.getByRole("button", { name: "Delete my data at this shop" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Yes, delete everything" }),
    );
    await waitFor(() => expect(toastMock.error).toHaveBeenCalledWith("Nope"));
    expect(onErased).not.toHaveBeenCalled();
  });
});
