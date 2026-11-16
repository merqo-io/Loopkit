# verify

## Purpose

POST endpoint the confirm page form submits to; verifies the emailed token on this origin.

## Contents

- `route.ts` — `POST` handler: `handleAuthConfirm` with the server Supabase client, default landing `/dashboard`, recovery landing `/reset-password`; failures redirect to `/login?error=link`
- `route.test.ts` — tests success, recovery, failure and cross-origin rejection

## Parent

[confirm](../README.md)
