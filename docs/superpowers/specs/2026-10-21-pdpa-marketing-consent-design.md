# PDPA marketing consent capture and withdrawal

Date: 2026-10-21. Status: approved by the owner, built in the same PR.

## Why

loopkit collects customer phone numbers. A point-of-collection notice shipped
in #150, but nothing records whether a customer agreed to marketing messages.
Any future "send offers" feature needs a consent record that already exists.
This change builds that record now, before any sending feature.

## Legal basis (research summary, not legal advice)

- PDPA s13 to s15: consent follows notice of purpose. Under s14(2), it cannot
  be a condition of the stamp card. So the opt-in is separate, optional and
  never pre-ticked.
- PDPA s16: customers may withdraw. Withdrawals here take effect immediately.
  The statutory window is 10 business days.
- DNC provisions (PDPA Part 9) cover marketing by voice call, SMS/MMS and fax
  to Singapore numbers. Consent counts only if it is "clear and unambiguous",
  in written or other accessible form, and specific to messages sent to that
  number. The PDPC gives a generic "marketing purposes" clause as an example
  that is not enough. So the wording names the shop, the channels and the
  number.
- Instant messaging (Telegram, WhatsApp) is outside the DNC rules. The Spam
  Control Act, as amended in 2020, still requires a working unsubscribe for
  bulk commercial IM messages.

## Scope built

- An unticked checkbox on `/c`, the customer join and check form, and on
  `/earn`, the qkit claim form. The checkbox label is the exact consent
  wording. It names the shop (stall name from merqo's shared vendor profile,
  falling back to "this shop") and the channels: SMS, WhatsApp and Telegram.
- `loopkit.marketing_consents` (migration `0061`) is an append-only log keyed
  by `(vendor_id, phone)`:
  - Each row stores granted or withdrawn, `wording_version` and a
    `wording_text` snapshot (both required on a grant), plus `source` and
    `recorded_at`.
  - The latest row decides the current state. No row means not opted in.
  - A trigger blocks every UPDATE. No role holds DELETE. Rows go only through
    the FK cascade from `loopkit.customers`.
  - Vendors can read their own rows under RLS. No client role holds a direct
    write grant.
- The form posts the shop name it rendered the wording from (`marketing_shop`, blank for the "this shop" fallback). The server rebuilds the wording from that name with `shownConsentWording` and stores it only if the name still matches the shop's current name, so the stored text is always the text the customer saw. A blank name always stores the fallback wording. A name that no longer matches, or a failed lookup, stores nothing and asks the customer to retry. `MARKETING_CONSENT_VERSION` in `src/lib/marketing-consent.ts` is bumped on every wording change.
- Customers withdraw, or opt in later, with a switch on their own `/c` card
  view. The switch is gated by the same card-token proof as every other
  customer RPC.
- Vendors use a "Record opt-out" button on the customer detail page when a
  customer asks in person. The vendor RPC can only withdraw, never grant. A
  table check enforces the same rule.
- An unticked box on a later visit never withdraws. It only means no new
  opt-in.

## Decisions

- **Counter enrolment** (cashier types the phone) captures no consent. Typing
  a number at the till is not the customer's written consent. The counter
  panel tells the cashier to point the customer to the shop QR instead.
  Referral host phones are treated the same way: no capture.
- **Every DNC piece is deferred.** That covers a results table, a send gate
  and any Registry account. No sending channel exists yet, and the owner does
  not want dead code. Existing customers have no consent rows, so they read
  as not opted in.

## Required before any marketing send ships

- Every send path must read the latest `marketing_consents` row and skip
  anyone not currently granted.
- **SMS, voice or fax marketing must add a DNC Registry check and require a
  fresh result even when consent exists.** Phone numbers are not verified,
  so a tick may come from someone other than the number's subscriber.
  Results are valid for 21 days.
- A Registry account needs a UEN and a representative's Corppass. The cost is
  a $30 one-time fee and 1,000 free checks a year, then roughly 1 to 2.5
  cents per number. An API exists, but you have to ask PDPC for its spec.
- If Merqo runs DNC checks on vendors' behalf, Merqo becomes a PDPA
  "third-party checker" with its own duties. It also needs a UEN, which
  depends on the shelved ACRA item.
- Telegram-first sending is outside DNC, but it must include a working
  unsubscribe that writes a withdrawal row.
- The same opt-in pattern should be copied to qkit if qkit ever markets to
  customers.
