-- PDPA marketing consent: an append-only log of opt-ins and withdrawals per
-- vendor and customer phone. The latest row decides the current state.
create table loopkit.marketing_consents (
  id              bigint generated always as identity primary key,
  vendor_id       uuid not null,
  phone           text not null check (phone ~ '^\+65[3689][0-9]{7}$'),
  granted         boolean not null,
  wording_version text,
  wording_text    text,
  source          text not null
                  check (source in ('card_check','earn','card_view','vendor_recorded')),
  recorded_at     timestamptz not null default now(),
  constraint marketing_consents_grant_has_wording check (
    not granted or (
      coalesce(length(btrim(wording_version)), 0) between 1 and 40
      and coalesce(length(btrim(wording_text)), 0) between 1 and 500
    )
  ),
  constraint marketing_consents_vendor_grants_nothing check (
    not (granted and source = 'vendor_recorded')
  ),
  foreign key (vendor_id, phone)
    references loopkit.customers(vendor_id, phone) on delete cascade
);

create index marketing_consents_current_idx
  on loopkit.marketing_consents (vendor_id, phone, recorded_at desc, id desc);

alter table loopkit.marketing_consents enable row level security;

create policy marketing_consents_own on loopkit.marketing_consents
  for select to authenticated using (vendor_id = (select auth.uid()));

revoke all on table loopkit.marketing_consents from public, anon, authenticated, service_role;
grant select on table loopkit.marketing_consents to authenticated;

create or replace function loopkit._forbid_marketing_consent_update()
returns trigger language plpgsql set search_path = '' as $$
begin
  raise exception 'marketing consent records are append-only';
end;
$$;

create trigger marketing_consents_append_only
  before update on loopkit.marketing_consents
  for each row execute function loopkit._forbid_marketing_consent_update();

create or replace function loopkit._marketing_consent_granted(p_vendor uuid, p_phone text)
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((
    select m.granted from loopkit.marketing_consents m
    where m.vendor_id = p_vendor and m.phone = p_phone
    order by m.recorded_at desc, m.id desc limit 1
  ), false);
$$;
revoke all on function loopkit._marketing_consent_granted(uuid,text) from public, anon, authenticated, service_role;

-- Customer-side writes need the same card-token proof as every other customer RPC.
create or replace function loopkit.customer_set_marketing_consent(
  p_vendor uuid, p_phone text, p_token text, p_granted boolean,
  p_wording_version text, p_wording_text text, p_source text
) returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if p_granted is null or p_source is null
    or p_source not in ('card_check','earn','card_view') then
    raise exception 'invalid consent';
  end if;
  perform loopkit._require_customer_capability(p_vendor, p_phone, p_token);
  insert into loopkit.marketing_consents
    (vendor_id, phone, granted, wording_version, wording_text, source)
  values (
    p_vendor, p_phone, p_granted,
    case when p_granted then p_wording_version end,
    case when p_granted then p_wording_text end,
    p_source
  );
  return p_granted;
end;
$$;
revoke all on function loopkit.customer_set_marketing_consent(uuid,text,text,boolean,text,text,text) from public, anon, authenticated, service_role;
grant execute on function loopkit.customer_set_marketing_consent(uuid,text,text,boolean,text,text,text) to service_role;

create or replace function loopkit.customer_marketing_consent(p_vendor uuid, p_phone text, p_token text)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  perform loopkit._require_customer_capability(p_vendor, p_phone, p_token);
  return loopkit._marketing_consent_granted(p_vendor, p_phone);
end;
$$;
revoke all on function loopkit.customer_marketing_consent(uuid,text,text) from public, anon, authenticated, service_role;
grant execute on function loopkit.customer_marketing_consent(uuid,text,text) to service_role;

-- A vendor may only record a withdrawal the customer asked for in person, never a grant.
create or replace function loopkit.vendor_withdraw_marketing_consent(p_phone text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_vendor uuid := auth.uid();
begin
  if v_vendor is null then raise exception 'not authorized'; end if;
  if not exists (select 1 from loopkit.customers where vendor_id = v_vendor and phone = p_phone) then
    raise exception 'not authorized';
  end if;
  insert into loopkit.marketing_consents (vendor_id, phone, granted, source)
  values (v_vendor, p_phone, false, 'vendor_recorded');
end;
$$;
revoke all on function loopkit.vendor_withdraw_marketing_consent(text) from public, anon, authenticated, service_role;
grant execute on function loopkit.vendor_withdraw_marketing_consent(text) to authenticated;
