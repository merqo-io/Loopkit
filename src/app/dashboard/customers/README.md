# customers

## Purpose

Vendor-facing customer list at `/dashboard/customers` — a searchable directory of everyone with a card at the shop, either merged across all programs or scoped to one via `?p=`.

## Contents

- `page.tsx`, `overview-cohort.tsx` and `vendor-customer-list.tsx` use the shared `PageHeader` (eyebrow "Your regulars") and `EmptyState` with an Open the Counter or See all customers link.
- `customers-tabs.tsx` — `CustomersTabs`, the Customers / Referrals link strip (a `nav` with `aria-current`, not a tablist) shared by the list page and `referrals/`; `referrals/` holds the host-referral page, panel and actions (moved from `/dashboard/referrals`).
- `customer-controls.tsx` — `CustomerControls`, a `"use client"` sort `<Select>` (Last visit / Longest away / Closest to reward) for the vendor-wide list; on change it `router.push`es `?sort=` while keeping the current `q` and `seg` params. The segment chips beside it are plain server-rendered `<Link>`s, so only this onChange navigation needs a client.
- `customer-controls.dom.test.tsx` — jsdom test: renders the three options and pushes `sort=progress` (or `away`) with the preserved `q`/`seg` kept and empty params dropped.
- `customers-page.dom.test.tsx` — jsdom tests for `VendorCustomerList` (name, phone, badges, totals; phone-only fallback; empty state; a Serve link to the row's recent program at the counter) and the vendor-wide `CustomersPage` (segment chips render with per-segment counts and a `?seg=ready` link; `?seg=lapsed` filters to lapsed rows only; `?sort=away` orders oldest-last-seen first; every row has a Serve link; the one-program redirect still carries `q`; the `?p=` branch still renders its card list).
- `loading.tsx` — `CustomersLoading`, a static skeleton (animated-pulse blocks, root `<div className="space-y-8">`) shown while the customers page streams in.
- `page.tsx` — exports the default `CustomersPage` server component and imports `VendorCustomerList` from `vendor-customer-list.tsx`; requires a vendor, redirects to the single program when there's exactly one, and renders `ProgramSwitcher` beside the phone search form below the page header. The vendor-wide branch (no `?p=`) then reads `?seg=` / `?sort=` (validated by `parseSegment` / `parseSort`), renders the four segment chips (all / reward ready / new this week / not seen 30d+) as `<Link>`s with counts from `segmentCounts` plus `CustomerControls`, and passes the `filterBySegment` + `sortCustomers` result to `VendorCustomerList`. Each row shows an avatar, a mini progress hint (a Ready badge when `rewardReady`, else "n to go" from `bestGap`), and a Serve `<Link>` to `/dashboard/counter?p=<recentProgramId>&phone=<phone>`. The default view (all segment, most-recent sort) is keyset-paged at 50 via `listVendorCustomers` and the `?c=` cursor, with Next page / Back to first page links that keep `q`, `seg` and `sort`. Any other segment or the away/progress sort reads the full set through `listAllVendorCustomers`, filters and sorts it, and shows no pager. Chip counts always come from the full set matching `q`. The program-scoped `?p=` branch is unchanged: a per-program card list (`listCards`). Both branches' root element is a plain `<div className="space-y-8">`; the enclosing `../layout.tsx` `<main>` owns the shared `max-w-7xl` width and padding. Every customer name/phone in both branches links to `[phone]/page.tsx`. Uses `@merqo/ui`'s `ElevatedCard`.
- `[phone]/` — one customer's detail view: every card they hold across the vendor's own programs, a per-program manual stamp-adjustment tool, and their full activity history. See its own README.

## Reuse and ownership

`customer-search-toolbar.tsx` composes program selection and an accessible native GET search form for vendor, program and Overview-cohort views. Each caller retains its own queries and list models; search carries `q`, selected `p` and optional `cohort`.

## Parent

[dashboard](../README.md)

Overview cohort links retain program/search/cohort parameters and render exact card-level cohort rows. Explicit segment or sort choices do not take the automatic single-program redirect.

Each page exports its own `metadata.title`, shown through the root `loopkit | %s` template. UI copy is plain: no emoji, no em dashes, no contractions in errors.

This folder now imports its shared page and dialog components from `@merqo/ui` (v0.42.1) instead of local copies.
