"use server";

// eslint-disable-next-line no-restricted-imports -- anonymous customer flow; the card or order token is the credential
import { createServiceClient } from "@/lib/supabase/server";
import { z } from "zod";
import {
  clearCustomerProof,
  readCustomerProof,
  vendorIdSchema,
} from "@/lib/customer-proof";
import { normalizePhone } from "@/lib/phone";
import { allowAnonymousAction, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";
import {
  MARKETING_CONSENT_VERSION,
  shownShopName,
} from "@/lib/marketing-consent";
import { shownConsentWording } from "@/lib/shop-name";
import type { ActionResult } from "@merqo/ui/kit-api";

async function setMarketingConsentActionImpl(
  formData: FormData,
): Promise<ActionResult<{ granted: boolean }>> {
  const normalized = normalizePhone(String(formData.get("phone") ?? ""));
  if (!normalized.ok) {
    return { success: false, error: "Enter a valid Singapore phone number." };
  }
  const vendorId = String(formData.get("vendor") ?? "");
  if (!vendorIdSchema.safeParse(vendorId).success) {
    return { success: false, error: "Missing shop." };
  }
  const granted = z.enum(["true", "false"]).safeParse(formData.get("granted"));
  if (!granted.success) return { success: false, error: "Missing choice." };
  const proof = await readCustomerProof(vendorId);
  if (!proof)
    return {
      success: false,
      error: "Use your saved card code or ask the shop to recover your card.",
    };
  const grant = granted.data === "true";
  const wording = grant
    ? await shownConsentWording(vendorId, shownShopName(formData))
    : "";
  if (wording === null)
    return {
      success: false,
      error: "This shop's details changed. Reload the page and try again.",
    };
  const supabase = await createServiceClient();
  const { data, error } = await supabase.rpc("customer_set_marketing_consent", {
    p_vendor: vendorId,
    p_phone: normalized.phone,
    p_token: proof,
    p_granted: grant,
    p_wording_version: MARKETING_CONSENT_VERSION,
    p_wording_text: wording,
    p_source: "card_view",
  });
  if (error) return { success: false, error: "Something went wrong." };
  return { success: true, granted: data === true };
}

// A proved customer erases their own data at this shop. Failures share one
// message so the response never says whether a phone has a card here.
const ERASE_FAILED_MESSAGE =
  "We could not delete your data. Use your saved card code or ask the shop for help.";

async function eraseMyDataActionImpl(
  formData: FormData,
): Promise<ActionResult> {
  const normalized = normalizePhone(String(formData.get("phone") ?? ""));
  const vendor = vendorIdSchema.safeParse(String(formData.get("vendor") ?? ""));
  if (!normalized.ok || !vendor.success) {
    return { success: false, error: ERASE_FAILED_MESSAGE };
  }
  if (!(await allowAnonymousAction(`erase:${vendor.data}`, normalized.phone)))
    return { success: false, error: RATE_LIMIT_MESSAGE };
  const proof = await readCustomerProof(vendor.data);
  if (!proof) return { success: false, error: ERASE_FAILED_MESSAGE };
  const supabase = await createServiceClient();
  const { data, error } = await supabase.rpc("customer_erase", {
    p_vendor: vendor.data,
    p_phone: normalized.phone,
    p_token: proof,
  });
  if (error || data !== true) {
    return { success: false, error: ERASE_FAILED_MESSAGE };
  }
  await clearCustomerProof(vendor.data);
  return { success: true };
}

export async function setMarketingConsentAction(
  formData: FormData,
): Promise<ActionResult<{ granted: boolean }>> {
  try {
    return await setMarketingConsentActionImpl(formData);
  } catch {
    return {
      success: false,
      error: "Could not save your choice. Try again.",
    };
  }
}
export async function eraseMyDataAction(
  formData: FormData,
): Promise<ActionResult> {
  try {
    return await eraseMyDataActionImpl(formData);
  } catch {
    return { success: false, error: ERASE_FAILED_MESSAGE };
  }
}
