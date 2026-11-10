# vendors

## Purpose

Admin vendors console: a read-only vendor list showing each vendor's cached
Merqo tier. Plans are changed in the Merqo admin, not here.

## Contents

- `loading.tsx` — route skeleton (`AdminLoadingShell`): `aria-busy`, sr-only "Loading" status, header and card placeholders.
- `page.tsx`: `AdminVendorsPage`: fetches `listVendors()` and renders the vendor table via `VendorsTable`, wrapped in `@merqo/ui`'s `ElevatedCard`.
- `vendors-table.tsx`: `VendorsTable` client component: renders `@merqo/ui`'s shared `DataTable` with tier badges (labels via the shared `tierLabel`), owning the `columns` cell renderers and `getRowKey`, function props a Client Component can't be handed from the Server Component page.

`Badge` comes from `@merqo/ui/primitives`; gold badges pass `className="bg-gold text-gold-foreground"`.

## Parent

[admin](../README.md)

Each page exports its own `metadata.title`, shown through the root `loopkit | %s` template. UI copy is plain: no emoji, no em dashes, no contractions in errors.

This folder now imports its shared page and dialog components from `@merqo/ui` (v0.42.1) instead of local copies.
