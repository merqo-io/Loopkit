# scripts

## Purpose

Operator scripts run by hand, outside the app.

## Contents

- `staging-migrate.sh` applies `supabase/migrations` to the shared staging Supabase project with psql, one transaction per file. Run it inside `postgres:17.6-alpine` with the repo mounted at `/repo` (merqo's `docs/STAGING.md`). With no arguments it bootstraps every file and refuses if the `loopkit` schema already exists; with file arguments it applies only those, for the staging-first migration gate.

## Parent

[loopkit](../README.md)
