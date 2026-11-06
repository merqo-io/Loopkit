// eslint-disable-next-line no-restricted-imports -- anonymous customer flow; the card or order token is the credential
import { createServiceClient } from "@/lib/supabase/server";
import { MARKETING_CONSENT_VERSION } from "@/lib/marketing-consent";
import { getShopName, shownConsentWording } from "@/lib/shop-name";
import type { MarketingStatus } from "../types";

type CardIdentity = { vendorId: string; phone: string; token: string };

// An unticked box never withdraws: it only means no new opt-in was given.
export async function syncMarketingConsent(
  { vendorId, phone, token }: CardIdentity,
  optIn: boolean,
  shownShop: string,
): Promise<MarketingStatus> {
  const shopName = await getShopName(vendorId);
  try {
    const wording = optIn
      ? await shownConsentWording(vendorId, shownShop)
      : null;
    return await readOrGrantMarketingConsent(
      { vendorId: vendorId, phone: phone, token: token },
      optIn,
      wording,
      shopName,
    );
  } catch {
    return { granted: false, shopName, saveFailed: true };
  }
}

async function readOrGrantMarketingConsent(
  { vendorId, phone, token }: CardIdentity,
  optIn: boolean,
  wording: string | null,
  shopName: string | null,
): Promise<MarketingStatus> {
  const supabase = await createServiceClient();
  let saveFailed = optIn && wording === null;
  if (wording !== null) {
    const { error } = await supabase.rpc("customer_set_marketing_consent", {
      p_vendor: vendorId,
      p_phone: phone,
      p_token: token,
      p_granted: true,
      p_wording_version: MARKETING_CONSENT_VERSION,
      p_wording_text: wording,
      p_source: "card_check",
    });
    saveFailed = !!error;
  }
  const { data, error } = await supabase.rpc("customer_marketing_consent", {
    p_vendor: vendorId,
    p_phone: phone,
    p_token: token,
  });
  return {
    granted: !error && data === true,
    shopName,
    saveFailed: saveFailed || !!error,
  };
}
