# merqo

## Purpose

Merqo-facing route handlers — bearer-token-authenticated endpoints the
Merqo platform polls for metrics, vendor status, per-vendor activity,
qkit earn-config, and push-provisions a vendor onto loopkit.

## Contents

- `entitlement/`: `POST` endpoint that receives merqo's pushed subscription entitlement for one vendor and stores it in the `vendor_entitlements` cache that `isPro()` and `loopkit.is_pro` read.
- `metrics/`
- `vendor-activity/` — `GET` endpoint resolving one vendor's programs,
  cards, and stamp/redeem activity by email, for merqo's cross-kit
  `/admin/vendors/[email]` detail view.
- `vendor-provision/` — `POST` endpoint that creates a free-tier `vendors` row (and a default "Starter" stamp program) for a vendor id the Merqo hub is one-click-activating on loopkit.
- `vendor-status/`

## Connectivity

`metrics/`, `vendor-status/`, and `vendor-activity/`
each expose a single GET `route.ts` and share the same constant-time
Bearer-token check — `bearerOk(request, "MERQO_METRICS_SECRET")`
(`@/lib/merqo-auth`) — against `MERQO_METRICS_SECRET`. `vendor-provision/`
instead uses `provisionBearerOk(request)` (a thin `bearerOk` wrapper pinned
to `MERQO_PROVISION_SECRET`, same file) — it's a write capability (creates a
real tenant row), so it's deliberately not gated by the same secret as the
read-only/reporting routes; this mirrors qkit's identical split. `metrics/`
returns platform-wide counts, `vendor-status/` resolves a single vendor's
`{active, plan}` by email, `vendor-activity/` generalizes that same
email-to-vendor lookup (`listAllUsers`, `@/lib/list-all-users`) into a
richer per-vendor payload — `{active, plan, status, metrics, lastActivityAt}`
— computed by the pure `computeVendorActivity` (`@/lib/merqo-vendor-
activity.ts`) from that vendor's own `programs`/`vendor_entitlements`/`cards`/
`stamp_events` rows; `status` is always `null` (loopkit has no per-vendor
health concept yet, only program-level — see
`docs/business/2026-08-26-cross-kit-vendor-activity-design.md`), and a
vendor absent from `auth.users` entirely 404s rather than returning
`active: false`. `entitlement/` shares `vendor-provision/`'s `MERQO_PROVISION_SECRET` bearer check because it is a write; it resolves the email through `listAllUsers`, validates the body with `entitlementPayloadSchema` (`@/lib/merqo-entitlement-contract`) and applies it through the service-role `upsert_vendor_entitlement` function, which ignores a push whose `issued_at` is not newer. `vendor-provision/` calls
`loopkit.provision_default_program` (idempotent, keyed on whether the
vendor already has any program row) via `supabase.rpc(...)` on the
service-role client. `vendor-provision/` is the only one of the six that
mutates a vendor's access on merqo's behalf, so it's also the only one that
calls `recordAudit` (`@/lib/admin-audit`) — attributed to the provisioned
vendor's own id with `detail.actor: "merqo_system"`, since there's no
signed-in admin behind this call.

## Parent

[api](../README.md)
