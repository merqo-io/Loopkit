# e2e

## Purpose

Playwright end-to-end smoke tests — runnable with only `pnpm dev` +
`playwright install`, no Supabase provisioning required.

## Contents

- `route-protection.spec.ts` — signed-out route protection: `/dashboard`, `/dashboard/customers`, and `/setup` redirect to `/login`; `/admin` 404s rather than revealing the route exists; `/c` without `?v=` and `/earn` without `?order=` render their no-DB-call fallback copy instead of attempting a lookup. Like `smoke.spec.ts`, runnable without Supabase provisioning — middleware's `getUser()` resolves `user: null` locally with no session cookie, so these gates fire without a live DB.
- `smoke.spec.ts` — public smoke: the landing page renders its hero heading and "Get started" link; `/login` renders its "Continue with Google" button
- `signed-in-smoke.spec.ts`: signed in as an admin vendor with MFA cleared (`aal2`), `renderSmoke` over every dashboard, setup and admin page, failing on a 5xx, error boundary, page error, CSP violation or 404; a password-only (`aal1`) admin session is sent to `/mfa`. It starts the stand-in below itself and runs in its own Playwright project after the others. It sees empty data, not seeded rows.
- `mock-supabase.ts`: not a spec; a small `http` server standing in for GoTrue and PostgREST, plus `signedInCookie()`, which builds the Supabase auth cookie for a signed-in session.

## Parent

[loopkit](../README.md)

- `csp.spec.ts`: in CI (production build) `/login` serves a nonce CSP with nonced scripts and no violations, and `/` keeps the static policy.
