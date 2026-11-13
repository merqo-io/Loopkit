# plan

## Purpose

Vendor billing/plan page at `/dashboard/plan`, shows Free vs. Pro feature comparison, program-performance stats and a pointer to the Merqo account, where the plan is changed.

## Contents

- `page.tsx`: `PlanPage` server component; requires a vendor, shows current tier badge (text from a local `TIER_LABEL` map, since `@merqo/ui`'s `tierLabel` is client-only), an optional program-performance blurb (repeat-visit rate, rewards total, `@merqo/ui`'s `ElevatedCard`-wrapped), a plan note with no price ("change plan from your Merqo account", `ElevatedCard`-wrapped), and the shared `@merqo/ui` `PricingLadder` rendered from merqo's catalog. Its root element is `<div className="mx-auto max-w-2xl space-y-7">`, deliberately narrower than the `../layout.tsx` `<main>`'s shared `max-w-7xl` (this single-column billing summary genuinely reads better constrained), so it nests its own `mx-auto`/`max-w-*` wrapper inside that container rather than stretching full-width; the page no longer sets its own padding, which the layout's `<main>` now owns. The catalog comes from `fetchPlanCatalog(merqoBaseUrl())` (merqo `/api/plans`, fetched server-side in parallel with the other reads); the page never stores prices. It renders `<PricingLadder highlight="all_access" showEventPass={false} />`, and when the fetch returns `null` it shows a muted "Prices are unavailable right now" line instead.
- `loading.tsx` — `PlanLoading`, a static skeleton (`role="status"`, `aria-busy`, sr-only label) mirroring the page layout while the route streams in.
- `plan-page.dom.test.tsx`: renders `PlanPage` with a stubbed catalog fetch. The shared `PricingLadder` shows a pilot notice above the plans since `@merqo/ui` v0.46.0 ("Merqo is free during the pilot..."), and the test asserts it renders.

`Badge` comes from `@merqo/ui/primitives`; gold badges use `GOLD_BADGE` from `@/lib/gold-badge`. The merqo base URL comes from `merqoBaseUrl` in `@merqo/ui/kit-api`.

## Parent

[dashboard](../README.md)

Each page exports its own `metadata.title`, shown through the root `loopkit | %s` template. UI copy is plain: no emoji, no em dashes, no contractions in errors.
