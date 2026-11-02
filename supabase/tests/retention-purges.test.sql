begin;
select no_plan();

-- Fixtures. Vendors 1 and 2, one stamp program each.
insert into auth.users(id,instance_id,aud,role,email) values
('00650000-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','retention-v1@test.local'),
('00650000-0000-4000-8000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','retention-v2@test.local');
insert into loopkit.programs(id,vendor_id,type,name,stamps_required,reward_text,config,active) values
('00650000-0000-4000-8000-000000000011','00650000-0000-4000-8000-000000000001','stamp','Coffee',10,'Coffee','{}',true),
('00650000-0000-4000-8000-000000000012','00650000-0000-4000-8000-000000000002','stamp','Tea',10,'Tea','{}',true);

-- A: inactive 30 months at vendor 1 (card, event, voucher, consent, earn event, host).
-- B: old card but a recent stamp event, so it must survive.
-- C: recent at both vendors, erased at vendor 1 only.
-- D: recent referral host at vendor 1; C is its guest.
insert into loopkit.cards(id,program_id,phone,stamp_count,card_token,created_at,updated_at) values
('00650000-0000-4000-8000-0000000000a1','00650000-0000-4000-8000-000000000011','+6591000001',3,'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',now()-interval '30 months',now()-interval '30 months'),
('00650000-0000-4000-8000-0000000000b1','00650000-0000-4000-8000-000000000011','+6591000002',3,'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',now()-interval '30 months',now()-interval '30 months'),
('00650000-0000-4000-8000-0000000000c1','00650000-0000-4000-8000-000000000011','+6591000003',2,'cccccccccccccccccccccccccccccccc',now(),now()),
('00650000-0000-4000-8000-0000000000c2','00650000-0000-4000-8000-000000000012','+6591000003',2,'dddddddddddddddddddddddddddddddd',now(),now()),
('00650000-0000-4000-8000-0000000000d1','00650000-0000-4000-8000-000000000011','+6591000004',1,'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',now(),now());
insert into loopkit.stamp_events(card_id,kind,created_at) values
('00650000-0000-4000-8000-0000000000a1','stamp',now()-interval '30 months'),
('00650000-0000-4000-8000-0000000000b1','stamp',now()-interval '1 day'),
('00650000-0000-4000-8000-0000000000c1','stamp',now()),
('00650000-0000-4000-8000-0000000000c2','stamp',now());
insert into loopkit.reward_vouchers(card_id,program_id,reward_text,earned_at,updated_at) values
('00650000-0000-4000-8000-0000000000a1','00650000-0000-4000-8000-000000000011','Coffee',now()-interval '30 months',now()-interval '30 months'),
('00650000-0000-4000-8000-0000000000c1','00650000-0000-4000-8000-000000000011','Coffee',now(),now()),
('00650000-0000-4000-8000-0000000000c2','00650000-0000-4000-8000-000000000012','Tea',now(),now());
insert into loopkit.marketing_consents(vendor_id,phone,granted,source,recorded_at) values
('00650000-0000-4000-8000-000000000001','+6591000001',false,'card_view',now()-interval '30 months'),
('00650000-0000-4000-8000-000000000001','+6591000003',false,'card_view',now());
insert into loopkit.qkit_earn_events(order_id,vendor_id,card_id,created_at) values
('00650000-0000-4000-8000-0000000000e1','00650000-0000-4000-8000-000000000001','00650000-0000-4000-8000-0000000000a1',now()-interval '30 months'),
('00650000-0000-4000-8000-0000000000e2','00650000-0000-4000-8000-000000000001','00650000-0000-4000-8000-0000000000c1',now());
insert into loopkit.referral_hosts(id,vendor_id,program_id,host_phone,referral_code) values
('00650000-0000-4000-8000-0000000000f1','00650000-0000-4000-8000-000000000001','00650000-0000-4000-8000-000000000011','+6591000001','retention-host-a'),
('00650000-0000-4000-8000-0000000000f2','00650000-0000-4000-8000-000000000001','00650000-0000-4000-8000-000000000011','+6591000004','retention-host-d');
insert into loopkit.referral_credits(referral_host_id,guest_phone) values
('00650000-0000-4000-8000-0000000000f1','+6591000002'),
('00650000-0000-4000-8000-0000000000f2','+6591000003');
insert into loopkit.feedback(vendor_id,nps,message,created_at) values
('00650000-0000-4000-8000-000000000001',9,'old',now()-interval '30 months'),
('00650000-0000-4000-8000-000000000001',9,'recent',now()-interval '1 month');

-- The triggers stamp customers with the insert time; age the one customer
-- whose every signal is old.
update loopkit.customers set first_seen_at=now()-interval '30 months', last_seen_at=now()-interval '30 months'
where phone in ('+6591000001','+6591000002');
update loopkit.customers set first_seen_at=now()-interval '30 months', last_seen_at=now()-interval '1 day'
where phone='+6591000002';

-- Grants: only the service role may call the customer RPC; nobody but the
-- owner (pg_cron) may run the purges or helpers.
select ok(not has_function_privilege(r,'loopkit.purge_inactive_customers()','execute'),r||' cannot run the customer purge') from unnest(array['anon','authenticated','service_role']) r;
select ok(not has_function_privilege(r,'loopkit.purge_old_feedback()','execute'),r||' cannot run the feedback purge') from unnest(array['anon','authenticated','service_role']) r;
select ok(not has_function_privilege(r,'loopkit._erase_customer_data(uuid,text)','execute'),r||' cannot call the erase helper') from unnest(array['anon','authenticated','service_role']) r;
select ok(not has_function_privilege(r,'loopkit._customer_last_activity(uuid,text)','execute'),r||' cannot call the activity helper') from unnest(array['anon','authenticated','service_role']) r;
select ok(not has_function_privilege('anon','loopkit.customer_erase(uuid,text,text)','execute'),'anon cannot call customer_erase');
select ok(not has_function_privilege('authenticated','loopkit.customer_erase(uuid,text,text)','execute'),'authenticated cannot call customer_erase');
select ok(has_function_privilege('service_role','loopkit.customer_erase(uuid,text,text)','execute'),'service role can call customer_erase');

