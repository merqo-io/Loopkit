# mfa

## Purpose

Second-step sign-in for the loopkit admins. `requireAdmin()` redirects any team
session below `aal2` here, so the operator console is never reachable with a
password alone.

Shared controls and `cn` used by this folder's modules are imported from `@merqo/ui/primitives`; only `badge`, `alert-dialog`, `avatar`, `dropdown-menu`, `popover`, `table`, `toggle` and `toggle-group` remain in `src/components/ui/`.

## Contents

- `page.tsx` — server page; `requireTeamMember()` only (it lives outside
  `/admin` so the `aal2` gate cannot loop back), forwards an `aal2` session to
  `/admin`, otherwise passes the verified TOTP factor (or stale unverified ones)
  to the form.
- `loading.tsx` — skeleton shown while `page.tsx` resolves the admin check and MFA factors; keeps `<main>` as the landmark with a labelled busy status inside.
- `loading.dom.test.tsx` — renders the skeleton and asserts the landmark, busy status and placeholders.
- `mfa-form.tsx` — thin adapter over `@merqo/ui`'s `MfaForm`. It supplies the
  Supabase calls (unenroll stale factors, `enroll`, `challengeAndVerify`), the
  fixed error copy and the redirect to `/admin` plus `router.refresh()`. Every
  failure, thrown or returned, becomes one of three fixed messages (setup
  failed, code did not work, missing factor) before the shared form sees it.
  Differences from the former local form: pasted text is reduced to six digits
  and non-digits are stripped as typed; the input has `pattern="[0-9]*"`, a
  placeholder, `name="code"` and `aria-invalid`/`aria-describedby`; the input
  and button are disabled while pending, duplicate taps are ignored and the
  button reads "Verifying"; the error clears on edit; thrown errors are shown
  with the fixed copy instead of going unhandled; the QR image renders only
  for `data:image/` sources.
- `mfa-form.dom.test.tsx` — verify, wrong code, rate-limit error, enrol
  failure and thrown enrol error, short code, touch tap, pasted code, input
  attributes.

## Connectivity

Needs TOTP enrolment and verification enabled in Supabase Auth.
