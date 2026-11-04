# plan

## Purpose

Vendor billing/plan page at `/dashboard/plan`, shows Free vs. Pro feature comparison, program-performance stats and a pointer to the Merqo account, where the plan is changed.

## Contents

- `page.tsx`: `PlanPage` server component; requires a vendor, shows current tier badge (text from a local `TIER_LABEL` map, since `@merqo/ui`'s `tierLabel` is client-only), an optional program-performance blurb (repeat-visit rate, rewards total, `@merqo/ui`'s `ElevatedCard`-wrapped), a plan note with no price ("change plan from your Merqo account", `ElevatedCard`-wrapped), and the shared `@merqo/ui` `PricingLadder` rendered from merqo's catalog. Its root element is `<div className="mx-auto max-w-2xl space-y-7">`, deliberately narrower than the `../layout.tsx` `<main>`'s shared `max-w-7xl` (this single-column billing summary genuinely reads better constrained), so it nests its own `mx-auto`/`max-w-*` wrapper inside that container rather than stretching full-width; the page no longer sets its own padding, which the layout's `<main>` now owns. The catalog comes from `fetchPlanCatalog(merqoBaseUrl())` (merqo `/api/plans`, fetched server-side in parallel with the other reads); the page never stores prices. It renders `<PricingLadder highlight="all_access" showEventPass={false} />`, and when the fetch returns `null` it shows a muted "Prices are unavailable right now" line instead.

## Parent

[dashboard](../README.md)
