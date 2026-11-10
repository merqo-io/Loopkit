# landing

## Purpose

Marketing sections composed by `src/app/page.tsx` into the public loopkit
landing page.

Shared controls and `cn` used by this folder's modules are imported from `@merqo/ui/primitives`; only `badge`, `alert-dialog`, `avatar`, `dropdown-menu`, `popover`, `table`, `toggle` and `toggle-group` remain in `src/components/ui/`.

## Contents

- `benefits.tsx` — `Benefits`: eyebrow ("Why vendors switch") + `h2` heading above a 3-column value-prop grid ("Regulars, not one-offs" / "Zero friction" / "Built for a stall"), icon + title + body per item — `border-t` section wrapper matches `how-it-works.tsx`'s divider/heading pattern
- `footer.tsx` — `Footer`: single-row site footer, matching qkit's exactly. Takes `showSignIn` (default true); the dashboard layout passes false. Since 2026-09-16 a thin wrapper around `@merqo/ui`'s own `Footer` (`wordmark`/`tagline`/`kitName` slots) — loopkit's copy was found structurally identical to qkit's and paykit's, differing only in that content, and promoted. No bottom call-to-action band above it (removed to match qkit, which never had one).
- `footer.test.tsx` — also covers `showSignIn={false}` dropping the sign-in link. Asserts the wordmark link, tagline, copyright line, the About link, Terms/Privacy links, and sign-in link all render.
- `faq.tsx` — `Faq`: eyebrow ("Questions") + `h2` heading, `border-t` section wrapper matching `how-it-works.tsx`'s pattern, above an accordion of `<details>`-based `FaqItem`s (setup, app-free claim, reward redemption, cost via the pilot pricing line), anchored `id="faq"`
- `hero.tsx` — `Hero`: "In build" readiness badge with its explainer line, headline/subhead, CTA, trust bullets and the `StampCard` illustration; the CTA is "Go to dashboard" when `authed`, else "Join the waitlist" (`WAITLIST_URL`)
- `hero.test.tsx`: pins the signed-out "In build" badge and the "Join the waitlist" CTA (and its `WAITLIST_URL` href), the same CTA label in the nav, and the swap to the dashboard link when signed in
- `waitlist.ts` — `WAITLIST_URL` (the merqo waitlist link for loopkit) and `PRICING_LINE`, the only pricing statement allowed on public pages
- `guardrails.test.tsx` — mocks `card-actions` (the card-check server actions) and renders the real landing sections and asserts no `$`, em dash or banned word, the badge, the retired-card and redemption copy of the public card components, the layout description, the exact pricing line and the waitlist href on every signup CTA
- `how-it-works.tsx` — `HowItWorks`: numbered 3-step explainer (set up card → stamp by phone → they come back), anchored `id="how"`
- `nav.tsx` — `Nav`: delegates the sticky-header shell to `@merqo/ui`'s `LandingNav` (`wordmark`/`end` slot component — sticky, bordered, `px-5 py-4 backdrop-blur-md`, `max-w-6xl` inner row, matching qkit's landing-header sizing exactly), supplying `Wordmark` + sr-only "loopkit home" text as `wordmark` and an `/about` link, an FAQ button (`/#faq`, hidden below `sm` — the leading `/` so it resolves correctly from `/about` too, not just from `/` where `Nav` also renders), plus either a Dashboard button (authed) or Sign in link + Join the waitlist button (signed out) as `end`
- `nav.test.tsx` — asserts the sticky header carries qkit's `px-5 py-4 backdrop-blur-md` classes, and that the About link points at `/about`
- `stamp-card.tsx` — `StampCard`: illustrative 8-slot stamp card (6 stamped, 1 reward slot) used in the hero, pure markup with no image; the 6th (last-stamped) dot plays `motion-safe:animate-stamp-pop` once on load, delayed 0.5s to land just after the hero's `fade-rise` reveal finishes — same class/keyframe `StampDots` uses for a real stamp landing
- `wordmark.tsx` — `Wordmark`: "LoopKit" text logo with the "oo" rendered in gold as the brand's stamp-dot motif

## Shared package note

`back-to-top.tsx` moved to `@merqo/ui` (v0.31.0) as `BackToTop` — it was byte-identical across four kits.

`Badge` comes from `@merqo/ui/primitives`; gold badges use `GOLD_BADGE` from `@/lib/gold-badge`.

## Parent

[components](../README.md)
