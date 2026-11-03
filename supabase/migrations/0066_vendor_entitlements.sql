-- 0066: merqo owns subscriptions and pushes each vendor's entitlement to
-- every kit (POST /api/merqo/entitlement). This table is loopkit's cache of
-- that push; loopkit never decides a vendor's plan itself. event_pass is
-- never stored: merqo sends null for loopkit.
--
-- Writes are service-role only and go through upsert_vendor_entitlement so
-- the issued_at ordering check is atomic. A vendor reads only their own row.

create table loopkit.vendor_entitlements (
  vendor_id    uuid primary key references auth.users(id) on delete cascade,
  tier         text not null check (tier in ('free', 'starter', 'qkit', 'paid')),
  founder      boolean not null default false,
  stats_window text not null default '24h' check (stats_window in ('24h', '90d')),
  -- null with tier 'paid' means open until merqo's next push (legacy rows).
  valid_until  timestamptz,
  issued_at    timestamptz not null,
  updated_at   timestamptz not null default now()
);

alter table loopkit.vendor_entitlements enable row level security;

create policy vendor_entitlements_own_select on loopkit.vendor_entitlements
  for select using (vendor_id = (select auth.uid()));

grant select on loopkit.vendor_entitlements to authenticated;
grant all on loopkit.vendor_entitlements to service_role;

-- Applies a push only when it is newer than the stored one, so a delayed
-- retry can never overwrite a later state. Equal issued_at is a no-op too.
create or replace function loopkit.upsert_vendor_entitlement(
  p_vendor_id    uuid,
  p_tier         text,
  p_founder      boolean,
  p_stats_window text,
  p_valid_until  timestamptz,
  p_issued_at    timestamptz
) returns void
language sql
security definer
set search_path = ''
as $$
  insert into loopkit.vendor_entitlements as e
    (vendor_id, tier, founder, stats_window, valid_until, issued_at, updated_at)
  values
    (p_vendor_id, p_tier, p_founder, p_stats_window, p_valid_until, p_issued_at, pg_catalog.now())
  on conflict (vendor_id) do update set
    tier = excluded.tier,
    founder = excluded.founder,
    stats_window = excluded.stats_window,
    valid_until = excluded.valid_until,
    issued_at = excluded.issued_at,
    updated_at = pg_catalog.now()
  where e.issued_at < excluded.issued_at;
$$;

revoke all on function loopkit.upsert_vendor_entitlement(uuid, text, boolean, text, timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function loopkit.upsert_vendor_entitlement(uuid, text, boolean, text, timestamptz, timestamptz) to service_role;
