-- Whether a vendor offers stamps for qkit orders, and for which program.
-- qkit's order page calls this with its service-role key instead of an HTTP
-- route, so it does not need loopkit's metrics secret (the per-kit secrets
-- differ, which is why the route never answered). Returns only the two fields
-- the "Earn a stamp" link shows.
create or replace function loopkit.qkit_earn_offer(p_vendor uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (
      select jsonb_build_object('enabled', c.enabled, 'program_name', p.name)
      from loopkit.qkit_earn_config c
      join loopkit.programs p on p.id = c.program_id
      where c.vendor_id = p_vendor
    ),
    jsonb_build_object('enabled', false)
  );
$$;

revoke all on function loopkit.qkit_earn_offer(uuid) from public, anon, authenticated;
grant execute on function loopkit.qkit_earn_offer(uuid) to service_role;
