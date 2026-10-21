# card-check

## Purpose

The customer flow at /c?v=<vendorId> creates new cards or reads existing cards with a saved possession capability. The browser stores the capability in an HttpOnly vendor-scoped cookie; customers can also save the displayed card code for another device. Phone numbers alone cannot recover existing cards.

Lost capability recovery requires the owning shop, which rotates credentials while preserving progress. Customers with valid proof can start a fresh expired cycle, choose points rewards, enter an optional birthday and turn offers by message on or off. Marketing consent is never required to join: the join form's opt-in checkbox starts unticked. Referral links preserve the same proof requirement for existing customers. New phone enrollment remains unverified; referral identity abuse is a separate product policy concern.

## Contents

- `api/`
- `components/`
- `index.ts` — barrel re-exporting `CheckForm`
- `types.ts` — shared `CardStatus`/`StatusState` types and the
  `STATUS_IDLE` constant. `CardStatus.activeVouchers` (Points Club catalog
  mode only, empty array for every other mechanic) lists each currently
  active voucher's own id/reward text/expiry/pre-rendered QR.
  `MarketingStatus` (`StatusState.marketing`) carries the current consent
  state, the server-built wording and whether a save failed

## Connectivity

`index.ts` is the only path external code should import from —
`src/app/c/page.tsx` imports `CheckForm` through it. `api/` and
`components/` are private implementation, consumed internally by
`index.ts` and by each other (`components/check-form.tsx` imports
`checkStatusAction` from `../api/actions`, `components/program-card-status.tsx`
imports `regenerateCardAction` from `../api/actions`).

## Parent

[features](../README.md)
