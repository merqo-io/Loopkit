-- PDPA retention and erasure (CCSP finding, domain 6): loopkit kept customer
-- phone numbers, cards, stamp history, vouchers, referral rows and marketing
-- consents forever, with no way for an end customer to delete them.
--
-- Retention periods. The privacy notice does not state a period for these
-- tables, so these are conservative defaults the owner must confirm and the
-- privacy copy must then state:
--   inactive customers  every row for a (vendor, phone) pair is deleted once
--                       its last activity is older than 24 months. Last
--                       activity is the latest of the customer row's
--                       timestamps and the pair's card, stamp event, voucher,
--                       marketing consent and referral host or credit
--                       timestamps. A pair holding an active voucher that has
--                       not expired is never purged, however long its expiry.
--   feedback            deleted 24 months after created_at
-- Out of scope: admin_audit (5-year policy, see AGENTS.md), vendor data and
-- legal acceptances.
--
-- Safe to re-run: functions are create-or-replace and each job is
-- unscheduled before being scheduled again.

do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    create extension if not exists pg_cron;
  end if;
end;
$$;

-- Latest sign of life for one (vendor, phone) pair; '-infinity' when the
-- pair has no rows at all.
create or replace function loopkit._customer_last_activity(p_vendor uuid, p_phone text)
returns timestamptz
language sql
stable
security definer
set search_path = ''
as $$
  select case when exists (
      select 1 from loopkit.reward_vouchers rv
      join loopkit.cards c on c.id = rv.card_id
      join loopkit.programs p on p.id = c.program_id
      where p.vendor_id = p_vendor and c.phone = p_phone
        and rv.status = 'active' and (rv.expires_at is null or rv.expires_at > pg_catalog.now())
    ) then pg_catalog.now() else greatest(
    coalesce((select pg_catalog.max(greatest(cu.first_seen_at, cu.last_seen_at))
      from loopkit.customers cu
      where cu.vendor_id = p_vendor and cu.phone = p_phone), '-infinity'::timestamptz),
    coalesce((select pg_catalog.max(greatest(c.created_at, c.updated_at))
      from loopkit.cards c join loopkit.programs p on p.id = c.program_id
      where p.vendor_id = p_vendor and c.phone = p_phone), '-infinity'::timestamptz),
    coalesce((select pg_catalog.max(se.created_at)
      from loopkit.stamp_events se
      join loopkit.cards c on c.id = se.card_id
      join loopkit.programs p on p.id = c.program_id
      where p.vendor_id = p_vendor and c.phone = p_phone), '-infinity'::timestamptz),
    coalesce((select pg_catalog.max(greatest(rv.earned_at, rv.updated_at, rv.redeemed_at))
      from loopkit.reward_vouchers rv
      join loopkit.cards c on c.id = rv.card_id
      join loopkit.programs p on p.id = c.program_id
      where p.vendor_id = p_vendor and c.phone = p_phone), '-infinity'::timestamptz),
    coalesce((select pg_catalog.max(m.recorded_at)
      from loopkit.marketing_consents m
      where m.vendor_id = p_vendor and m.phone = p_phone), '-infinity'::timestamptz),
    coalesce((select pg_catalog.max(rh.created_at)
      from loopkit.referral_hosts rh
      where rh.vendor_id = p_vendor and rh.host_phone = p_phone), '-infinity'::timestamptz),
    coalesce((select pg_catalog.max(rc.created_at)
      from loopkit.referral_credits rc
      join loopkit.referral_hosts rh on rh.id = rc.referral_host_id
      where rh.vendor_id = p_vendor and (rh.host_phone = p_phone or rc.guest_phone = p_phone)), '-infinity'::timestamptz)
  ) end;
$$;

-- Removes everything loopkit holds about one phone at one vendor. Stamp
-- events and vouchers cascade from cards, consents cascade from customers,
-- referral credits cascade from referral hosts. qkit_earn_events has no
-- cascade, and referral credits where the phone was a guest hang off other
-- people's hosts, so both are deleted explicitly first.
create or replace function loopkit._erase_customer_data(p_vendor uuid, p_phone text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('customer:' || p_vendor::text || ':' || p_phone, 0));

  delete from loopkit.qkit_earn_events e
  using loopkit.cards c, loopkit.programs p
  where e.card_id = c.id and p.id = c.program_id
    and p.vendor_id = p_vendor and c.phone = p_phone;

  delete from loopkit.referral_credits rc
  using loopkit.referral_hosts rh
  where rc.referral_host_id = rh.id
    and rh.vendor_id = p_vendor and rc.guest_phone = p_phone;

  delete from loopkit.referral_hosts
  where vendor_id = p_vendor and host_phone = p_phone;

  delete from loopkit.cards c
  using loopkit.programs p
  where p.id = c.program_id and p.vendor_id = p_vendor and c.phone = p_phone;

  delete from loopkit.customers
  where vendor_id = p_vendor and phone = p_phone;
