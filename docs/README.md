# docs

## Purpose

Non-code documentation: the project's non-negotiable architecture
invariants, the Supabase/Vercel/merqo deploy runbook, and the full
spec/plan development history.

## Contents

- `CONSTITUTION.md` — non-negotiable architecture invariants for loopkit (Supabase/RLS divergence from stock templateCentral, schema ownership, etc.) plus the enumerated list of protected governance files (agent instruction files, harness config/hooks, `.husky/*`/`.gitleaks.toml` git-hook enforcement, CI pipeline definitions); overrides `AGENTS.md`/skills on conflict, changes require an explicit Human Approval Override in the PR
- `DEPLOY.md`: deploy & attach runbook: apply migrations to the shared Supabase project (A), deploy to Vercel (B; only `main` auto-deploys, PR previews are on demand via the `vercel` CLI), attach to merqo (C), plus a Staging section: loopkit's `Preview` values on the shared staging Supabase project and the staging-first gate for PRs that add a migration; its apply-in-order migration list is kept in sync with `supabase/migrations/` (currently through `0070`, whose `0066` to `0070` replace the `vendor_pro` grant step with the cache of merqo's pushed entitlement; disposable database CI passes, while production rollout and multi-session isolation remain pending) Repo links point at the `merqo-io` GitHub organization.
- `FILE-LAYOUT.md` — source map (directory-by-directory, including the split dashboard actions, `src/lib/db-types/` and `stats-*` modules) moved out of `AGENTS.md`; lists the `/setup` programs list and its `new` and `[programId]/{edit,migrate,prep,schedule}` sub-routes
- `DATA-MODEL.md` — Telegram/notify, referral and `admin_audit` retention notes moved out of `AGENTS.md`
- `superpowers/`

## Parent

[loopkit](../README.md)
