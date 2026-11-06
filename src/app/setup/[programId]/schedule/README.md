# setup/[programId]/schedule

## Purpose

`/setup/[programId]/schedule`: schedule the program's retirement and successor (Pro). Returns 404 for an id that is not the vendor's program.

## Contents

- `page.tsx` - server page; loads the program with `loadSetupProgram` from `../../setup-context.ts`.
