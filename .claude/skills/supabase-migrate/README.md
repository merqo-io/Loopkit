# supabase-migrate

## Purpose

Project skill: apply Supabase schema migrations, with an explicit safety gate
before touching the linked (hosted) project. DB types are hand-maintained in
`src/lib/db-types/`, not generated.

## Contents

- `SKILL.md` — skill definition (`disable-model-invocation: true`, explicit-only): local workflow (`supabase migration up` / `supabase db reset`), linked-project workflow (`supabase db push`), a no-CLI fallback (paste SQL into the Supabase SQL editor), a "Types" section (hand-edit `src/lib/db-types/`; `src/lib/types.ts` is only the barrel), and a safety checklist for hosted changes (confirm the linked project ref, keep RLS enabled on core tables, verify function execution grants and customer capability boundaries)

## Connectivity

Single-file skill folder, referenced by AGENTS.md's `/supabase-migrate`
entry as the required path for any schema change — it's the skill-level
enforcement that pairs with the rule "update the types by hand after
every new migration" and the RLS-authorization rule in AGENTS.md. Operates
on `supabase/migrations/` and guides edits to `src/lib/db-types/`, both outside
this folder.

## Parent

[skills](../README.md)
