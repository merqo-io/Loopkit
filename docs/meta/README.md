# meta

Cross-cutting review and backlog evidence for Loopkit. Feature design and dated
implementation history live in `docs/superpowers/`.

## Contents

- `2026-08-15-loopkit-task-registry.md` preserves the original backlog and its
  October review update. Direct wheel/scratch dispatch tests now close T1;
  September catalog/payment-offset work supersedes T4. Setup complexity and the
  typed strategy-dispatch tradeoff remain documented maintenance debt.
- `ai-harness-reference.md` is the hook-by-hook AI harness reference, and
  `templatecentral-adoption-log.md` is the templateCentral review history (6.0.4 and 7.2.2)
  (adopted / not adopted); both were moved out of `AGENTS.md`.
- `2026-10-24-fresh-eyes-sweep.md` is the close-out sweep: knip results,
  duplicates, loading states, coverage, and what was fixed, deferred or needs
  an owner decision.
- `archive/2026-10-08-unused-vouchers/` preserves removed, uncalled voucher
  wrappers and their tests outside runtime and test discovery.

The current security audit is `../loopkit-audit-2026-10-08.md`. Prepared database
fixes still require local validation and an approved deployment rollout.

## Reuse and ownership

[Component reuse specification](2026-10-10-component-reuse-spec.md) records the feature ownership, preserved contracts and validation scope of the setup/Counter cleanup.

## Parent

[docs](../README.md)
