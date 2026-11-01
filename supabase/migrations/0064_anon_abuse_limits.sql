-- Per-host daily cap on referral credits (5 new guests per rolling 24 hours)
-- so one referral link cannot be farmed with throwaway numbers. Enforced in
-- the join path under the host row lock, so concurrent joins cannot overshoot.
-- Behaviour is otherwise identical to 0060.

-- Fixed-window limiter for anonymous customer actions (card check, earn
-- claim). No policies: only the definer function and service role touch it.
create table if not exists loopkit.rate_limits (
  key          text        not null,
  window_start timestamptz not null,
  count        int         not null default 0,
  primary key (key, window_start)
);
create index if not exists rate_limits_window_start_idx on loopkit.rate_limits (window_start);
alter table loopkit.rate_limits enable row level security;
revoke all on loopkit.rate_limits from public, anon, authenticated;
grant select, insert, update, delete on loopkit.rate_limits to service_role;

create or replace function loopkit.check_rate_limit(
  p_key text, p_limit int, p_window_seconds int
)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  v_window timestamptz;
  v_count int;
begin
  if p_key is null or pg_catalog.length(p_key) not between 1 and 255
     or p_limit is null or p_limit not between 1 and 100000
     or p_window_seconds is null or p_window_seconds not between 1 and 86400 then
    raise exception 'invalid rate limit parameters' using errcode = '22023';
  end if;

  v_window := pg_catalog.to_timestamp(
    pg_catalog.floor(extract(epoch from pg_catalog.now()) / p_window_seconds) * p_window_seconds
  );
  insert into loopkit.rate_limits (key, window_start, count)
    values (p_key, v_window, 1)
    on conflict (key, window_start) do update
      set count = least(loopkit.rate_limits.count::bigint + 1, 2147483647)::int
    returning count into v_count;

  -- Cheap probabilistic cleanup keeps the table small without a cron job.
  if pg_catalog.random() < 0.02 then
    delete from loopkit.rate_limits
      where window_start < pg_catalog.now() - interval '1 day';
  end if;
  return v_count <= p_limit;
end;
$$;
revoke all on function loopkit.check_rate_limit(text, int, int) from public, anon, authenticated;
grant execute on function loopkit.check_rate_limit(text, int, int) to service_role;

create or replace function loopkit.vendor_join_referred(
  p_vendor uuid, p_phone text, p_referral_code text
)
returns table (
  program_id uuid, name text, type text, config jsonb, state jsonb,
  stamp_count int, card_token text, reward_text text, stamps_required int,
  expiry_days int, cycle_started_at timestamptz, active boolean,
  replaced_by_name text, replaced_by_stamp_count int,
  voucher_expires_at timestamptz, vendor_avatar_url text, referral_credit jsonb
)
language plpgsql security definer set search_path = '' as $$
declare
  v_referral loopkit.referral_hosts%rowtype;
  v_program  loopkit.programs%rowtype;
  v_card     loopkit.cards%rowtype;
  v_credit   jsonb := null;
  v_prev int;
  v_expired int;
  v_crossings int;
  v_capped boolean := false;
  v_found boolean;
begin
  perform loopkit.vendor_join_enroll(p_vendor, p_phone);

  select rh.* into v_referral from loopkit.referral_hosts rh
    where rh.referral_code = p_referral_code and rh.vendor_id = p_vendor
      and exists (select 1 from loopkit.programs p
        where p.id = rh.program_id and p.vendor_id = p_vendor and p.active) for update;

  -- A new guest past the host's daily cap earns nothing; a guest already reserved can still retry.
  v_found := found;
  if v_found then
    v_capped := not exists (select 1 from loopkit.referral_credits rc
        where rc.referral_host_id = v_referral.id and rc.guest_phone = p_phone)
      and (select pg_catalog.count(*) from loopkit.referral_credits rc
        where rc.referral_host_id = v_referral.id
          and rc.created_at > pg_catalog.now() - interval '24 hours') >= 5;
  end if;

  if v_found and not v_capped and v_referral.host_phone <> p_phone then
    insert into loopkit.referral_credits (referral_host_id, guest_phone)
      values (v_referral.id, p_phone)
      on conflict (referral_host_id, guest_phone) do nothing;

    if found then
      update loopkit.referral_hosts rh set guest_count = rh.guest_count + 1
        where rh.id = v_referral.id;
    end if;
    select p.* into v_program from loopkit.programs p
    where p.id=v_referral.program_id and p.vendor_id=p_vendor and p.active for share;
    if not found then raise exception 'invalid referral program'; end if;
    perform 1 from loopkit.referral_credits rc where rc.referral_host_id=v_referral.id and rc.guest_phone=p_phone and rc.credited_at is null for update;
    if found then
      perform loopkit.enroll_card(v_referral.program_id, v_referral.host_phone);


      if v_program.type = 'stamp' then
        insert into loopkit.cards (program_id, phone, stamp_count)
        values (v_referral.program_id, v_referral.host_phone, 0)
        on conflict on constraint cards_program_id_phone_key do nothing;
        select c.* into v_card from loopkit.cards c
        where c.program_id = v_referral.program_id and c.phone = v_referral.host_phone
        for update;
        v_expired := loopkit._expire_stale_vouchers_unchecked(v_card.id);
        v_prev := greatest(v_card.stamp_count - v_expired * v_program.stamps_required, 0);
        update loopkit.cards c set stamp_count = v_prev + 1, updated_at = now()
        where c.id = v_card.id returning c.* into v_card;
        v_crossings := loopkit.count_threshold_crossings(v_prev, v_card.stamp_count, v_program.stamps_required);
        if v_crossings > 0 then
          perform loopkit._grant_reward_voucher_unchecked(v_card.id, v_program.reward_text, v_program.reward_expiry_days, v_crossings, false);
        end if;
        insert into loopkit.stamp_events (card_id, kind) values (v_card.id, 'stamp');
        update loopkit.referral_credits rc set credited_at = now()
          where rc.referral_host_id = v_referral.id and rc.guest_phone = p_phone;
      else
        select c.* into v_card from loopkit.cards c
          where c.program_id = v_referral.program_id and c.phone = v_referral.host_phone;

        v_credit := jsonb_build_object(
          'pending', true,
          'referralHostId', v_referral.id,
          'guestPhone', p_phone,
          'programId', v_program.id,
          'programType', v_program.type,
          'programConfig', v_program.config,
          'stampsRequired', v_program.stamps_required,
          'rewardText', v_program.reward_text,
          'hostPhone', v_referral.host_phone,
          'state', coalesce(v_card.state, '{}'::jsonb),
          'stampCount', coalesce(v_card.stamp_count, 0),
          'rewardCount', coalesce(v_card.reward_count, 0)
        );
      end if;
    end if;
  end if;

  return query
    select vjc.*, v_credit from loopkit.vendor_join_cards(p_vendor, p_phone) vjc;
end;
$$;
