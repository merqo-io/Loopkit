-- 0070: the self-serve upgrade inbox is gone: merqo owns plans, and nothing
-- in loopkit reads or writes loopkit.upgrade_requests any more.

drop table loopkit.upgrade_requests;
