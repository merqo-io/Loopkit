# Fresh-eyes close-out sweep

Phase 8 close-out (roadmap X-14, X-15, X-16, X-20), cut from `staging` at
`f513f9d`. Mechanical changes only; anything needing a product, copy or schema
decision is listed under Needs owner.

## knip

- Command: `pnpm dlx knip@6.44.2 --no-progress` (version pinned; not a project
  dependency).
- Before: 5 unused files, 2 unused devDependencies, 2 unlisted dependencies,
  15 unused exports, 11 unused exported types (35 findings).
- After: clean (0 findings).
- Config: `knip.json` with two narrow entries.
  - `ignore: [".claude/**"]` because the harness hooks are not app code and
    knip picked up `user-prompt-guard.cjs` twice.
  - `ignoreDependencies: ["server-only"]` because it is a Next.js virtual
    package that is imported in `src/lib/customer-proof.ts` and
    `src/lib/shop-name.ts` but intentionally not in `package.json`.
- Removed: the `avatar`, `dropdown-menu` and `table` UI primitives, `PopoverAnchor`,
  the `Toggle` wrapper (the `toggleVariants` export stays, `toggle-group.tsx` uses
  it), `wheelStrategy`/`scratchStrategy` and `EntitlementPayload` (grepped across
  src, e2e, scripts, supabase: no consumer), `MS_PER_HOUR` (and its `utils.ts`
  re-export), the `MechanicStats` re-export from the `stats.ts` barrel, and the
  `@eslint/eslintrc` and `@tailwindcss/typography` devDependencies (lockfile
  updated; no `FlatCompat`, `@plugin` or `prose` class in the repo).
- Un-exported (still used inside their own file): `AlertDialogPortal`,
  `AlertDialogOverlay`, `CUSTOMER_SORTS`, `CUSTOMER_PAGE_SIZE`,
  `resolveStampConfig`, `resolvePlantState`, `bloomThreshold`,
  `OVERVIEW_COHORTS`, `THEME_SCRIPT_HASH`, and the types `PlantView`,
  `ChanceView`, `StyleOption`, `ActivityTypeFilter`, `CustomerCardRow`,
  `PlantStage`, `PointsCatalogItem`, `VendorActivityMetric`, `MetricsPayload`.
- No database row or table type was removed. `src/lib/db-types/` had no finding.

## Duplicates

Inside this repo:

- `src/app/legal/accept/actions.ts` has local `clientIp` and `merqoBaseUrl`
  helpers beside `src/lib/rate-limit.ts` `clientIp` and `legal-gate.ts`, which
  reads `MERQO_BASE_URL` too. They differ on purpose-looking details (the local
  `clientIp` reads the first hop of `x-forwarded-for` and falls back to
  `"unknown"`; the rate limiter trusts only Vercel-set headers). Not merged, see
  Needs owner.
- `MERQO_BASE_URL` is read directly in `merqo-customer-notify.ts` (twice),
  `legal-gate.ts` and `legal/accept/actions.ts` with no shared accessor. Candidate.

Likely duplicated across sibling kits (candidates only, nothing extracted):
`clientIp`, rate-limit RPC store, `merqoBaseUrl` default (`https://www.merqo.io`),
the Telegram notify wrapper, and the merqo contract schemas.

## Server vs client components

64 `.tsx` files carry `"use client"`. All inspected ones use hooks, event
handlers or browser APIs, or wrap `@merqo/ui` pieces that are all client
(see the usage notes in `src/components/README.md`). `src/components/ui/popover.tsx`
and `toggle.tsx` / `toggle-group.tsx` are Radix wrappers that need it.
No file was changed.

## Sequential awaits

Reviewed every `= await` in `src/app/**/{page,layout}.tsx`. Most pages already
use `Promise.all`. Left as is:

- `src/app/setup/page.tsx`: `isPro()` runs after `loadSetupContext()` so a vendor
  with no program is redirected without the extra call.
- `src/app/c/page.tsx`: `getShopName` depends on the program list being non-empty.
- `src/app/setup/[programId]/edit/page.tsx`: `programCardCount` needs `program.id`.
- `src/app/dashboard/counter/page.tsx`: `activeCardCountsByProgram` needs `programs`.

No truly independent waterfall was found, so no await was changed.

## loading.tsx

Added: `src/app/mfa/loading.tsx` and `src/app/setup/loading.tsx` (one skeleton
covers `/setup`, `/setup/new` and `/setup/[programId]/{edit,migrate,prep,schedule}`,
which all render `SetupShell`). Each keeps `<main>` as the landmark and puts
`role="status"`, `aria-busy` and an sr-only "Loading" on an inner element. Each has
a render test.

Not needed:

- `src/app/c/page.tsx` and `src/app/earn/page.tsx`: customer pages behind a QR scan
  that make a single fast RPC; a skeleton would flash for a fraction of a second
  and the title depends on that data.
- `src/app/page.tsx` and `src/app/about/page.tsx`: public marketing pages, per brief.
- `src/app/legal/accept`: awaits only `searchParams`.

Recorded, not fixed: `src/app/dashboard/layout.tsx:18` and
`src/app/admin/layout.tsx:16` await data (vendor and admin gate) that their own
segment's `loading.tsx` does not cover, because a layout's data cannot be covered
by the loading file in the same segment.

## Bundle size

`pnpm build` in this Next version prints no First Load JS column, so there is no
per-route size to report. `.next` was not inspected.

## Coverage

`pnpm exec vitest --run --coverage --coverage.reportsDirectory=<outside repo>`:
244 files, 1675 tests, all passing. Totals: 90.3% statements, 85.07% branches,
89.47% functions, 91.71% lines.

No file under `src/lib` is below 70% lines. Business-logic files under 70% lines
outside `src/lib` (server actions and route glue, mostly exercised by e2e):
`src/app/admin/actions.ts` (10.34%), a dashboard settings actions file (40%), the
referrals helper (16.66%), `src/app/admin/programs/[id]/page.tsx` (12.5%). All
`page.tsx`, `layout.tsx` and icon files report 0% because pages are not unit-tested.

## templatecentral:standards

Not available to this builder, so the code-standards, validation-patterns and
drift-check passes were not run. Data-layer drift against templateCentral is
expected (see `templatecentral-adoption-log.md`).

## Fixed in this PR

- Dead code and unused dependencies listed under knip; `knip.json` added.
- Loading skeletons for `/mfa` and `/setup` with tests.
- CHANGELOG stamped `0.5.0` with an empty `[Unreleased]`; `package.json` version
  `0.5.0` (it was `0.4.1`, one behind the CHANGELOG). No git tag.
- Root README test count refreshed.

## Deferred

- The sentence listing which primitives remain in `src/components/ui/` is
  repeated in about 25 folder READMEs and still names the removed `avatar`,
  `dropdown-menu` and `table`. A single sweep edit is cheaper than patching each.
- A shared `merqoBaseUrl()` accessor for the four `MERQO_BASE_URL` reads.
- Tests for the low-coverage server actions listed under Coverage.
- A knip step in CI (needs a dependency; out of scope).

## Needs owner

- Whether `legal/accept/actions.ts` should use the rate limiter's trusted-header
  `clientIp`. It records the IP on an acceptance audit row, so changing which
  header is trusted changes recorded data.
- Whether to cover `dashboard/layout.tsx` and `admin/layout.tsx` data waits with a
  Suspense boundary (a layout and UX decision).
