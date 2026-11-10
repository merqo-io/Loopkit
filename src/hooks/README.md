# hooks

## Purpose

Shared React hooks used across the vendor dashboard and setup UI.

## Contents

## Reuse and ownership

`useAsyncAction` and `navigatingAway` come straight from `@merqo/ui`; call sites pass `(fn: () => Promise<void>) => fn()` as the action so `run(async () => { ... })` keeps a per-call closure.

`use-save-settings.ts` shares the settings mutation lifecycle, prevents simultaneous duplicate submissions and resets the guard after success, validation errors or thrown failures. Its DOM tests cover those contracts.

## Parent

[src](../README.md)
