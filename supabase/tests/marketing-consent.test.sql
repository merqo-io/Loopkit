begin;
select plan(17);
insert into auth.users(id,instance_id,aud,role,email) values
('a1111111-1111-4111-8111-111111111111','00000000-0000-0000-0000-000000000000','authenticated','authenticated','consent-owner@test.local'),
('a2222222-2222-4222-8222-222222222222','00000000-0000-0000-0000-000000000000','authenticated','authenticated','consent-foreign@test.local');
insert into loopkit.programs(id,vendor_id,type,name,stamps_required,reward_text,config,active) values
('a3333333-3333-4333-8333-333333333333','a1111111-1111-4111-8111-111111111111','stamp','Coffee',10,'Coffee','{}',true);
insert into loopkit.cards(id,program_id,phone,stamp_count,card_token) values
('a5555555-5555-4555-8555-555555555555','a3333333-3333-4333-8333-333333333333','+6593234561',1,'33333333333333333333333333333333');

select ok(not has_function_privilege('anon','loopkit.customer_set_marketing_consent(uuid,text,text,boolean,text,text,text)','EXECUTE'),'anon cannot record consent');
select ok(not has_function_privilege('authenticated','loopkit.customer_set_marketing_consent(uuid,text,text,boolean,text,text,text)','EXECUTE'),'vendors cannot record customer consent');
select ok(not has_table_privilege('authenticated','loopkit.marketing_consents','INSERT'),'no direct client insert');
select ok(not has_table_privilege('service_role','loopkit.marketing_consents','DELETE'),'service role cannot delete consent history');

set local role service_role;
select is(loopkit.customer_marketing_consent('a1111111-1111-4111-8111-111111111111','+6593234561','33333333333333333333333333333333'),false,'no row means not opted in');
select throws_ok($$select loopkit.customer_set_marketing_consent('a1111111-1111-4111-8111-111111111111','+6593234561','invalid',true,'v1','text','card_check')$$,'P0001','customer proof required','grant requires proof');
select throws_ok($$select loopkit.customer_set_marketing_consent('a1111111-1111-4111-8111-111111111111','+6593234561','33333333333333333333333333333333',true,'v1','text','vendor_recorded')$$,'P0001','invalid consent','customer cannot claim vendor source');
select throws_ok($$select loopkit.customer_set_marketing_consent('a1111111-1111-4111-8111-111111111111','+6593234561','33333333333333333333333333333333',true,null,null,'card_check')$$,'23514',null,'grant without wording rejected');
select is(loopkit.customer_set_marketing_consent('a1111111-1111-4111-8111-111111111111','+6593234561','33333333333333333333333333333333',true,'v1','Yes, Coffee may send me offers','card_check'),true,'proved grant recorded');
select is(loopkit.customer_marketing_consent('a1111111-1111-4111-8111-111111111111','+6593234561','33333333333333333333333333333333'),true,'grant is current');
reset role;

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"a2222222-2222-4222-8222-222222222222","role":"authenticated"}',true);
select is((select count(*) from loopkit.marketing_consents),0::bigint,'foreign vendor sees no consent rows');
select throws_ok($$select loopkit.vendor_withdraw_marketing_consent('+6593234561')$$,'P0001','not authorized','foreign vendor cannot withdraw');
select set_config('request.jwt.claims','{"sub":"a1111111-1111-4111-8111-111111111111","role":"authenticated"}',true);
select is((select wording_text from loopkit.marketing_consents),'Yes, Coffee may send me offers','owner reads wording snapshot');
select lives_ok($$select loopkit.vendor_withdraw_marketing_consent('+6593234561')$$,'owner records withdrawal');
reset role;

set local role service_role;
select is(loopkit.customer_marketing_consent('a1111111-1111-4111-8111-111111111111','+6593234561','33333333333333333333333333333333'),false,'withdrawal takes effect immediately');
reset role;
select throws_ok($$update loopkit.marketing_consents set granted=true$$,'P0001','marketing consent records are append-only','history cannot be rewritten');
select is((select count(*) from loopkit.marketing_consents where phone='+6593234561'),2::bigint,'both events retained');
select * from finish();
rollback;
