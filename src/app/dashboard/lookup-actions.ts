"use server";

import { requireVendor } from "@/features/auth";
import { normalizePhone } from "@/lib/phone";
import { getProgress } from "@/lib/engine";
import { createServerClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/action-result";
import type { Progress } from "@/lib/engine/types";
import type { StampCard } from "@/app/dashboard/card";
import { programFromForm } from "./actions-shared";

// Resolve a scanned card_token to its phone via the owner-gated card_by_token
// RPC. Identifies only — the phone flows into the existing stamp/play action.
// A card-token miss falls back to voucher_by_token: the same QR surface now
// also carries Points Club voucher tokens minted at catalog redemption.
export async function resolveTokenAction(formData: FormData): Promise<
  ActionResult<
    | { kind: "card"; phone: string; programId: string }
    | {
        kind: "voucher";
        phone: string;
        voucherToken: string;
        rewardText: string;
      }
  >
> {
  await requireVendor();
  const token = String(formData.get("token") ?? "").trim();
  if (!token) return { success: false, error: "No code scanned." };

  const supabase = await createServerClient();
  const { data, error } = await supabase.rpc("card_by_token", {
    p_token: token,
  });
  if (error) {
    console.error("card_by_token failed", error.message);
    return { success: false, error: "Could not read that code." };
  }
  const cardRow = data?.[0];
  if (cardRow) {
    return {
      success: true,
      kind: "card",
      phone: cardRow.phone,
      programId: cardRow.program_id,
    };
  }

  const { data: voucherData, error: voucherError } = await supabase.rpc(
    "voucher_by_token",
    { p_token: token },
  );
  if (voucherError) {
    console.error("voucher_by_token failed", voucherError.message);
    return { success: false, error: "Could not read that code." };
  }
  const voucherRow = voucherData?.[0];
  if (!voucherRow) {
    return { success: false, error: "That card is not for this shop." };
  }
  return {
    success: true,
    kind: "voucher",
    phone: voucherRow.phone,
    voucherToken: token,
    rewardText: voucherRow.reward_text,
  };
}

type LookupResult = ActionResult<{ card: StampCard; progress: Progress }>;

// Read a card's status by phone WITHOUT mutating it — so any type's reward can
// be redeemed without a spurious visit. Type-aware: the engine computes the
// per-type progress (stamp dots / lucky / plant) the client renders. Vendor-
// scoped by RLS (cards_own), and returns the card id the stamp redeem RPC needs.
export async function lookupAction(formData: FormData): Promise<LookupResult> {
  await requireVendor();

  const program = await programFromForm(formData);
  if (!program) {
    return { success: false, error: "Set up your card first." };
  }

  const normalized = normalizePhone(String(formData.get("phone") ?? ""));
  if (!normalized.ok) {
    return { success: false, error: "Enter a valid Singapore phone number." };
  }

  const supabase = await createServerClient();
  const { data: card, error } = await supabase
    .from("cards")
    .select("id,phone,stamp_count,reward_count,state")
    .eq("program_id", program.id)
    .eq("phone", normalized.phone)
    .maybeSingle();
  if (error) {
    console.error("card lookup failed", error);
    return { success: false, error: "Something went wrong. Try again." };
  }
  if (!card) {
    return { success: false, error: "No card yet for that number." };
  }

  const progress = getProgress(
    program,
    {
      state: card.state,
      stamp_count: card.stamp_count,
      reward_count: card.reward_count,
    },
    new Date(),
  );

  return {
    success: true,
    card: { id: card.id, phone: card.phone, stamp_count: card.stamp_count },
    progress,
  };
}