-- Cron registration is read through dynamic SQL so this file parses where
-- pg_cron is absent; without the extension the check is vacuously true.
select ok(
  case when exists (select 1 from pg_extension where extname='pg_cron')
    then (xpath('/row/c/text()', query_to_xml($q$select count(*) as c from cron.job where jobname in ('loopkit_purge_inactive_customers','loopkit_purge_feedback')$q$, false, true, '')))[1]::text::int = 2
    else true end,
  'both purge jobs are registered');
select ok(
  case when exists (select 1 from pg_extension where extname='pg_cron')
    then (xpath('/row/c/text()', query_to_xml($q$select count(*) as c from cron.job where jobname like 'loopkit_purge_%' and schedule ~ '^[0-9]+ 3 \* \* \*$'$q$, false, true, '')))[1]::text::int = 2
    else true end,
  'purge jobs run daily at 03:xx UTC');

-- Purges.
select is(loopkit._customer_last_activity('00650000-0000-4000-8000-000000000001','+6591000002')>now()-interval '2 days',true,'a recent stamp event counts as activity');
select is(loopkit.purge_old_feedback(),1,'one old feedback row purged');
select is((select message from loopkit.feedback),'recent','recent feedback kept');
select is(loopkit.purge_inactive_customers(),1,'one inactive customer purged');
select is((select count(*)::int from loopkit.cards where phone='+6591000001'),0,'inactive customer card gone');
select is((select count(*)::int from loopkit.customers where phone='+6591000001'),0,'inactive customer row gone');
select is((select count(*)::int from loopkit.stamp_events where card_id='00650000-0000-4000-8000-0000000000a1'),0,'stamp events cascaded');
select is((select count(*)::int from loopkit.reward_vouchers where card_id='00650000-0000-4000-8000-0000000000a1'),0,'vouchers cascaded');
select is((select count(*)::int from loopkit.marketing_consents where phone='+6591000001'),0,'consents cascaded');
select is((select count(*)::int from loopkit.qkit_earn_events where order_id='00650000-0000-4000-8000-0000000000e1'),0,'earn events removed');
select is((select count(*)::int from loopkit.referral_hosts where id='00650000-0000-4000-8000-0000000000f1'),0,'referral host removed');
select is((select count(*)::int from loopkit.referral_credits where referral_host_id='00650000-0000-4000-8000-0000000000f1'),0,'referral credits cascaded');
select is((select count(*)::int from loopkit.cards where phone in ('+6591000002','+6591000003','+6591000004')),4,'active customers keep their cards');
select is((select count(*)::int from loopkit.reward_vouchers),2,'active customers keep their vouchers');
select is(loopkit.purge_inactive_customers(),0,'a second run finds nothing to purge');

-- Customer erase.
set local role service_role;
select throws_ok($$select loopkit.customer_erase('00650000-0000-4000-8000-000000000001','+6591000003','ffffffffffffffffffffffffffffffff')$$,'P0001','customer proof required','a wrong token is rejected');
select throws_ok($$select loopkit.customer_erase('00650000-0000-4000-8000-000000000001','+6591000003','dddddddddddddddddddddddddddddddd')$$,'P0001','customer proof required','another vendor''s token is rejected');
select throws_ok($$select loopkit.customer_erase('00650000-0000-4000-8000-000000000001','+6591000003',null)$$,'P0001','customer proof required','a missing token is rejected');
select throws_ok($$select loopkit.customer_erase('00650000-0000-4000-8000-000000000001','not a phone','cccccccccccccccccccccccccccccccc')$$,'P0001','customer proof required','a malformed phone is rejected');
select is((select count(*)::int from loopkit.cards where phone='+6591000003'),2,'rejected calls erase nothing');
select is(loopkit.customer_erase('00650000-0000-4000-8000-000000000001','+6591000003','cccccccccccccccccccccccccccccccc'),true,'the right token erases');
reset role;
select is((select count(*)::int from loopkit.cards where phone='+6591000003' and program_id='00650000-0000-4000-8000-000000000011'),0,'erased customer card gone at that vendor');
select is((select count(*)::int from loopkit.customers where phone='+6591000003' and vendor_id='00650000-0000-4000-8000-000000000001'),0,'erased customer row gone at that vendor');
select is((select count(*)::int from loopkit.marketing_consents where phone='+6591000003'),0,'erased customer consents gone');
select is((select count(*)::int from loopkit.qkit_earn_events where order_id='00650000-0000-4000-8000-0000000000e2'),0,'erased customer earn events gone');
select is((select count(*)::int from loopkit.reward_vouchers where card_id='00650000-0000-4000-8000-0000000000c1'),0,'erased customer vouchers gone');
select is((select count(*)::int from loopkit.referral_credits where guest_phone='+6591000003'),0,'erased guest referral credit gone');
select is((select count(*)::int from loopkit.referral_hosts where id='00650000-0000-4000-8000-0000000000f2'),1,'the host the guest joined through is untouched');
select is((select count(*)::int from loopkit.cards where id='00650000-0000-4000-8000-0000000000c2'),1,'the same phone at another vendor is untouched');
select is((select count(*)::int from loopkit.reward_vouchers where card_id='00650000-0000-4000-8000-0000000000c2'),1,'the other vendor''s voucher is untouched');

select * from finish();
rollback;
