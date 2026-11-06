// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/features/auth", () => ({
  requireVendor: vi.fn(async () => ({
    user: {
      id: "v1",
      email: "vendor@business.sg",
      user_metadata: { display_name: "Vendor Vee", avatar_url: null },
    },
  })),
}));
vi.mock("@/lib/vendor", () => ({
  getVendorProfile: vi.fn(async () => ({ name: "Kopi Corner" })),
}));
vi.mock("@/lib/program", () => ({
  listPrograms: vi.fn(async () => [
    { id: "p1", name: "Coffee Stamps", type: "stamp" },
    { id: "p2", name: "Lucky Wheel", type: "wheel" },
  ]),
  isPro: vi.fn(async () => false),
}));
const qkitMaybeSingle = vi.fn(
  async (): Promise<{
    data: { program_id: string; enabled: boolean } | null;
  }> => ({ data: null }),
);
const notifySettingsMaybeSingle = vi.fn(
  async (): Promise<{
    data: { customer_telegram_notify_enabled: boolean } | null;
  }> => ({ data: null }),
);
vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(async () => ({
    from: vi.fn((table: string) => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle:
            table === "vendor_notify_settings"
              ? notifySettingsMaybeSingle
              : qkitMaybeSingle,
        })),
      })),
    })),
  })),
}));
vi.mock("@/app/dashboard/qkit-earn-settings", () => ({
  QkitEarnSettings: (props: {
    programs: { id: string; name: string }[];
    current: { programId: string; enabled: boolean } | null;
    isPro: boolean;
  }) => (
    <div data-testid="qkit-earn-settings">
      {props.programs.map((p) => p.name).join(",")} / current:
      {props.current ? props.current.programId : "none"} / pro:
      {String(props.isPro)}
    </div>
  ),
}));
vi.mock("@/app/dashboard/customer-notify-settings", () => ({
  CustomerNotifySettings: (props: { current: { enabled: boolean } | null }) => (
    <div data-testid="customer-notify-settings">
      current:{props.current ? String(props.current.enabled) : "none"}
    </div>
  ),
}));
vi.mock("@/lib/merqo-vendor-profile", () => ({
  getOrCreateVendorProfile: vi.fn(async () => ({
    vendor_id: "v1",
    stall_name: "Kopi Corner",
    social_links: { website: "https://kopicorner.com" },
    created_at: "",
    updated_at: "",
  })),
}));
vi.mock("@/app/dashboard/profile/profile-form", () => ({
  ProfileForm: (props: {
    email: string;
    name: string | null;
    socialLinks: Record<string, string>;
  }) => (
    <div data-testid="profile-form">
      {props.email} / {props.name} / {Object.keys(props.socialLinks).join(",")}
    </div>
  ),
}));

import ProfilePage from "./page";

describe("ProfilePage", () => {
  it("renders the heading and passes the vendor's profile and social links to ProfileForm", async () => {
    render(await ProfilePage());

    expect(
      screen.getByRole("heading", { name: "Profile" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("profile-form")).toHaveTextContent(
      "vendor@business.sg / Kopi Corner / website",
    );
  });

  it("keeps the merged settings controls: stamp-only programs for qkit earn and the notify toggle with no row", async () => {
    render(await ProfilePage());

    const qkit = screen.getByTestId("qkit-earn-settings");
    expect(qkit).toHaveTextContent("Coffee Stamps");
    expect(qkit).not.toHaveTextContent("Lucky Wheel");
    expect(qkit).toHaveTextContent("current:none");
    expect(screen.getByTestId("customer-notify-settings")).toHaveTextContent(
      "current:none",
    );
  });

  it("passes saved qkit earn config, Pro state and an explicit notify opt-out through", async () => {
    qkitMaybeSingle.mockResolvedValueOnce({
      data: { program_id: "p1", enabled: true },
    });
    notifySettingsMaybeSingle.mockResolvedValueOnce({
      data: { customer_telegram_notify_enabled: false },
    });
    const { isPro } = await import("@/lib/program");
    vi.mocked(isPro).mockResolvedValueOnce(true);

    render(await ProfilePage());

    expect(screen.getByTestId("qkit-earn-settings")).toHaveTextContent(
      "current:p1 / pro:true",
    );
    expect(screen.getByTestId("customer-notify-settings")).toHaveTextContent(
      "current:false",
    );
  });

  it("degrades to empty social links when the shared merqo profile read fails", async () => {
    const { getOrCreateVendorProfile } =
      await import("@/lib/merqo-vendor-profile");
    vi.mocked(getOrCreateVendorProfile).mockRejectedValueOnce(
      new Error("merqo down"),
    );

    render(await ProfilePage());

    expect(screen.getByTestId("profile-form")).toHaveTextContent(
      "vendor@business.sg / Kopi Corner /",
    );
  });
});