end;
$$;
revoke all on function loopkit._customer_last_activity(uuid, text) from public, anon, authenticated, service_role;
revoke all on function loopkit._erase_customer_data(uuid, text) from public, anon, authenticated, service_role;

create or replace function loopkit.purge_inactive_customers()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_cutoff timestamptz := pg_catalog.now() - interval '24 months';
  v_count integer := 0;
  v_pair record;
begin
  -- Bounded per run so the advisory locks taken below stay few; a backlog
  -- drains over successive nights. The pre-filter uses indexed-or-cheap
  -- timestamps so the full activity check only runs on plausible candidates.
  for v_pair in
    select cand.vendor_id, cand.phone
    from (
      select cu.vendor_id, cu.phone from loopkit.customers cu
      where cu.last_seen_at < v_cutoff
      union
      select p.vendor_id, c.phone
      from loopkit.cards c join loopkit.programs p on p.id = c.program_id
      where c.updated_at < v_cutoff
      union
      select rh.vendor_id, rh.host_phone from loopkit.referral_hosts rh
      where rh.created_at < v_cutoff
    ) cand
    where loopkit._customer_last_activity(cand.vendor_id, cand.phone) < v_cutoff
    limit 500
  loop
    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended('customer:' || v_pair.vendor_id::text || ':' || v_pair.phone, 0));
    -- Vendor-side stamp and redeem paths lock the card row (and a
    -- program:phone advisory key), not the customer key above. Locking the
    -- pair's hosts then cards makes a concurrent visit commit first or wait,
    -- and the re-check below then sees it. Hosts come first to match
    -- vendor_join_referred (host row, then card row) and avoid a deadlock.
    -- Residual window: a first visit inserting a brand-new card has no row to
    -- lock, so it can race the delete; the customer then simply re-enrolls.
    perform 1 from loopkit.referral_hosts rh
      where rh.vendor_id = v_pair.vendor_id and rh.host_phone = v_pair.phone
      order by rh.id for update;
    perform 1 from loopkit.cards c join loopkit.programs p on p.id = c.program_id
      where p.vendor_id = v_pair.vendor_id and c.phone = v_pair.phone
      order by c.id for update of c;
    if loopkit._customer_last_activity(v_pair.vendor_id, v_pair.phone) < v_cutoff then
      perform loopkit._erase_customer_data(v_pair.vendor_id, v_pair.phone);
      v_count := v_count + 1;
    end if;
  end loop;
  return v_count;
end;
$$;

create or replace function loopkit.purge_old_feedback()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  delete from loopkit.feedback
  where created_at < pg_catalog.now() - interval '24 months';
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function loopkit.purge_inactive_customers() from public, anon, authenticated, service_role;
revoke all on function loopkit.purge_old_feedback() from public, anon, authenticated, service_role;

-- Customer self-erase. The card token is the credential, exactly as for the
-- other customer RPCs; a phone alone is never enough. Erases this vendor's
-- data only.
create or replace function loopkit.customer_erase(p_vendor uuid, p_phone text, p_token text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_vendor is null or p_phone is null or p_token is null
     or p_phone !~ '^\+65[3689][0-9]{7}$' then
    raise exception 'customer proof required';
  end if;
  perform loopkit._require_customer_capability(p_vendor, p_phone, p_token);
  perform loopkit._erase_customer_data(p_vendor, p_phone);
  return true;
end;
$$;
revoke all on function loopkit.customer_erase(uuid, text, text) from public, anon, authenticated, service_role;
grant execute on function loopkit.customer_erase(uuid, text, text) to service_role;

-- Skipped where pg_cron is unavailable; the functions above still exist for
-- manual runs.
do $$
declare
  v_job record;
begin
  if not exists (select 1 from pg_extension where extname = 'pg_cron') then
    raise notice 'pg_cron not installed; retention purges not scheduled';
    return;
  end if;

  for v_job in
    select * from (values
      ('loopkit_purge_inactive_customers', '40 3 * * *', 'select loopkit.purge_inactive_customers()'),
      ('loopkit_purge_feedback', '45 3 * * *', 'select loopkit.purge_old_feedback()')
    ) as j(name, schedule, command)
  loop
    if exists (select 1 from cron.job where jobname = v_job.name) then
      perform cron.unschedule(v_job.name);
    end if;
    perform cron.schedule(v_job.name, v_job.schedule, v_job.command);
  end loop;
end;
$$;
