# File layout

Source map for loopkit, moved out of `AGENTS.md` so it is not loaded into every
agent session. Paths are repo-relative.

```
src/app/dashboard/      — vendor console (programs, cards, stats)
src/app/c/              — customer-facing card view (QR entry point)
src/app/admin/          — Merqo-team admin console
src/app/setup/          — vendor onboarding
src/app/login/, auth/   — auth pages
src/app/api/            — route handlers (merqo metrics, etc.)
src/proxy.ts            — Supabase session refresh + /dashboard,/setup guard (Next 16)
src/lib/engine/         — stamp/points/lucky-reward core logic
src/lib/program.ts      — program CRUD + rules
src/lib/cards.ts        — customer card state
src/lib/loyalty.ts      — stamping/redemption flow
src/lib/stats.ts        — vendor-facing metrics
src/lib/merqo-customer-notify.ts — notifyCustomerByPhone/notifyVendor: kit → merqo HTTP calls (customer Telegram reuse + vendor alerts via merqo's shared bot)
src/lib/merqo-vendor-status.ts — reports status/metrics to merqo over HTTP
src/lib/supabase/       — browser / server / service clients + middleware helper
src/lib/types.ts        — DB types (mirror of supabase/migrations)
src/lib/utils.ts        — cn() + shared formatting helpers
src/components/         — wheel, scratch-card, flame-layers, cup, points-bar, stamp-dots, etc.
src/components/ui/      — shadcn primitives (CLI-managed, do not hand-edit)
supabase/migrations/    — SQL schema + RLS (ordered chain through 0059)
```

Domain code (schema, programs/cards/stamps, auth pages, admin) is implemented,
per the v1 scope in `superpowers/specs/2026-07-07-loopkit-core-design.md`
and `superpowers/plans/2026-07-07-loopkit-core.md`. Later work is tracked
as further specs/plans in the same `superpowers/{specs,plans}/` dirs (v2
phases, workspace phases, etc.).

This repo was seeded as a harness from the sibling project `qkit` (same
templateCentral Supabase variant, same shared Supabase project, different
schema).
