# setup/[programId]/migrate

## Purpose

`/setup/[programId]/migrate`: change the program's card type (retires it and creates a successor). Returns 404 for an id that is not the vendor's program.

## Contents

- `page.tsx` - server page; loads the program with `loadSetupProgram` from `../../setup-context.ts`.
