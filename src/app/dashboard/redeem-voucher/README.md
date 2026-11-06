# redeem-voucher

## Purpose

Vendor scan-confirm screen for one catalog-mode Points Club reward voucher — distinct from the Counter page, which handles every other stamp/visit/redeem action.

## Contents

- `page.tsx` — `RedeemVoucherPage` server component; resolves `?token=` via `getVoucherByToken` (owner-gated), redirects to `/dashboard` with no token, shows a not-found/already-redeemed message or renders `RedeemVoucherConfirm`. Its server-rendered "Back to dashboard" nav uses `@merqo/ui`'s `BackButton` without a function prop.
- `redeem-voucher-confirm.tsx` — `RedeemVoucherConfirm`: shows the reward text + customer phone, a single "Redeem" button calling `redeemVoucherAction`, and a redeemed confirmation state. Its "Back to dashboard" nav is `@merqo/ui`'s `BackButton`, passed `LinkComponent={Link}` for a client-side transition.
- `redeem-voucher-confirm.dom.test.tsx` — jsdom tests: renders reward/phone, confirms redemption and shows the success state, stays on the confirm screen with a toast on failure.

## Server-component note

The back nav here renders `@merqo/ui`'s `BackButton` with no
`LinkComponent` override. This page is a Server Component, and passing
`next/link` in as a prop sends a function across the Server → Client
boundary (the interactive `BackButton` is a Client Component), which Next rejects
at render. `BackButton` falls back to a plain `<a>`.

- `loading.tsx` — `RedeemVoucherLoading`, a static skeleton (`role="status"`, `aria-busy`, sr-only label) mirroring the page layout while the route streams in.

## Parent

[dashboard](../README.md)

Each page exports its own `metadata.title`, shown through the root `loopkit | %s` template. UI copy is plain: no emoji, no em dashes, no contractions in errors. The redeem-voucher page renders a `PageHeader` h1.

page test pins the page title and h1.

This folder now imports its shared page and dialog components from `@merqo/ui` (v0.42.1) instead of local copies.
