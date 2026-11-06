# Card-check components

- check-form.tsx submits vendor, phone, optional saved card code and referral code. It renders generic recovery guidance without revealing whether a phone has a card. A successful check stores the opaque capability in an HttpOnly cookie and renders authorized cards.
- program-card-status.tsx renders progress, card and voucher QR codes, and a saveable card code. Fresh-cycle reset is available only for an expired card; lost credentials require the shop. Retired-card notices are optional local preferences, written without em dashes (guarded by `src/components/landing/guardrails.test.tsx`).
- points-catalog-picker.tsx submits vendor and program scope; the server reads the capability cookie and the database checks ownership and balance. Pending state always clears after failures.
- birthday-field.tsx submits an optional birthday through the proof-checked `setCustomerBirthdayAction` in `../api/card-actions`.
- marketing-consent-toggle.tsx is the card-view switch for offers by message. It shows the consent wording, withdraws or opts in through setMarketingConsentAction (`../api/consent-actions`), and flags a failed save from the join.
- erase-data.tsx is the two-step "Delete my data at this shop" control. It calls eraseMyDataAction (`../api/consent-actions`) after an explicit confirm and, on success, check-form returns to the join form.
- check-form.tsx asks for confirmation (AlertDialog: Keep card / Forget card) before forgetting the saved card on this browser, and its summary link reads "Not you? Change number".
- check-form.tsx also renders the shared unticked MarketingOptIn checkbox on the join form and the toggle once cards are found.

Component tests verify rendering, form payloads, retry states and the expired-cycle reset boundary. Capability cookie and direct SQL authorization regressions live in src/lib/customer-proof.test.ts and supabase/tests/customer-capability.test.sql.

[Parent](../README.md)

## Reuse and ownership

`program-card-status.tsx` delegates pure progress rendering to `components/progress-visual.tsx`. It retains customer plant seeding, catalog redemption, voucher state and recovery/regeneration actions.

Every `dangerouslySetInnerHTML` here is `qrSvg()` output over a server-minted token.

Customer-facing copy has no emoji or contractions.
