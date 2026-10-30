-- Index every foreign key column (Supabase advisor: unindexed foreign keys).
create index if not exists admin_audit_admin_id_idx on loopkit.admin_audit (admin_id);
create index if not exists feedback_vendor_id_idx on loopkit.feedback (vendor_id);
create index if not exists programs_replaced_by_idx on loopkit.programs (replaced_by);
create index if not exists qkit_earn_config_program_id_idx on loopkit.qkit_earn_config (program_id);
create index if not exists qkit_earn_events_card_id_idx on loopkit.qkit_earn_events (card_id);
create index if not exists referral_hosts_program_id_idx on loopkit.referral_hosts (program_id);
create index if not exists reward_vouchers_program_id_idx on loopkit.reward_vouchers (program_id);
create index if not exists upgrade_requests_vendor_id_idx on loopkit.upgrade_requests (vendor_id);

-- No policies: only the security definer earn RPCs and the service role touch it.
alter table loopkit.qkit_earn_events enable row level security;
