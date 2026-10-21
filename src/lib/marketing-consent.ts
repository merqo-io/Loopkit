// Bump the version whenever the wording changes; each grant stores both.
export const MARKETING_CONSENT_VERSION = "2026-10-21";

export function marketingConsentText(shopName: string | null): string {
  const shop = shopName?.trim() || "this shop";
  return `Yes, ${shop} may send me offers and news by SMS, WhatsApp or Telegram to this phone number. Optional. I can stop anytime from my card.`;
}

export function marketingOptedIn(formData: FormData): boolean {
  return formData.get("marketing") === "yes";
}
