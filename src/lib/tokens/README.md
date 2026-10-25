# src/lib/tokens

## Purpose

Named colour modules. The lint rule bans colour literals in `src`, so values live here and components import them.

## Contents

- `mechanic-art.ts` — `MECHANIC_ART`, the colours of the owner-approved mechanic art (cup, flame, scratch card, wheel, stamp, setup defaults), grouped per mechanic. The values are the ones the art shipped with and must not change.
- `mechanic-art.dom.test.tsx` — renders the cup, flame and wheel and asserts the colours in the DOM are the original values.
