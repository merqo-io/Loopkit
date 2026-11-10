/**
 * The shared Badge has no gold variant, so gold badges override its colours.
 * The anchor hover is restated because the default variant's
 * `[a&]:hover:bg-primary/90` would otherwise win when the badge renders as a link.
 */
export const GOLD_BADGE = "bg-gold text-gold-foreground [a&]:hover:bg-gold/90";
