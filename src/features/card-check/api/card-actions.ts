"use server";

// eslint-disable-next-line no-restricted-imports -- anonymous customer flow; the card or order token is the credential
import { createServiceClient } from "@/lib/supabase/server";
import { z } from "zod";
import {
  readCustomerProof,
  saveCustomerProof,
  vendorIdSchema,
} from "@/lib/customer-proof";
import { normalizePhone } from "@/lib/phone";
import { qrSvg } from "@merqo/ui";
import type { ActionResult } from "@merqo/ui/kit-api";

// A proved customer may start a fresh cycle only after expiry.
async function regenerateCardActionImpl(
  formData: FormData,
): Promise<ActionResult<{ phone: string }>> {
  const normalized = normalizePhone(String(formData.get("phone") ?? ""));
  if (!normalized.ok) {
    return { success: false, error: "Enter a valid Singapore phone number." };
  }
  const programId = String(formData.get("program") ?? "");
  if (!z.uuid().safeParse(programId).success) {
    return { success: false, error: "Missing program." };
  }

  const supabase = await createServiceClient();
  const vendorId = String(formData.get("vendor") ?? "");
  if (!vendorIdSchema.safeParse(vendorId).success)
    return { success: false, error: "Missing shop." };
  const proof = await readCustomerProof(vendorId);
  if (!proof)
    return {
      success: false,
      error: "Use your saved card code or ask the shop to recover your card.",
    };
  const { data: card, error } = await supabase.rpc(
    "customer_reset_expired_card",
    {
      p_vendor: vendorId,
      p_token: proof,
      p_program: programId,
      p_phone: normalized.phone,
    },
  );
  if (error || !card) {
    return { success: false, error: "Something went wrong." };
  }

  await saveCustomerProof(vendorId, card.card_token);
  return { success: true, phone: normalized.phone };
}

async function setCustomerBirthdayActionImpl(
  formData: FormData,
): Promise<ActionResult> {
  const normalized = normalizePhone(String(formData.get("phone") ?? ""));
  if (!normalized.ok) {
    return { success: false, error: "Enter a valid Singapore phone number." };
  }
  const vendorId = String(formData.get("vendor") ?? "");
  if (!vendorIdSchema.safeParse(vendorId).success) {
    return { success: false, error: "Missing shop." };
  }
  const month = Number(formData.get("month"));
  const day = Number(formData.get("day"));
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return { success: false, error: "Pick a month." };
  }
  if (!Number.isInteger(day) || day < 1 || day > 31) {
    return { success: false, error: "Pick a day." };
  }

  const supabase = await createServiceClient();
  const proof = await readCustomerProof(vendorId);
  if (!proof)
    return {
      success: false,
      error: "Use your saved card code or ask the shop to recover your card.",
    };
  const { error } = await supabase.rpc("customer_set_birthday", {
    p_token: proof,
    p_vendor: vendorId,
    p_phone: normalized.phone,
    p_month: month,
    p_day: day,
  });
  if (error) {
    return { success: false, error: "Something went wrong." };
  }

  return { success: true };
}

async function selectPointsRewardActionImpl(
  formData: FormData,
): Promise<
  ActionResult<{ id: string; phone: string; rewardText: string; qr: string }>
> {
  const normalized = normalizePhone(String(formData.get("phone") ?? ""));
  if (!normalized.ok) {
    return { success: false, error: "Enter a valid Singapore phone number." };
  }
  const programId = String(formData.get("program") ?? "");
  if (!z.uuid().safeParse(programId).success) {
    return { success: false, error: "Missing program." };
  }
  const itemId = String(formData.get("item_id") ?? "");
  if (!z.string().min(1).max(100).safeParse(itemId).success) {
    return { success: false, error: "Missing reward." };
  }

  const supabase = await createServiceClient();
  const vendorId = String(formData.get("vendor") ?? "");
  if (!vendorIdSchema.safeParse(vendorId).success)
    return { success: false, error: "Missing shop." };
  const proof = await readCustomerProof(vendorId);
  if (!proof)
    return {
      success: false,
      error: "Use your saved card code or ask the shop to recover your card.",
    };
  const { data: voucher, error } = await supabase.rpc(
    "customer_select_points_reward",
    {
      p_vendor: vendorId,
      p_token: proof,
      p_program: programId,
      p_phone: normalized.phone,
      p_item_id: itemId,
    },
  );
  if (error || !voucher) {
    const message =
      error?.message === "insufficient_points"
        ? "Not enough points for that reward yet."
        : "Something went wrong. Try again.";
    return { success: false, error: message };
  }

  const qr = await qrSvg(voucher.voucher_token ?? "");
  return {
    success: true,
    id: voucher.id,
    phone: normalized.phone,
    rewardText: voucher.reward_text,
    qr,
  };
}

export async function regenerateCardAction(
  formData: FormData,
): Promise<ActionResult<{ phone: string }>> {
  try {
    return await regenerateCardActionImpl(formData);
  } catch {
    return { success: false, error: "Could not start a new card. Try again." };
  }
}
export async function setCustomerBirthdayAction(
  formData: FormData,
): Promise<ActionResult> {
  try {
    return await setCustomerBirthdayActionImpl(formData);
  } catch {
    return {
      success: false,
      error: "Could not save your birthday. Try again.",
    };
  }
}
export async function selectPointsRewardAction(
  formData: FormData,
): Promise<
  ActionResult<{ id: string; phone: string; rewardText: string; qr: string }>
> {
  try {
    return await selectPointsRewardActionImpl(formData);
  } catch {
    return {
      success: false,
      error: "Could not redeem your reward. Try again.",
    };
  }
}
