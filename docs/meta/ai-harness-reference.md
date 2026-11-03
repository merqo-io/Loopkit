# AI harness reference

Hook-by-hook detail moved out of `AGENTS.md`. Manifest: `.claude/harness.json`;
project skills: `.claude/skills/`.

- **PreToolUse (Read|Edit|Write):** normalize Windows and relative paths;
  hard-block secret-file reads and writes (environment files except the blank
  templates, secret directories and certificate/credential files). Governance
  and CI/CD writes require human approval; their reads are allowed. Ordinary
  application code, skills and specifications remain unrestricted. The Bash
  guard continues to block hook bypasses, protected-branch force pushes and
  destructive guard edits.
- **UserPromptSubmit:** credential-shaped input is blocked; injection-phrase
  matches produce advisory context so quoted security research can proceed.
- **PostToolUse:** incremental type-check (`pnpm exec tsc --noEmit
--incremental`) after every Edit/Write. Feedback-only.
- **Stop hook:** runs the full test suite (`pnpm test --run`); exit 2 feeds
  failures to Claude via stderr; exit 0 on pass.
- **SubagentStop:** type-gates a subagent's uncommitted TS changes before it
  can hand back control.
- **Git hooks (husky):** pre-commit runs format/lint/typecheck + gitleaks
  secret-scan on staged files, plus a readme-coupling staleness warning;
  commit-msg enforces Conventional Commits; pre-push runs the harness
  integrity check + quality gate. Hard-local; coverage/changed-line gates run
  in CI. Migrated 2026-08-01 off lefthook, whose unsigned `lefthook.exe`
  Windows Smart App Control blocks unconditionally; see
  `../superpowers/specs/2026-08-01-lefthook-to-husky-migration-design.md`.
- **CI (GitHub Actions):** hard gate on changed-line coverage (`diff-cover`
  at least 80%), lockfile-in-sync (`--frozen-lockfile`), a changelog-touched
  check, a readme-freshness check, harness integrity, and (via `security.yml`)
  a redacted gitleaks scan of the current commit range + `pnpm audit`.

Template adoption history: `templatecentral-adoption-log.md`.
