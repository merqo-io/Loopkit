# Card-check actions

Customers join through the service-only customer_join RPC. Existing customers must present a current card capability from the HttpOnly vendor-scoped cookie or the saved card code. Phone numbers identify records and never authorize access. New enrollment returns only newly created credentials; an existing-card conflict returns generic recovery guidance.

Birthday changes, catalog picks and expired-cycle resets use separate proof-checked RPCs. Catalog debits serialize the balance check and voucher issue. Customer reset is limited to an expired active program. Lost-card recovery is an owning-vendor operation that rotates all customer card and active voucher capabilities at that vendor while preserving progress.

Marketing consent: `checkStatusAction` records a grant only when the join form's unticked box was ticked (source `card_check`), then reads the current state for the card view. An unticked box never withdraws. `setMarketingConsentAction` is the card-view switch (source `card_view`), gated by the saved proof. Wording is built on the server from the shop name, never taken from the client. Consent failures never block showing the card.

Responses are schema validated. Transport and malformed-response failures produce retry messages. Referral completion is best effort after successful enrollment. Tests cover scoped proof, enrollment conflicts, recovery, mutation failures and referral delivery; direct SQL authorization tests live in supabase/tests/customer-capability.test.sql.

[Parent](../README.md)
