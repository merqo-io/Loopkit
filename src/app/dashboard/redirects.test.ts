import { describe, expect, it, vi } from "vitest";

const redirectMock = vi.hoisted(() =>
  vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
);
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

import SettingsRedirectPage from "./settings/page";
import ReferralsRedirectPage from "./referrals/page";

describe("moved dashboard routes", () => {
  it("sends /dashboard/settings to the integrations block on Profile", () => {
    expect(() => SettingsRedirectPage()).toThrow(
      "REDIRECT:/dashboard/profile#integrations",
    );
  });

  it("sends /dashboard/referrals to the Referrals page under Customers", () => {
    expect(() => ReferralsRedirectPage()).toThrow(
      "REDIRECT:/dashboard/customers/referrals",
    );
  });
});
