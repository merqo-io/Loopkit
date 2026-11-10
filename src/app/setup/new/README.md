# setup/new

## Purpose

`/setup/new`: create a program. Shows the create form when the plan allows another active program, the Pro upsell at the limit, and first-run copy for a vendor with no programs.

## Contents

- `page.tsx` - server page; picks create vs upsell with `resolveNewView` from `../setup-view.ts`.

`ProLock` comes from `@merqo/ui` with `href="/dashboard/plan"`.

The free-plan `ProLock` passes `LinkComponent={Link}` so the upgrade pill keeps client navigation and prefetch.
