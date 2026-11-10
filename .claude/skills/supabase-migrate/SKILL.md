---
name: supabase-migrate
description: Apply Supabase schema migrations, with a safety gate; DB types in src/lib/db-types/ are updated by hand.
allowed-tools: "Bash(supabase *), Bash(pnpm *)"
disable-model-invocation: true
---

Loopkit uses Supabase (Postgres + RLS + realtime), not Drizzle. Migrations live in
`supabase/migrations/`.

## Apply schema

**Local (Dockerized dev) — the default for day-to-day work:**

- `supabase migration up` — apply pending migrations to the running local DB.
  (Or `supabase db reset` to rebuild local from `supabase/migrations/` + re-run
  the seed — destructive to local data only.)
- After any schema change, update the matching file in `src/lib/db-types/` by
  hand (see "Types" below). Types are not generated.

**Linked (hosted) project — only when intentionally changing the deployed DB:**

- `supabase db push` — applies pending migrations to the linked project.
- Update `src/lib/db-types/` by hand to match (see "Types" below).

**Without the CLI:**

- Paste the migration SQL into Supabase → SQL Editor → Run.
- Update `src/lib/db-types/` by hand to match (see "Types" below).

## Types

`src/lib/db-types/*.ts` are hand-maintained; `src/lib/types.ts` is only the
barrel that re-exports them, so never write generator output over it. Keep
`Relationships` on each table and the `Views`/`Functions`/`CompositeTypes` keys,
or supabase-js types resolve to `never`.

## Safety gate (before running against a non-local project)

- Confirm the linked project ref is correct: `supabase projects list`.
- RLS must stay enabled on `vendors`, `programs`, `cards` and vendor-scoped support tables — never disable it to
  make a query work; fix the policy or the query instead.
- Verify current function execution grants and customer capability boundaries; do not
  copy ordering or realtime-publication assumptions from sibling kits.
