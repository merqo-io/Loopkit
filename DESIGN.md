# loopkit design

This file records loopkit's own design values. Shared rules are linked, not restated.

## Public pages

Public pages (landing, about, FAQ, legal) follow the shared rules at https://github.com/merqo-io/merqo-ui/blob/main/docs/public-page-rules.md. This section never restates them; it only adds loopkit's own values.

- **Radius:** `--radius` is `0.75rem` (`src/app/globals.css`). Surfaces use `rounded-lg`.
- **Product object:** the stamp card is loopkit's product object and keeps its real edge. On the landing it is `StampCard` in the hero (`src/components/landing/stamp-card.tsx`): an 8-slot card, 6 stamped, the 8th a reward, built as plain markup with no image.
- **Status:** loopkit is "In build". The hero shows an "In build" badge beside "Built, not yet tried with vendors." Public copy and media must not imply it is live.
- **Open:** `StampCard` uses `rounded-2xl` and `shadow-sm` today (`src/components/landing/stamp-card.tsx`). The corner is the card's own edge; whether the shadow stays is not decided.
