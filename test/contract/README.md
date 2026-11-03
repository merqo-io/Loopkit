# contract

`merqo-metrics.contract.test.ts` checks computed metrics (including the entitlements input behind `pro_vendors`) against a local
snapshot of merqo's payload schema. The snapshot must be synchronized when
the consumer schema changes; a consumer-only change does not automatically
fail this test.

[test](../README.md)
