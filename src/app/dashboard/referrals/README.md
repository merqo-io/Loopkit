# referrals

## Purpose

Redirect-only route. Referrals moved under Customers; `/dashboard/referrals` sends visitors to `/dashboard/customers/referrals` so old links and bookmarks keep working.

## Contents

- `page.tsx` — server component that calls `redirect("/dashboard/customers/referrals")`.

## Parent

[dashboard](../README.md)
