# privacy

## Purpose

The public Privacy Policy page.

## Contents

- `page.tsx` — `PrivacyPage`, a Server Component rendering `LegalPageClient`
  (`@merqo/ui`'s `LegalPage`, see `../legal-page-client.tsx`) with
  `doc="privacy"`. The component brings its own prose container, so there's
  no local layout. Exports `legalPageMetadata("privacy")` as `metadata`.
  Tested in `../page.dom.test.tsx`.

## Parent

[legal](../README.md)
