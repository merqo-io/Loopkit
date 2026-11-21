# terms

## Purpose

The public Terms of Service page.

## Contents

- `page.tsx` — `TermsPage`, a Server Component rendering `LegalPageClient`
  (`@merqo/ui`'s `LegalPage`, see `../legal-page-client.tsx`) with
  `doc="terms" kit="loopkit"`. The component brings its own prose container,
  so there's no local layout. The `kit` prop scopes the rendered Annex to
  loopkit's own schedule only, not every sibling kit's. Exports
  `legalPageMetadata("terms")` as `metadata`. Tested in `../page.dom.test.tsx`.

## Parent

[legal](../README.md)
