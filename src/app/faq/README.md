# faq

## Purpose

The public `/faq` page: full answers beyond the four landing rows. Structure
and behaviour come from `@merqo/ui`'s shared `FaqPage`; this folder only
supplies loopkit's copy. loopkit is in build, so nothing here may imply it is
live, and no row quotes a price or plan name.

## Contents

- `page.tsx` — `FaqRoute`, an async Server Component. Reflects the session
  (same pattern as `about/`) so `Nav`'s CTA reads "Dashboard" for a signed-in
  vendor. Renders `FaqPage` between loopkit's `Nav` and `Footer`. No `closing`
  slot; JSON-LD is on.
- `faq-content.ts` — title, intro and the three `FaqGroup`s (ten rows). The
  cost row reuses the landing's `PRICING_LINE`.
- `page.dom.test.tsx` — groups and row count, absent rows, JSON-LD, touch
  open, and copy guardrails.

## Connectivity

Linked from `Nav` (`src/components/landing/nav.tsx`). Like `/about`, it is
not a nonce route.
