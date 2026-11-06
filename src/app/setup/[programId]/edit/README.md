# setup/[programId]/edit

## Purpose

`/setup/[programId]/edit`: edit form for an existing program. Returns 404 for an id that is not the vendor's program.

## Contents

- `page.tsx` - server page; loads the program with `loadSetupProgram` from `../../setup-context.ts`.
