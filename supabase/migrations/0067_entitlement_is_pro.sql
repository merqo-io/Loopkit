-- 0067 — Pro becomes a cache of merqo's entitlement. Existing vendor_pro rows
-- are carried over as paid with no expiry (open until merqo's next push),
-- then is_pro reads the cache instead. Name and signature are unchanged, so
-- the RLS policies and create_program callers keep working.
--
-- Merqo has no cron, so a lapsed subscription must stop counting without a
-- new push: paid means tier 'paid' and (valid_until is null or in the future).

insert into loopkit.vendor_entitlements (vendor_id, tier, founder, stats_window, valid_until, issued_at)
select vendor_id, 'paid', false, '90d', null, created_at
from loopkit.vendor_pro
on conflict (vendor_id) do nothing;

create or replace function loopkit.is_pro(p_uid uuid)
returns boolean language sql security definer stable set search_path = '' as $$
  select exists (
    select 1 from loopkit.vendor_entitlements e
    where e.vendor_id = p_uid
      and e.tier = 'paid'
      and (e.valid_until is null or e.valid_until > pg_catalog.now())
  );
$$;
