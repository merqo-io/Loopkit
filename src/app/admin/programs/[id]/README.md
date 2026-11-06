# [id]

## Purpose

Admin detail view for a single program — stats, recent activity, and
management controls (activate/deactivate the program, remove a customer's
card).

## Contents

- `loading.tsx` — route skeleton (`AdminLoadingShell`): `aria-busy`, sr-only "Loading" status, header and card placeholders.
- `manage.tsx` — `Manage`: renders `ActiveToggle` (confirm dialog around the `setProgramActive` Server Action) and a card list with `RemoveCardButton` (confirm dialog around the `removeCard` Server Action).
- `page.tsx` — `AdminProgramDetailPage`: loads `getProgramDetail(id)`, computes health/stamps issued/rewards redeemed, renders the program header (`@merqo/ui` `BackButton` to the list, `ProgramHealthBadge` chip), stat tiles, recent activity feed, and the `Manage` panel.

## Parent

[programs](../README.md)

Each page exports its own `metadata.title`, shown through the root `loopkit | %s` template. UI copy is plain: no emoji, no em dashes, no contractions in errors.
