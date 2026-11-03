begin;
select no_plan();

insert into auth.users (id, instance_id, aud, role, email) values
  ('a0000000-0000-0000-0000-00000000e101', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ent-a@test.local'),
  ('a0000000-0000-0000-0000-00000000e102', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ent-b@test.local');

select ok(not has_function_privilege('authenticated', 'loopkit.upsert_vendor_entitlement(uuid, text, boolean, text, timestamptz, timestamptz)', 'EXECUTE'), 'authenticated cannot run the entitlement upsert');
select ok(has_function_privilege('service_role', 'loopkit.upsert_vendor_entitlement(uuid, text, boolean, text, timestamptz, timestamptz)', 'EXECUTE'), 'service_role can run the entitlement upsert');
select ok(not has_table_privilege('authenticated', 'loopkit.vendor_entitlements', 'INSERT'), 'authenticated cannot insert entitlements');
select ok(not has_table_privilege('anon', 'loopkit.vendor_entitlements', 'SELECT'), 'anon cannot read entitlements');

select loopkit.upsert_vendor_entitlement('a0000000-0000-0000-0000-00000000e101', 'paid', false, '90d', null, '2026-11-03T00:00:00Z');
select is((select tier from loopkit.vendor_entitlements where vendor_id = 'a0000000-0000-0000-0000-00000000e101'), 'paid', 'first push is stored');

select loopkit.upsert_vendor_entitlement('a0000000-0000-0000-0000-00000000e101', 'free', false, '24h', null, '2026-11-02T00:00:00Z');
select is((select tier from loopkit.vendor_entitlements where vendor_id = 'a0000000-0000-0000-0000-00000000e101'), 'paid', 'an older issued_at is a no-op');

select loopkit.upsert_vendor_entitlement('a0000000-0000-0000-0000-00000000e101', 'free', false, '24h', null, '2026-11-03T00:00:00Z');
select is((select tier from loopkit.vendor_entitlements where vendor_id = 'a0000000-0000-0000-0000-00000000e101'), 'paid', 'an equal issued_at is a no-op');

select ok(loopkit.is_pro('a0000000-0000-0000-0000-00000000e101'), 'paid with no valid_until is Pro');

select loopkit.upsert_vendor_entitlement('a0000000-0000-0000-0000-00000000e101', 'free', false, '24h', null, '2026-11-04T00:00:00Z');
select is((select tier from loopkit.vendor_entitlements where vendor_id = 'a0000000-0000-0000-0000-00000000e101'), 'free', 'a newer issued_at replaces the row');
select ok(not loopkit.is_pro('a0000000-0000-0000-0000-00000000e101'), 'a free tier is not Pro');

select loopkit.upsert_vendor_entitlement('a0000000-0000-0000-0000-00000000e102', 'paid', false, '90d', now() - interval '1 day', '2026-11-03T00:00:00Z');
select ok(not loopkit.is_pro('a0000000-0000-0000-0000-00000000e102'), 'a lapsed valid_until is not Pro without a new push');

set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', 'a0000000-0000-0000-0000-00000000e101', 'role', 'authenticated')::text, true);
select is((select count(*)::int from loopkit.vendor_entitlements), 1, 'a vendor reads only their own entitlement row');
reset role;

select * from finish();
rollback;
