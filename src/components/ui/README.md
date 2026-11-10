# ui

## Purpose

Radix-backed shadcn primitives that `@merqo/ui/primitives` does not provide.
button, card, checkbox, input, label, select and switch (and `cn`) are imported
from `@merqo/ui/primitives`; `badge.tsx` stays local because the shared badge
has no `gold` variant, which about 25 files use.

## Contents

- `alert-dialog.tsx` — Radix `AlertDialog` wrapper (Root/Trigger/Portal/Overlay/Content/Header/Footer/Title/Description/Action/Cancel), used by `RewardCelebration`'s confirmation modal
- `avatar.tsx` — Radix `Avatar` wrapper: `Avatar`/`AvatarImage`/`AvatarFallback` plus `AvatarBadge`/`AvatarGroup`/`AvatarGroupCount` for stacked-avatar UI, sized via a `size` data-attribute
- `badge.tsx` — `Badge` (cva variants: default/secondary/gold/destructive/outline/ghost/link), `asChild`-capable via Radix `Slot`
- `dropdown-menu.tsx` — Radix `DropdownMenu` wrapper: full primitive set (Trigger/Content/Group/Item/CheckboxItem/RadioGroup/RadioItem/Label/Separator/Shortcut/Sub/SubTrigger/SubContent)
- `popover.tsx` — Radix `Popover` wrapper: `Popover`/`PopoverTrigger`/`PopoverContent`/`PopoverAnchor`; used by `color-picker.tsx` (the app's own tap-triggered `InfoTooltip` now comes from `@merqo/ui`, which vendors its own separate Popover primitive)
- `table.tsx` — plain-HTML `Table` composition: `Table`/`TableHeader`/`TableBody`/`TableFooter`/`TableRow`/`TableHead`/`TableCell`/`TableCaption`, wrapped in an overflow-x container
- `toggle.tsx` — Radix `Toggle` wrapper: `Toggle`/`toggleVariants` (cva: default/outline × default/sm/lg), the single-button primitive `toggle-group.tsx` composes into a segmented control
- `toggle-group.tsx` — Radix `ToggleGroup` wrapper: `ToggleGroup`/`ToggleGroupItem`, a connected segmented-button row (optional `spacing` prop switches between a joined outline group and gapped standalone toggles) built on `toggle.tsx`'s variants; used by `setup-form.tsx`'s Chance Card segment-odds and stamp-mark pickers

## Parent

[components](../README.md)
