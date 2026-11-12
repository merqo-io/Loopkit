# ui

## Purpose

No local primitives remain: every shadcn primitive (button, card, checkbox,
input, label, select, switch, badge, alert dialog, popover, toggle and toggle
group, plus `cn`) is imported from `@merqo/ui/primitives`. The shared badge has
no `gold` variant, so gold badges use `GOLD_BADGE` from `@/lib/gold-badge`.

## Contents

- `touch-system.dom.test.tsx` — jsdom tests that the coarse-pointer rules in `globals.css` and the shared primitives keep touch targets at 44px

## Parent

[components](../README.md)
