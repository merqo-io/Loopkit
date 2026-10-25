begin;
select plan(9);

select ok(
  not has_function_privilege('anon', 'loopkit.qkit_earn_offer(uuid)', 'execute'),
  'anon cannot read a vendor''s earn offer'
);
select ok(
  not has_function_privilege('authenticated', 'loopkit.qkit_earn_offer(uuid)', 'execute'),
  'a signed-in vendor cannot read another vendor''s earn offer'
);
select ok(
  has_function_privilege('service_role', 'loopkit.qkit_earn_offer(uuid)', 'execute'),
  'the service role can read an earn offer'
);
select ok(
  (select prosecdef and proconfig @> array['search_path=""'] from pg_proc
    where oid = 'loopkit.qkit_earn_offer(uuid)'::regprocedure),
  'security definer with an empty search_path'
);

insert into auth.users(id, instance_id, aud, role, email) values
  ('00620000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'earn-offer-on@test.local'),
  ('00620000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'earn-offer-off@test.local');
insert into loopkit.programs(id, vendor_id, type, name, stamps_required, reward_text, config, active) values
  ('00620000-0000-0000-0000-000000000011', '00620000-0000-0000-0000-000000000001', 'stamp', 'Kopi Club', 10, 'Coffee', '{}', true),
  ('00620000-0000-0000-0000-000000000012', '00620000-0000-0000-0000-000000000002', 'stamp', 'Tea Club', 10, 'Tea', '{}', true);
insert into loopkit.qkit_earn_config(vendor_id, program_id, enabled) values
  ('00620000-0000-0000-0000-000000000001', '00620000-0000-0000-0000-000000000011', true),
  ('00620000-0000-0000-0000-000000000002', '00620000-0000-0000-0000-000000000012', false);

set local role service_role;
select is(
  loopkit.qkit_earn_offer('00620000-0000-0000-0000-000000000001'),
  '{"enabled": true, "program_name": "Kopi Club"}'::jsonb,
  'an enabled vendor offers its program by name'
);
select is(
  (loopkit.qkit_earn_offer('00620000-0000-0000-0000-000000000002')->>'enabled')::boolean,
  false,
  'a vendor who turned earning off is not offering'
);
select is(
  loopkit.qkit_earn_offer('00620000-0000-0000-0000-000000000099'),
  '{"enabled": false}'::jsonb,
  'an unknown vendor offers nothing'
);
select is(
  loopkit.qkit_earn_offer('00620000-0000-0000-0000-000000000001') ? 'phone',
  false,
  'the answer carries no customer data'
);
reset role;
select is(
  (select count(*) from loopkit.qkit_earn_events),
  0::bigint,
  'reading an offer writes nothing'
);

select * from finish();
rollback;
