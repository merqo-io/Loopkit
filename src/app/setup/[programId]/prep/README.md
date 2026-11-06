# setup/[programId]/prep

## Purpose

`/setup/[programId]/prep`: set up a hidden replacement program (free plan). Returns 404 for an id that is not the vendor's program.

## Contents

- `page.tsx` - server page; loads the program with `loadSetupProgram` from `../../setup-context.ts`.
