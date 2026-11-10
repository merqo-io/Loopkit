# ui

## Purpose

Radix-backed shadcn primitives that `@merqo/ui/primitives` does not provide.
button, card, checkbox, input, label, select and switch (and `cn`) are imported
from `@merqo/ui/primitives`, as is `Badge`. The shared badge has no `gold`
variant, so gold badges use `GOLD_BADGE` from `@/lib/gold-badge`.

## Contents

- `alert-dialog.tsx` — Radix `AlertDialog` wrapper (Root/Trigger/Content/Header/Footer/Title/Description/Action/Cancel), used by `RewardCelebration`'s confirmation modal
- `popover.tsx` — Radix `Popover` wrapper: `Popover`/`PopoverTrigger`/`PopoverContent`; used by `color-picker.tsx` (the app's own tap-triggered `InfoTooltip` now comes from `@merqo/ui`, which vendors its own separate Popover primitive)
- `toggle.tsx` — `toggleVariants` (cva: default/outline × default/sm/lg), the variant classes `toggle-group.tsx` composes into a segmented control; the Radix `Toggle` wrapper itself was removed as unused
- `toggle-group.tsx` — Radix `ToggleGroup` wrapper: `ToggleGroup`/`ToggleGroupItem`, a connected segmented-button row (optional `spacing` prop switches between a joined outline group and gapped standalone toggles) built on `toggle.tsx`'s variants; used by `setup-form.tsx`'s Chance Card segment-odds and stamp-mark pickers

## Parent

[components](../README.md)
