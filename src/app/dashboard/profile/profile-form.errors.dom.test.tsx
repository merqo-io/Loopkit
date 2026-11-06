// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { updateUserMock, toastErrorMock } = vi.hoisted(() => ({
  updateUserMock: vi.fn(),
  toastErrorMock: vi.fn(),
}));

vi.mock("./actions", () => ({
  updateStallNameAction: vi.fn(),
  updatePasswordAction: vi.fn(),
  updateSocialLinksAction: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: toastErrorMock },
}));
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ auth: { updateUser: updateUserMock } }),
}));

import { ProfileForm } from "./profile-form";

function renderForm() {
  render(
    <ProfileForm
      vendorId="v1"
      email="a@b.com"
      name="Kopi Corner"
      avatarUrl={null}
      displayName=""
      socialLinks={{}}
    />,
  );
}

describe("ProfileForm error copy", () => {
  beforeEach(() => {
    updateUserMock.mockReset();
    toastErrorMock.mockReset();
  });

  it("says the passwords do not match", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByLabelText("New password"), "abcdefgh1");
    await user.type(screen.getByLabelText("Confirm new password"), "different");
    await user.click(screen.getByRole("button", { name: "Update password" }));
    expect(toastErrorMock).toHaveBeenCalledWith("Passwords do not match.");
  });

  it("says it could not save the display name", async () => {
    updateUserMock.mockResolvedValue({ error: { message: "boom" } });
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByLabelText("Display name"), "Aisha");
    const section = screen.getByLabelText("Display name").closest("section")!;
    await user.click(within(section).getByRole("button", { name: "Save" }));
    await waitFor(() =>
      expect(toastErrorMock).toHaveBeenCalledWith(
        "Could not save your display name. Try again.",
      ),
    );
  });
});
