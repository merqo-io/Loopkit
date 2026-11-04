<!-- templateCentral: nextjs@7.2.2 (Supabase variant — shared project, schema per kit) -->

# AGENTS.md — loopkit

> STOP — This project diverges from the stock templateCentral Next.js stack on
> the data layer only. Auth/DB/realtime are **Supabase** (`@supabase/ssr`), not
> better-auth + Drizzle. Authorization is enforced in Postgres via **RLS**, not
> an app repository layer. Runtime matches tc: Next 16, route protection in
> `src/proxy.ts`, and `cookies()`/`headers()`/`params`/`searchParams` are async.

## What loopkit is

Standalone digital stamp-card loyalty for SG small vendors; a Merqo kit; owns
the `loopkit` schema in the shared Supabase project; reports metrics to merqo
over HTTP.

## Stack

Next.js 16 · App Router · Turbopack · TypeScript strict · Tailwind v4 · shadcn/ui
(new-york) · React Hook Form · Zod · Supabase (`@supabase/ssr`) · Vitest ·
pnpm 11 · Node ≥24.22.1 · deploy target: Vercel

## Commands

```bash
pnpm dev          # dev server — http://localhost:3000
pnpm build        # production build
pnpm test         # run test suite (vitest)
pnpm test:mutation # stryker mutation testing (scoped to src/lib; advisory)
pnpm test:e2e     # playwright e2e smoke (needs local Supabase up)
pnpm check        # prettier --check + eslint + tsc --noEmit
pnpm format       # prettier --write
```

## File Layout

Source map: `docs/FILE-LAYOUT.md`. Domain code is implemented per the v1 scope in
`docs/superpowers/specs/2026-07-07-loopkit-core-design.md` and
`docs/superpowers/plans/2026-07-07-loopkit-core.md`; later work lives in the
same `docs/superpowers/{specs,plans}/` dirs.

## Rules (always)

- TypeScript strict — no `any`, no `@ts-ignore`.
- Validate all user input with Zod at every boundary (forms + server actions).
- Authorization lives in **RLS policies**, not in app code. Never widen a policy
  to "fix" a query — fix the query or the session instead.
- Use the **service-role client only** in Server Actions / Route Handlers, never
  in client components. It bypasses RLS.
- No secrets in `NEXT_PUBLIC_*`. `NEXT_PUBLIC_SUPABASE_*` are inlined at build —
  rebuild after changing them.
- `@supabase/ssr` and `@supabase/supabase-js` versions must stay compatible
  (ssr 0.10.x ↔ supabase-js 2.10x) or every query degrades to `never`.
