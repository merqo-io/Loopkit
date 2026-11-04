# vendors

## Purpose

Admin vendors console: a read-only vendor list showing each vendor's cached
Merqo tier. Plans are changed in the Merqo admin, not here.

## Contents

- `page.tsx`: `AdminVendorsPage`: fetches `listVendors()` and renders the vendor table via `VendorsTable`, wrapped in `@merqo/ui`'s `ElevatedCard`.
- `vendors-table.tsx`: `VendorsTable` client component: renders `@merqo/ui`'s shared `DataTable` with tier badges (labels via the shared `tierLabel`), owning the `columns` cell renderers and `getRowKey`, function props a Client Component can't be handed from the Server Component page.

## Parent

[admin](../README.md)
