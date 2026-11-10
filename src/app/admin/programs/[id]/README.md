# [id]

## Purpose

Admin detail view for a single program — stats, recent activity, and
management controls (activate/deactivate the program, remove a customer's
card).

Shared controls and `cn` used by this folder's modules are imported from `@merqo/ui/primitives`; only `badge`, `alert-dialog`, `avatar`, `dropdown-menu`, `popover`, `table`, `toggle` and `toggle-group` remain in `src/components/ui/`.

## Contents

- `loading.tsx` — route skeleton (`AdminLoadingShell`): `aria-busy`, sr-only "Loading" status, header and card placeholders.
- `manage.tsx` — `Manage`: renders `ActiveToggle` (confirm dialog around the `setProgramActive` Server Action) and a card list with `RemoveCardButton` (confirm dialog around the `removeCard` Server Action).
- `page.tsx` — `AdminProgramDetailPage`: loads `getProgramDetail(id)`, computes health/stamps issued/rewards redeemed, renders the program header (`@merqo/ui` `BackButton` to the list, `ProgramHealthBadge` chip), stat tiles, recent activity feed, and the `Manage` panel.

`Badge` comes from `@merqo/ui/primitives`; gold badges use `GOLD_BADGE` from `@/lib/gold-badge`.

## Parent

[programs](../README.md)

Each page exports its own `metadata.title`, shown through the root `loopkit | %s` template. UI copy is plain: no emoji, no em dashes, no contractions in errors.

page test pins the page title.

This folder now imports its shared page and dialog components from `@merqo/ui` (v0.42.1) instead of local copies.
