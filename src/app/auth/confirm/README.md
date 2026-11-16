# confirm

## Purpose

Own-domain landing for Supabase email links (password reset, signup confirm, invite, magic link, email change). A GET never consumes the token because email scanners pre-fetch links.

## Contents

- `page.tsx` — `AuthConfirmPage`: reads `token_hash`, `type` and `next` with `readAuthConfirmParams` and renders `@merqo/ui`'s `AuthConfirmForm` (or `AuthConfirmInvalid`) in the auth card shell; noindex, `no-referrer`, never calls Supabase
- `page.dom.test.tsx` — tests the form for a valid link, the invalid state, the metadata, and that Supabase is not called
- `verify/`

## Parent

[auth](../README.md)
