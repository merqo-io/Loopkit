# legal

## Purpose

The public legal-document pages and the acceptance interstitial. Content
lives in `@merqo/ui` (one source, shared by merqo and every kit); loopkit
only routes to it and, on `accept/`, records the vendor's acceptance with
merqo.

## Contents

- `legal-page-client.tsx` — `LegalPageClient`, a `"use client"` wrapper around
  `@merqo/ui`'s `LegalPage` with `next/link`. Needed because `@merqo/ui` 0.57
  inlines its client-only `LegalDocument` into `LegalPage` without a client
  boundary, so `LegalPage` rendered straight from a Server Component 500s.
  Remove once the package keeps the boundary.
- `wordmark.tsx` — `LegalWordmark`, the loopkit mark the three pages pass to
  the shared components (which wrap it in the home link).
- `page.dom.test.tsx` — renders the three pages: shared metadata titles,
  wordmark home link, and the accept submit gated on the checkbox (touch)
  with `next` sanitised.
- `terms/`
- `privacy/`
- `accept/`

## Connectivity

loopkit owns no acceptance record — merqo does (`merqo.legal_acceptances`).
The gate that sends vendors here lives in `@/lib/legal-gate`
(`requireCurrentLegalAcceptance`), wired into `requireVendor`
(`src/features/auth/api/require-vendor.ts`), loopkit's single vendor-gate
entry point — every dashboard/setup page and layout goes through it, so
there is no second call site to wire. `terms/` and `privacy/` are also
linked from the landing footer (`@merqo/ui`'s `LegalFooterLinks` in
`src/components/landing/footer.tsx`).

## Parent

[app](../README.md)
