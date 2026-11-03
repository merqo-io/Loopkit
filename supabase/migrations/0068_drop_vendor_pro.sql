-- 0068 — vendor_pro is replaced by vendor_entitlements (0066, 0067). Apply
-- 0066 to 0068 together so no vendor's Pro state is lost in between.

drop table loopkit.vendor_pro;
