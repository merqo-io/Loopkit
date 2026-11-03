# Data model and cross-kit notes

Project-specific detail moved out of `AGENTS.md`. The table-by-table data model
(including the referral RPCs and tables) is in the root `README.md` under
"Data model".

## Vendor Telegram Connect / Phase A2 (2026-08-16, supersedes Phase A)

loopkit no longer runs its own Telegram bot. Phase A (deep-link QR in
`/dashboard/settings`, `src/lib/telegram.ts`/`telegram-link.ts`, the
`src/app/api/telegram/webhook/` route, `loopkit.vendor_telegram`/
`loopkit.telegram_link_tokens` from migration `0036`) was retired in full:
those tables were dropped by migration `0037`, and every file above was
deleted. `redeemAction`'s vendor alert (`notifyRedemptionOnTelegram`,
`src/app/dashboard/actions.ts`) now calls `notifyVendor`
(`src/lib/merqo-customer-notify.ts`), which posts to merqo's shared bot via
`POST /api/merqo/notify-vendor`. A vendor who had linked loopkit's own bot
must reconnect once via merqo's own profile page; no data carried over. A
missing connection or a send failure is caught and logged, never surfaces to
`redeemAction`'s own result. See
`superpowers/specs/2026-08-16-vendor-telegram-connect-design.md`.

## Customer Telegram connect (2026-08-16)

loopkit's reuse-only half of the cross-kit Phase B+D design. `redeemAction`
also calls `notifyCustomerByPhone` (`src/lib/merqo-customer-notify.ts`) as a
sibling to the vendor alert above, posting to merqo's
`/api/merqo/notify-customer` endpoint in its `phone` lookup mode (never
`notify_ref`, since loopkit has no prior connect-token round to attach one
to). This only reaches a customer who already has a **standing** Telegram
connection with merqo from having connected via qkit _with a matching phone
number_; a Telegram-only qkit connection (no phone) or a customer who never
connected at all is a silent no-op, not a bug to work around. No new UI, no
new table, no connect flow on loopkit's side. `MERQO_BASE_URL`/
`MERQO_CUSTOMER_SECRET` are optional; a missing value no-ops the same way the
Telegram vars above do. See
`superpowers/specs/2026-08-16-customer-telegram-connect-design.md`.

## Customer notify vendor toggle (2026-08-16)

Fast-follow on the above. `loopkit.vendor_notify_settings` (migration `0038`)
is a small dedicated table: `vendor_id` primary key,
`customer_telegram_notify_enabled` boolean, default `true`. It gives a vendor
an on/off switch (default on, opt-out) for `redeemAction`'s
`notifyCustomerByPhone` call, since the customer already consented by
connecting Telegram; this is a vendor brand-preference gate, never a consent
gate, and it never touches merqo's own connection data. RLS is `for all`
own-row (not service-role-only like `vendor_telegram`/`telegram_link_tokens`
used to be): a vendor upserts their own row directly under RLS from
`saveCustomerNotifySettingsAction` (`src/app/dashboard/actions.ts`, same
upsert-on-`vendor_id` shape as `saveQkitEarnConfigAction`), surfaced as a
switch in `/dashboard/settings`
(`src/app/dashboard/customer-notify-settings.tsx`). `redeemAction` reads the
row itself via `customerNotifyEnabled` before calling
`notifyCustomerByPhone`, and skips the call only when a row exists AND the
flag is explicitly `false`: a vendor with no row at all (never visited the
settings page) still gets the call; that "no row means on" default is
resolved in application code, not just the column default. See
`superpowers/specs/2026-08-16-customer-notify-vendor-toggle-design.md`.

## Host/couple-facing referral mechanic (2026-08-20)

`loopkit.referral_hosts` (migration `0040`) lets a vendor name one of their
own active programs plus a host's phone (the bride/groom/organizer who chose
them), and share a `/c?v=<vendorId>&ref=<code>` link
(`src/app/dashboard/referrals/`). Every distinct guest who joins through that
link bumps the host one stamp/visit on the named program: credit-routing on
an existing program, not a sixth engine `type`. See `../README.md`'s "Data
model" section for the full RPC/table shape (`vendor_join_referred`,
`apply_referral_credit`, `loopkit.referral_credits`) and
`superpowers/specs/2026-08-20-host-referral-mechanic-design.md`.

## `admin_audit` retention (2026-08-19)

`loopkit.admin_audit` (migration `0003`; helper: `recordAudit`,
`src/lib/admin-audit.ts`) is retained for **5 years** from `created_at`,
matching Singapore's IRAS record-keeping norm for a small business. No
archival/purge job exists yet; this is a stated policy so retention isn't
decided ad hoc later, not an automated one. Add a scheduled purge only
if/when actually needed. Separately, migration `0039` revokes `UPDATE`/
`DELETE` on `admin_audit` from `service_role` (RLS already blocked
`authenticated`/`anon`; the app only ever `INSERT`s into it) so the trail
can't be edited or erased even by whoever holds the service-role key.
