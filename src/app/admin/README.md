# admin

## Purpose

Merqo-team internal admin console — the gated layout, shared nav, and shared
figure/badge helpers used by the overview, programs, and vendors screens.

Shared controls and `cn` used by this folder's modules are imported from `@merqo/ui/primitives`; only `badge`, `alert-dialog`, `avatar`, `dropdown-menu`, `popover`, `table`, `toggle` and `toggle-group` remain in `src/components/ui/`.

## Contents

- `admin-page-header.tsx` — `AdminPageHeader`: the admin pages' title row, a thin wrapper over the `@merqo/ui` `PageHeader` (eyebrow "Internal").
- `actions.ts`: Server Actions (all admin-only via `requireAdmin()`): `setProgramActive`, `removeCard`, each writing via the service-role client and appending an `admin_audit` row via `recordAudit` (`@/lib/admin-audit`, shared with `vendor-provision/route.ts`).
- `activity/` — `AdminActivityPage`: read-only viewer over `admin_audit` (`listAdminAudit`, `@/lib/admin-data`), rendered via `@merqo/ui`'s `AuditLogTable` with a `formatAction` map for the real action strings `actions.ts`/`vendor-provision/route.ts` write, and the `detail.actor === "merqo_system"` sentinel surfaced as "Merqo (system)" instead of a raw vendor id.
- `admin-nav.tsx` — `AdminNav` client component: the Overview/Programs/Vendors/Activity tab bar, highlighting the active section by path.
- `health-badge.tsx` — `ProgramHealthBadge`: `ProgramHealth` rendered through `@merqo/ui`'s `StatusBadge`, shared by the programs list and the program detail header.
- `layout.tsx` — `AdminLayout`: gates every `/admin` route with `requireAdmin()`, renders the header (wordmark, Admin badge, sign-out) and `AdminNav`.
- `loading.tsx` / `loading-skeleton.tsx` — route skeleton for the overview (and `AdminLoadingShell`, shared by each admin route's own `loading.tsx`): `aria-busy`, an sr-only "Loading" status, header, optional stat tiles and one card.
- `page.tsx`: `AdminOverviewPage`: platform-wide totals (programs, customers, stamps, rewards), and a recent cross-shop activity feed, wrapped in `@merqo/ui`'s `ElevatedCard`.
- `programs/`
- `vendors/`

## Connectivity

`programs/`, `vendors/`, and `activity/` are the admin sections linked from
`admin-nav.tsx`'s tab bar; all render inside `layout.tsx`'s gated shell.
`programs/`'s and `vendors/`'s page/detail components pull shared pieces from
this folder — `StatCard` from `@merqo/ui` for figure tiles, `health-badge.tsx` for health
badges, and `actions.ts` for the Server Actions their client components call
(`Manage` in `programs/[id]`). `activity/` reads the audit trail those same
actions write via `recordAudit`.

## Reuse and ownership

`admin-page-header.tsx` supplies the common title and description chrome across admin list pages. Figure tiles are `@merqo/ui` `StatCard` with `reverse` and a mono tabular value. Admin pages share the dashboard's `max-w-7xl px-5 py-7` container, and empty lists use `@merqo/ui` `EmptyState`.

## Parent

[app](../README.md)

Admin writes patch only the intended owned profile fields and preserve unrelated shared Merqo profile data. Authorization checks precede service-role mutations.

Every page and action is gated by `requireAdmin()`, which needs `aal2`; a password-only session is redirected to `/mfa`. Service-client imports carry an eslint-disable reason.

Each page exports its own `metadata.title`, shown through the root `loopkit | %s` template. UI copy is plain: no emoji, no em dashes, no contractions in errors.
