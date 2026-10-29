begin;
select no_plan();

select has_index('loopkit', 'admin_audit', 'admin_audit_admin_id_idx', 'loopkit.admin_audit (admin_id) is indexed');
select has_index('loopkit', 'feedback', 'feedback_vendor_id_idx', 'loopkit.feedback (vendor_id) is indexed');
select has_index('loopkit', 'programs', 'programs_replaced_by_idx', 'loopkit.programs (replaced_by) is indexed');
select has_index('loopkit', 'qkit_earn_config', 'qkit_earn_config_program_id_idx', 'loopkit.qkit_earn_config (program_id) is indexed');
select has_index('loopkit', 'qkit_earn_events', 'qkit_earn_events_card_id_idx', 'loopkit.qkit_earn_events (card_id) is indexed');
select has_index('loopkit', 'referral_hosts', 'referral_hosts_program_id_idx', 'loopkit.referral_hosts (program_id) is indexed');
select has_index('loopkit', 'reward_vouchers', 'reward_vouchers_program_id_idx', 'loopkit.reward_vouchers (program_id) is indexed');
select has_index('loopkit', 'upgrade_requests', 'upgrade_requests_vendor_id_idx', 'loopkit.upgrade_requests (vendor_id) is indexed');

select is(
  (select count(*)::int from pg_tables where schemaname = 'loopkit' and not rowsecurity),
  0, 'every loopkit table has row level security on');

-- vendor_pro: own row or admin; pricing: any signed-in vendor; qkit_earn_events: server-only.
insert into auth.users (id, instance_id, aud, role, email) values
  ('a0000000-0000-0000-0000-00000000a201', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'hygiene-a@test.local'),
  ('a0000000-0000-0000-0000-00000000a202', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'hygiene-b@test.local');
insert into loopkit.vendor_pro (vendor_id) values ('a0000000-0000-0000-0000-00000000a201');

select ok(not has_table_privilege(r, 'loopkit.qkit_earn_events', p), r || ' has no ' || p || ' on loopkit.qkit_earn_events')
from unnest(array['anon', 'authenticated']) r, unnest(array['SELECT', 'INSERT', 'UPDATE', 'DELETE']) p;
select ok(not has_table_privilege('anon', t, p), 'anon has no ' || p || ' on ' || t)
from unnest(array['loopkit.vendor_pro', 'loopkit.pricing']) t, unnest(array['SELECT', 'INSERT', 'UPDATE', 'DELETE']) p;
select ok(not has_table_privilege('authenticated', t, p), 'authenticated has no ' || p || ' on ' || t)
from unnest(array['loopkit.vendor_pro', 'loopkit.pricing']) t, unnest(array['INSERT', 'UPDATE', 'DELETE']) p;

set local role anon;
select set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
select throws_ok($$ select 1 from loopkit.qkit_earn_events $$, '42501', null, 'anon cannot read loopkit.qkit_earn_events');
select throws_ok($$ select 1 from loopkit.pricing $$, '42501', null, 'anon cannot read loopkit.pricing');
reset role;

set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', 'a0000000-0000-0000-0000-00000000a202', 'role', 'authenticated')::text, true);
select is((select count(*)::int from loopkit.vendor_pro where vendor_id = 'a0000000-0000-0000-0000-00000000a201'), 0, 'another vendor cannot see a Pro row');
select is((select count(*)::int from loopkit.pricing), 1, 'a signed-in vendor reads the price');
select throws_ok($$ select 1 from loopkit.qkit_earn_events $$, '42501', null, 'authenticated cannot read loopkit.qkit_earn_events');
select set_config('request.jwt.claims', json_build_object('sub', 'a0000000-0000-0000-0000-00000000a201', 'role', 'authenticated')::text, true);
select is((select count(*)::int from loopkit.vendor_pro where vendor_id = 'a0000000-0000-0000-0000-00000000a201'), 1, 'a vendor reads their own Pro row');
reset role;

select * from finish();
rollback;
