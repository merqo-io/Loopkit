# landing

## Purpose

Marketing sections composed by `src/app/page.tsx` into the public loopkit
landing page.

Shared controls and `cn` used by this folder's modules are imported from `@merqo/ui/primitives`; only `badge`, `alert-dialog`, `avatar`, `dropdown-menu`, `popover`, `table`, `toggle` and `toggle-group` remain in `src/components/ui/`.

## Contents

- `card-journey.tsx` — `CardJourney` (`#how`): the three-step scroll journey (watch, tap, come back) built from `@merqo/ui` `Journey`/`JourneyStep`/`PhoneFrame`/`PressButton`; scroll is the play head and rewinds, a tap overrides until scroll moves on, and under reduced motion each step shows its finished state with a Replay button
- `card-screen.tsx` — `CardScreen`, `JoinScreen`, `CounterScreen`: the customer card, join page and vendor counter shown inside phones
- `card-labels.ts` — the product strings the mock-ups quote (pinned to app source by `card-labels.test.ts`)
- `rhythm.ts` — shared container width and section padding
- `sections.tsx` — `LandingFaq` (three `FaqRows`) and `LandingClosing` (`ClosingCall` with the unchanged pricing line and the auth-aware CTA)
- `stamp-card.tsx` — `StampCard`: the hero product object, a phone with a Just joined / Mid-card / Reward ready control
- `card-journey.test.tsx`, `sections.test.tsx`, `stamp-card.test.tsx`: touch presses, reduced-motion path, three FAQ rows, closing CTA
- `footer.tsx` — `Footer`: single-row site footer, matching qkit's exactly. Takes `showSignIn` (default true); the dashboard layout passes false. Since 2026-09-16 a thin wrapper around `@merqo/ui`'s own `Footer` (`wordmark`/`tagline`/`kitName` slots) — loopkit's copy was found structurally identical to qkit's and paykit's, differing only in that content, and promoted. It passes `faqHref="/faq"` so every page, the dashboard included, shows a FAQ link after About. No bottom call-to-action band above it (removed to match qkit, which never had one).
- `footer.test.tsx` — also covers `showSignIn={false}` dropping the sign-in link. Asserts the wordmark link, tagline, copyright line, the About and FAQ links, Terms/Privacy links, and sign-in link all render.
- `hero.tsx` — `Hero`: "In build" readiness badge with its explainer line, "loopkit · stamp cards for hawkers and small shops" kicker, headline/subhead, CTA (buttons `min-h-11`), trust bullets and the `StampCard` illustration, with no entrance animation; the CTA is "Go to dashboard" when `authed`, else "Join the waitlist" (`WAITLIST_URL`)
- `hero.test.tsx`: pins the signed-out "In build" badge and the "Join the waitlist" CTA (and its `WAITLIST_URL` href), the same CTA label in the nav, and the swap to the dashboard link when signed in
- `waitlist.ts` — `WAITLIST_URL` (the merqo waitlist link for loopkit) and `PRICING_LINE`, the only pricing statement allowed on public pages
- `guardrails.test.tsx` — mocks `card-actions` (the card-check server actions) and renders the real landing sections and asserts no `$`, em dash or banned word, the badge, the retired-card and redemption copy of the public card components, the layout description, the exact pricing line and the waitlist href on every signup CTA
- `nav-account.tsx` — `NavAccount`: client wrapper around `@merqo/ui`'s `LandingAccountNav` (Dashboard link, Switch products, Get help, NPS feedback, Sign out); a client component because the support and feedback adapters are functions; errors go to the root layout's sonner `Toaster` Gets next/link from the root `AppLinkProvider`.
- `nav-account.test.tsx` — mocks `@merqo/ui`'s `LandingAccountNav` and calls the captured support and feedback adapters, asserting they map to `submitSupportMessageAction` (`message` becomes `body`) and `submitFeedbackAction`
- `nav.tsx` — `Nav`: delegates the sticky-header shell to `@merqo/ui`'s `LandingNav` (`wordmark`/`end` slot component — sticky, bordered, `px-5 py-4 backdrop-blur-md`, `max-w-6xl` inner row, matching qkit's landing-header sizing exactly), supplying `Wordmark` + sr-only "loopkit home" text as `wordmark` and a `links` prop of `/about` and `/faq` (`@merqo/ui` v0.59.1: inline from `sm` up, inside a burger menu below `sm`), plus either the `NavAccount` menu, which carries the Dashboard link (authed; `account` prop from `getLandingAccount`) or Sign in link (at least 44x44) + Join the waitlist button (at least 44px high) (signed out, for phone taps) as `end`
- `nav.test.tsx` — signed out shows Sign in; signed in shows the Dashboard link and an account menu that opens by touch and offers Sign out; also asserts the sticky header carries qkit's `sticky py-4` classes, that the About and FAQ links point at `/about` and `/faq` and are reachable through the burger menu, and that Dashboard and the account menu stay visible when signed in
- `wordmark.tsx` — `Wordmark`: thin wrapper over `@merqo/ui`'s `Wordmark` layout shell (size `sm`); loopkit supplies the "LoopKit" text with the "oo" rendered in gold as the brand's stamp-dot motif
- `wordmark.test.tsx` — asserts the text, the shell classes and the gold hidden "oo" span

## Shared package note

`back-to-top.tsx` moved to `@merqo/ui` (v0.31.0) as `BackToTop` — it was byte-identical across four kits.

`Badge` comes from `@merqo/ui/primitives`; gold badges use `variant="gold"`.

The header padding (`py-3`) and the 44px logo and link sizes come from the shared `@merqo/ui` v0.62.1 `LandingNav`, so `nav.test.tsx` asserts that class.

## Parent

[components](../README.md)
