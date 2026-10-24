import { test, expect } from "@playwright/test";
import { signedInCookie } from "./mock-supabase";

// Signed in as an admin vendor with MFA cleared, against the Supabase stand-in:
// every dashboard and admin page must render without a 5xx, an error boundary,
// a page error or a CSP violation.
test.describe("signed-in render smoke", () => {
  test.beforeEach(() => {
    // Intentional, conditional skip, checked per test: global-setup.ts sets the flag after files load.
    test.skip(
      process.env.E2E_SUPABASE_MOCK !== "1",
      "needs the Supabase stand-in (global-setup.ts)",
    );
  });

  test("every dashboard and admin page renders", async ({
    context,
    page,
    baseURL,
  }) => {
    const { name, value } = signedInCookie(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321",
    );
    await context.addCookies([
      { name, value, url: baseURL ?? "http://localhost:3000" },
    ]);

    // A 404 is a gate saying no, not a page rendering.
    const notFound: string[] = [];
    page.on("response", (response) => {
      if (
        response.request().isNavigationRequest() &&
        response.status() === 404
      ) {
        notFound.push(response.url());
      }
    });

    // Dynamic: Playwright loads specs as CJS and the helper is ESM-only.
    const { renderSmoke } = await import("@merqo/ui/testing");
    const failures = await renderSmoke(page, [
      "/dashboard",
      "/dashboard/activity",
      "/dashboard/counter",
      "/dashboard/customers",
      "/dashboard/plan",
      "/dashboard/profile",
      "/dashboard/redeem-voucher",
      "/dashboard/referrals",
      "/dashboard/settings",
      "/dashboard/stats",
      "/setup",
      "/admin",
      "/admin/activity",
      "/admin/programs",
      "/admin/vendors",
    ]);

    expect(failures).toEqual([]);
    expect(notFound).toEqual([]);
  });

  test("a password-only admin session is sent to /mfa", async ({
    context,
    page,
    baseURL,
  }) => {
    const { name, value } = signedInCookie(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321",
    );
    const aal1 = value.replace(/^base64-/, "");
    const session = JSON.parse(Buffer.from(aal1, "base64url").toString());
    const [head, payload, sig] = session.access_token.split(".");
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString());
    claims.aal = "aal1";
    session.access_token = [
      head,
      Buffer.from(JSON.stringify(claims)).toString("base64url"),
      sig,
    ].join(".");
    await context.addCookies([
      {
        name,
        value: `base64-${Buffer.from(JSON.stringify(session)).toString("base64url")}`,
        url: baseURL ?? "http://localhost:3000",
      },
    ]);

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/mfa/);
  });
});
