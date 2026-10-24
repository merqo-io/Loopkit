"use server";

import { revalidatePath } from "next/cache";
import { requireVendor } from "@/features/auth";
import { createServerClient } from "@/lib/supabase/server";
import { z } from "zod";
import { normalizePhone } from "@/lib/phone";
import type { ActionResult } from "@/lib/action-result";

export async function withdrawMarketingConsentAction(
  formData: FormData,
): Promise<ActionResult> {
  await requireVendor();
  const normalized = normalizePhone(
    z.string().max(32).catch("").parse(formData.get("phone")),
  );
  if (!normalized.ok) {
    return { success: false, error: "Enter a valid Singapore phone number." };
  }
  const supabase = await createServerClient();
  const { error } = await supabase.rpc("vendor_withdraw_marketing_consent", {
    p_phone: normalized.phone,
  });
  if (error) return { success: false, error: "Could not record the opt-out." };
  revalidatePath(
    `/dashboard/customers/${encodeURIComponent(normalized.phone)}`,
  );
  return { success: true };
}
