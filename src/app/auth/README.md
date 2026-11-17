# auth

## Purpose

Route group for the Supabase auth handoff: the OAuth/email/recovery callback
handler and the token-hash confirm page and verifier.

## Contents

- `callback/`
- `confirm/`

## Connectivity

`confirm/` serves own-domain email links
(`/auth/confirm?token_hash=..&type=..`): a GET page with a Continue button,
whose POST (`confirm/verify`) verifies the token and redirects to
`/dashboard`, `/reset-password`, or `/login?error=link`.

`callback/` is the other route here — the landing point for Supabase's
redirect after Google OAuth sign-in, email confirmation, or a password-
recovery link, which it then forwards to `/dashboard`, `/reset-password`, or
`/login?error=oauth`.

## Parent

[app](../README.md)