- All Supabase clients (`src/lib/supabase/{client,server,middleware}.ts`) are
  scoped to `db: { schema: "loopkit" }` — loopkit owns that schema in the
  shared Merqo Supabase project and must never read/write another kit's schema
  (e.g. qkit's) directly. Cross-kit data goes over HTTP (the merqo metrics API),
  not a cross-schema query.
- After every new migration, regenerate `src/lib/types.ts` (`supabase gen types
typescript`) — keep the `loopkit` schema key in sync everywhere it's referenced.

## Skills

### Project skills — check here first (`.claude/skills/`)

| Skill               | What it does                                                     |
| ------------------- | ---------------------------------------------------------------- |
| `/next-verify`      | typecheck + lint + test in one pass                              |
| `/skill-audit`      | surface repeated workflows worth capturing as skills (usage log) |
| `/supabase-migrate` | apply `supabase/migrations` + regenerate types (safety gate)     |

### templateCentral plugin skills

templateCentral has **no Supabase support** (auth=better-auth, db=Drizzle/Kysely/Mongoose,
no realtime). Use only the stack-agnostic ones here:

| Skill                       | When to use                   |
| --------------------------- | ----------------------------- |
| `templatecentral:standards` | naming/validation drift check |

Do **not** run `templatecentral:add (auth)` or `(database)` — they install
better-auth / Drizzle and will break RLS + realtime.

Template adoption history (6.0.4 review, adopted / not adopted):
`docs/meta/templatecentral-adoption-log.md`.

## AI Harness

- PreToolUse hard-blocks secret-file reads and writes (env files except blank
  templates, secret dirs, certificate/credential files); governance and CI/CD
  writes require human approval. The Bash guard blocks hook bypasses,
  protected-branch force pushes and destructive guard edits.
- Credential-shaped prompts are blocked; PostToolUse type-checks after every
  Edit/Write; the Stop hook runs `pnpm test --run`; SubagentStop type-gates a
  subagent's uncommitted TS changes.
- Husky: pre-commit (format/lint/typecheck + gitleaks), commit-msg
  (Conventional Commits), pre-push (harness integrity + quality gate).
- CI: `diff-cover` ≥80% on changed lines, lockfile, changelog-touched,
  readme-freshness, harness integrity, gitleaks + the fail-closed deps gate
  `.claude/deps-gate.sh` (`pnpm audit` high/critical; expiring suppressions only
  in `.claude/dep-audit-allow.txt`).
- Hook-by-hook detail: `docs/meta/ai-harness-reference.md`. Manifest:
  `.claude/harness.json`.

## Skills Security

- Review `SKILL.md` before installing any third-party skill — treat skills like packages.
- Scope `allowed-tools:` to the minimum (e.g. `Bash(git *)` not `Bash`).
- Never install skills that hardcode secrets or make unlisted outbound calls.

## Git Workflow

**Branch source:** Always fork from an up-to-date `main`.
Before branching: `git fetch -p` then update `main` (`git checkout main &&
git pull --ff-only`). Fork the feature FROM the freshly-pulled `main`.

loopkit is a single-branch trunk: `main` is the only long-lived branch, and
Vercel auto-deploys on every push to it. Every change lands via a
feature-branch PR into `main` — there is no `uat`/`develop` stage. The
seeded hooks protect `main` from direct commits and force-push regardless
of this route (see "AI Harness" above).

## Skill capture

- A workflow done twice → author a `.claude/skills/<name>/` project skill and commit it, so the repo (and teammates) carry it, not just session memory. `/skill-audit` surfaces repeats from `.claude/skill-usage.log`.
- Don't vendor third-party plugin skills — re-author the workflow as a project skill tuned to this repo.

## Project-Specific Notes

Seeded from sibling `qkit` (same templateCentral Supabase variant, shared
Supabase project, different schema). Full detail for each note below:
`docs/DATA-MODEL.md`; the table-by-table model is in `README.md` "Data model".

- **No own Telegram bot.** Vendor alerts (`notifyVendor`) and customer alerts
  (`notifyCustomerByPhone`, phone lookup only) go through merqo's shared bot via
  `src/lib/merqo-customer-notify.ts`. A missing connection or send failure is
  caught and logged, never surfaced to `redeemAction`; a customer without a
  standing merqo connection is a silent no-op, not a bug. Specs:
  `docs/superpowers/specs/2026-08-16-vendor-telegram-connect-design.md`,
  `docs/superpowers/specs/2026-08-16-customer-telegram-connect-design.md`.
- **Customer-notify toggle:** `loopkit.vendor_notify_settings` (migration `0038`).
  "No row means on" — skip the call only when a row exists AND the flag is
  explicitly `false`; that default is resolved in application code. Spec:
  `docs/superpowers/specs/2026-08-16-customer-notify-vendor-toggle-design.md`.
- **Referral mechanic:** `loopkit.referral_hosts` (migration `0040`) is
  credit-routing on an existing program, not a sixth engine `type`. Spec:
  `docs/superpowers/specs/2026-08-20-host-referral-mechanic-design.md`.
- **`admin_audit`:** retained 5 years from `created_at` (policy only, no purge
  job); migration `0039` revokes `UPDATE`/`DELETE` from `service_role`, so the
  app only ever `INSERT`s.

<!-- [[post-harness]] — reserved for trace capture and meta-harness integration -->
