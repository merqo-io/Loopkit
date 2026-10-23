# earn

Customer-facing stamp claims reached through a completed qkit order link.

- `actions.ts` validates the order UUID, phone, name and optional saved token. It resolves the order's vendor through a service-only RPC, then invokes `customer_qkit_earn_claim`. Existing cards and retries require a current card token scoped to that vendor and phone. A first enrollment returns only a freshly inserted credential; database conflicts require recovery. The action saves proof in the HttpOnly vendor cookie and returns only progress to the form.
- `actions.ts` also records a marketing opt-in (`customer_set_marketing_consent`, source `earn`) when the unticked box was ticked, using the returned card proof and the wording rebuilt from the shop name the form showed (`shownConsentWording`). A stale or unconfirmable shop name stores nothing. A failed save keeps the stamp and sets `marketingSaveFailed`.
- `actions.test.ts` covers enrollment, saved and manual proof, denied recovery, malformed responses, transport failures, cookie failures and the marketing opt-in.
- `earn-form.tsx` renders phone, optional name and optional saved card token inputs. Lost cards use vendor-assisted recovery. A `DataCollectionNotice` from `@merqo/ui` states why phone and name are collected and links to `/legal/privacy` (PDPA Notification Obligation; display only, no consent record). An unticked `MarketingOptIn` checkbox carries the exact consent wording. Successful claims show stamp progress and reward copy.
- `earn-form.dom.test.tsx` covers rendering, submission, progress and visible errors.
- `page.tsx` reads the order search parameter and renders the form or missing-reference copy. It resolves the shop name (order to vendor via `qkit_earn_vendor`, then `getShopName`) for the greeting and passes it to the form as `shopName` for the consent wording.

Migration `0056` closes direct access to the legacy phone-only lookup and commit functions. The guarded SQL wrapper preserves persisted stamp limits and idempotency. Database authorization and conflict regressions are in `supabase/tests/earn-customer-capability.test.sql`; these require a disposable local database.

[app](../README.md)
