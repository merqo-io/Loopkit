# Card-check actions

Customers join through the service-only customer_join RPC. Existing customers must present a current card capability from the HttpOnly vendor-scoped cookie or the saved card code. Phone numbers identify records and never authorize access. New enrollment returns only newly created credentials; an existing-card conflict returns generic recovery guidance.

`eraseMyDataAction` deletes the caller's data at one shop through `customer_erase`: rate limited, proof from the cookie only, one generic error for every failure, cookie cleared on success. Birthday changes, catalog picks and expired-cycle resets use separate proof-checked RPCs. Catalog debits serialize the balance check and voucher issue. Customer reset is limited to an expired active program. Lost-card recovery is an owning-vendor operation that rotates all customer card and active voucher capabilities at that vendor while preserving progress.

Marketing consent: `checkStatusAction` records a grant only when the join form's unticked box was ticked (source `card_check`), then reads the current state for the card view. An unticked box never withdraws. `setMarketingConsentAction` is the card-view switch (source `card_view`), gated by the saved proof. The form posts the shop name it rendered the wording from (`marketing_shop`, blank for the "this shop" fallback). The server rebuilds the wording from that name with `shownConsentWording` and stores it only if the name still matches the shop's current name, so the stored text is always the text the customer saw. A card-view opt-in with a stale name is refused with a reload message. Consent failures never block showing the card.

`checkStatusAction` is rate limited by `allowAnonymousAction` (`src/lib/rate-limit.ts`) before the join RPC and answers every join failure with one message, so a failed join does not reveal whether the phone is registered. The referral path is capped at 5 guest credits per host per 24 hours in SQL (`0064`).

Responses are schema validated. Transport and malformed-response failures produce retry messages. Referral completion is best effort after successful enrollment. Tests cover scoped proof, enrollment conflicts, recovery, mutation failures and referral delivery; direct SQL authorization tests live in supabase/tests/customer-capability.test.sql.

## Contents

- `check-status-action.ts` — `checkStatusAction`: validates the join form, rate limits, calls `customer_join`, saves the proof cookie, syncs marketing consent, credits a pending referral and builds the card view
- `card-actions.ts` — `regenerateCardAction`, `setCustomerBirthdayAction` and `selectPointsRewardAction`: proof-checked card mutations that each return a generic retry message on failure
- `consent-actions.ts` — `setMarketingConsentAction` (the card-view switch) and `eraseMyDataAction` (self-service erase with one generic failure message)
- `join-payload.ts` — `joinPayloadSchema` and `VendorJoinRow` for the `customer_join` response, plus the best-effort referral credit helpers
- `card-status-builder.ts` — `buildCardStatus`: turns one joined row into a `CardStatus` with progress, QR, expiry and active-voucher QRs
- `marketing-sync.ts` — `syncMarketingConsent`: records a ticked opt-in at join time, then reads the current consent state for the card view
- `referral-credit.ts` — `completeReferralCredit`: delivers the referral credit to the host after a guest joins
- `actions.test.ts` — behavior tests for all of the action files above
- `referral-credit.test.ts` — tests for referral delivery

[Parent](../README.md)

Service-client imports carry an eslint-disable reason: the card or voucher token is the credential.

User-facing messages say "could not", never "couldn't" (for example, "We could not find any rewards here.").

`syncMarketingConsent` and `readOrGrantMarketingConsent` take a `CardIdentity` (`vendorId`, `phone`, `token`) as their first argument.

Server Actions here return `ActionResult` from `@merqo/ui/kit-api`.
