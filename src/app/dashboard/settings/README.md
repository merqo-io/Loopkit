# settings

## Purpose

Redirect-only route. Settings merged into Profile; `/dashboard/settings` sends visitors to `/dashboard/profile#integrations`, where the qkit earn config and the customer-notification toggle now live.

## Contents

- `page.tsx` — server component that calls `redirect("/dashboard/profile#integrations")`.

## Parent

[dashboard](../README.md)
