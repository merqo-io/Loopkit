# setup/[programId]

## Purpose

Per-program setup routes. An id that is not one of the vendor's programs returns a 404.

## Contents

- `edit/page.tsx` - `/setup/[programId]/edit`: edit form.
- `migrate/page.tsx` - `/setup/[programId]/migrate`: change the program's card type.
- `prep/page.tsx` - `/setup/[programId]/prep`: set up a hidden replacement (free plan).
- `schedule/page.tsx` - `/setup/[programId]/schedule`: schedule retirement (Pro).
