# entitlement

## Purpose

Receiver for merqo's subscription entitlement push. Merqo owns plans and
billing; loopkit only caches the result.

## Contents

- `route.ts` — `POST(request)`. Guarded by `provisionBearerOk()` (`MERQO_PROVISION_SECRET`, a write endpoint). Parses the body with `entitlementPayloadSchema` (`@/lib/merqo-entitlement-contract`) and answers 400 for a bad body or any `kit` other than `loopkit`. Resolves the email to an auth user through `listAllUsers()` (404 `{ok:false,error:"unknown_vendor"}` when absent, 503 when the directory is unavailable), then calls the service-role `loopkit.upsert_vendor_entitlement` function, which ignores a push whose `issued_at` is not newer than the stored one. Success is 200 `{ok:true}`, including for that ignored stale push. There is no rate limiting, matching `vendor-provision/`, which has none either.

## Parent

[merqo](../README.md)
