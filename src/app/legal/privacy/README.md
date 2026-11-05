# privacy

## Purpose

The public Privacy Policy page.

## Contents

- `page.tsx` — `PrivacyPage`, a one-line Server Component rendering
  `@merqo/ui`'s `<LegalDocument doc="privacy" />` (the component brings its
  own `mx-auto max-w-3xl` prose container, so there's no local layout).
  Exports `metadata` with the page title "Privacy policy".
- `page.dom.test.tsx` — jsdom test asserting `PrivacyPage` renders
  `LegalDocument` with `doc="privacy"`.

## Parent

[legal](../README.md)
