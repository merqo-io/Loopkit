# src/lib/tokens

## Purpose

Named colour modules. The lint rule bans colour literals in `src`, so values live here and components import them.

## Contents

- `mechanic-art.ts` — `MECHANIC_ART`, the colours of the owner-approved mechanic art (cup, flame, scratch card, wheel, stamp, setup defaults), grouped per mechanic. Cup, flame, scratch-card and wheel values are `var(--art-*)` references to tokens in `src/app/globals.css` (same colours the art shipped with, now as oklch); `resolveArtColor` reads a token's computed value for canvas fills, which cannot take `var()`. `setup` and `stamp` stay hex because they are defaults stored in the database and fed to colour inputs.
- `mechanic-art.dom.test.tsx` — renders the cup, flame and wheel and asserts every colour in the DOM is a defined `--art-*` token and that the token set matches the original colours.
