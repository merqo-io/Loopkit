# accept

## Purpose

The legal-acceptance interstitial `requireCurrentLegalAcceptance`
(`@/lib/legal-gate`) redirects a signed-in vendor to when their accepted
terms/privacy versions are behind `@merqo/ui`'s `LEGAL_VERSIONS`.

Shared controls and `cn` used by this folder's modules are imported from `@merqo/ui/primitives`; only `badge`, `alert-dialog`, `avatar`, `dropdown-menu`, `popover`, `table`, `toggle` and `toggle-group` remain in `src/components/ui/`.

## Contents

- `page.tsx` — `LegalAcceptPage`. Reads the `next` search param (through
  `safeRedirectPath` from `@merqo/ui`) and renders `@merqo/ui`'s
  `AcceptTermsPage` with the `acceptLegalTerms` action and the shared
  `LegalWordmark`. The shared page owns the heading, the agree checkbox
  (no typed name) and the submit, which stays disabled until it's checked.
  Deliberately runs **no** legal-gate check itself — it is what the gate
  redirects to, so gating it would loop. Exports `metadata` with the page
  title "Review updated terms". Tested in `../page.dom.test.tsx`.
- `actions.ts` — `acceptLegalTerms` server action. Re-checks for a
  signed-in user (redirects to `/login` otherwise), reads the real `ip`
  (via a local `clientIp` helper reading `x-forwarded-for`/`x-real-ip`) and
  `user_agent` off the request's own `headers()`. It then `POST`s
  `/api/merqo/legal-accept` on merqo once per doc type (`terms`, `privacy`) —
  bearer-authed with `MERQO_CUSTOMER_SECRET`, `kit_slug: "loopkit"`, each body
  carrying the SHA-256 of that doc's `getLegalDocSource(docType, "loopkit")`
  (loopkit's own scoped schedule, not the full multi-kit annex) plus
  `ip`/`user_agent`. Each call is independent, and merqo maps a
  duplicate `(email, doc_type, doc_version)` to a success, so a conflict on
  one doc never blocks the other. On success it primes the local
  `legal_check_state` cache to `is_current = true` and redirects to a
  `safeRedirectPath`-checked `next` (default `/dashboard`).
- `actions.test.ts` — covers the two independent posts (asserting
  `ip`/`user_agent` land in both bodies), the cache prime, `next`-param
  safety (absolute / protocol-relative rejected), the no-user and
  missing-secret branches, a non-2xx throw, and `clientIp`'s fallback
  chain (`x-real-ip` when `x-forwarded-for` is absent, `"unknown"` when
  neither header is present).

## Shared package note

`safeRedirectPath` now comes from `@merqo/ui` (v0.31.0) rather than `@/lib/safe-redirect`.

## Parent

[legal](../README.md)

The `next` form field is length-checked by Zod before `safeRedirectPath` runs.
