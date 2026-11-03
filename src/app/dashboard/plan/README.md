# plan

## Purpose

Vendor billing/plan page at `/dashboard/plan`, shows Free vs. Pro feature comparison, program-performance stats and a pointer to the Merqo account, where the plan is changed.

## Contents

- `page.tsx`: `PlanPage` server component; requires a vendor, shows current tier badge, an optional program-performance blurb (repeat-visit rate, rewards total, `@merqo/ui`'s `ElevatedCard`-wrapped), a plan note with no price ("change plan from your Merqo account", `ElevatedCard`-wrapped), and a Free/Pro feature comparison table. Its root element is `<div className="mx-auto max-w-2xl space-y-7">`, deliberately narrower than the `../layout.tsx` `<main>`'s shared `max-w-7xl` (this single-column billing summary genuinely reads better constrained), so it nests its own `mx-auto`/`max-w-*` wrapper inside that container rather than stretching full-width; the page no longer sets its own padding, which the layout's `<main>` now owns. The feature comparison grid renders through `@merqo/ui`'s shared `PlanComparisonTable` (2 tiers: `{key:"free",label:"Free"}`/`{key:"pro",label:"Pro"}`), the local `FEATURES` const array stays here, mapped into the component's `rows` prop; only the rendering (formerly a local grid + local `Cell` helper) moved. The component's check icon uses the `text-status-ready` Tailwind class, mapped in `src/app/globals.css` to `--primary` since loopkit has no order-status palette of its own to supply that token.

## Parent

[dashboard](../README.md)
