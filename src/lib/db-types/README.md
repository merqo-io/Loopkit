# db-types

## Purpose

The hand-written mirror of the `loopkit` Supabase schema, split by domain so no
file passes the 500-line limit. `src/lib/types.ts` re-exports it, so callers
keep importing `Database`, `Json` and `SocialLinks` from `@/lib/types`.

## Contents

- `common.ts` — `Json`, `SocialLinks` (shape of the shared `merqo.vendor_profile.social_links` JSONB column, not part of the `loopkit` schema), `MarketingConsentSource`, `EntitlementTier` and `EntitlementStatsWindow`
- `tables-core.ts` — `CoreTables`: Row/Insert/Update for `programs`, `cards`, `stamp_events`, `reward_vouchers`, `admins` and `admin_audit`
- `tables-vendor-customer.ts` — `VendorCustomerTables`: Row/Insert/Update for the vendor, qkit earn, customer, feedback, marketing consent, notify settings, referral and legal-check tables
- `functions.ts` — `DatabaseFunctions`: Args/Returns for every RPC in the `loopkit` schema
- `database.ts` — `Database`: composes the table groups and `DatabaseFunctions` under the `loopkit` schema key (keep that key in sync with `db.schema` in `src/lib/supabase/`)

## Regenerating

The mirror is maintained by hand against `supabase/migrations/`. After a
migration, edit the matching table group or `functions.ts`. If codegen
(`supabase gen types typescript`) is used instead, its output replaces the
bodies of `CoreTables`, `VendorCustomerTables` and `DatabaseFunctions`, split at
the same boundaries; do not overwrite `src/lib/types.ts`, which is only the
re-export.
