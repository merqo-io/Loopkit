# components

## Purpose

Client-side auth UI.

Shared controls and `cn` used by this folder's modules are imported from `@merqo/ui/primitives`; only `badge`, `alert-dialog`, `avatar`, `dropdown-menu`, `popover`, `table`, `toggle` and `toggle-group` remain in `src/components/ui/`.

## Contents

- `login-form.tsx` — `LoginForm`: `@merqo/ui`'s `ElevatedCard`-wrapped Google OAuth
  sign-in (forces `hl=en` on the consent screen, cross-kit parity) and
  email/password sign-in/sign-up on react-hook-form + `loginSchema`
  (`@/lib/schemas`) with a "check your email" state for signup confirmation
  and password-reset links; `?error=link` (from `/auth/confirm/verify`) shows
  an expired-link message in the same inline error slot; auth/server errors
  (Google OAuth, sign-in/up, forgot-password) and field-validation errors all
  render inline (`role="alert"`), with generic copy and the raw error logged.
  The wordmark above the card is a home link with a
  mode-independent tagline ("Loyalty for Singapore's small vendors."),
  matching qkit's reference login pattern exactly — same two sign-in paths,
  no third. A 2026-07-11 name+phone onboarding option (anonymous Supabase
  session, no account recovery) was removed 2026-09-01 for this reason —
  see `docs/superpowers/specs/2026-07-11-vendor-phone-onboarding-design.md`.
- `reset-password-form.tsx` — `ResetPasswordForm`: `@merqo/ui`'s `ElevatedCard`-wrapped
  password + confirm-password form on an active recovery session, calls
  `supabase.auth.updateUser` then redirects to `/dashboard`; a weak-password
  error shows the specific rule that failed
- `weak-password.ts` — `PASSWORD_REQUIREMENTS_HINT` (tap hint text) and
  `weakPasswordMessage` / `weakPasswordErrorMessage`, which turn a Supabase
  `weak_password` error into copy naming the failed rule, parsed from the
  server response; any other error returns `null` so callers keep their fixed copy
- `weak-password.test.ts` — unit tests for the helper

## Shared package note

`google-mark.tsx` moved to `@merqo/ui` (v0.31.0) as `GoogleMark` — it was byte-identical in all five repos.

`useAsyncAction` and `navigatingAway` come from `@merqo/ui`.

## Parent

[auth](../README.md)

`login-form.tsx` renders the check-your-email screen through `SentNotice`.
