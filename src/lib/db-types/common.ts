export type MarketingConsentSource =
  "card_check" | "earn" | "card_view" | "vendor_recorded";

export type EntitlementTier = "free" | "starter" | "qkit" | "paid";
export type EntitlementStatsWindow = "24h" | "90d";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Not part of the loopkit schema — this is the shape of the shared
// merqo.vendor_profile.social_links JSONB column (see
// src/lib/merqo-vendor-profile.ts), which loopkit reads/writes but doesn't
// own. Same 4 keys as qkit's identically-named type, since both kits read
// the same column.
export type SocialLinks = {
  website?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
};
