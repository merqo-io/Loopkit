import { z } from "zod";
import { customerTokenSchema } from "@/lib/customer-proof";
import { completeReferralCredit } from "./referral-credit";

export type VendorJoinRow = {
  program_id: string;
  name: string;
  type: string;
  config: unknown;
  state: unknown;
  stamp_count: number;
  card_token: string;
  reward_text: string;
  stamps_required: number;
  expiry_days: number | null;
  cycle_started_at: string | null;
  active: boolean;
  replaced_by_name: string | null;
  replaced_by_stamp_count: number | null;
  vendor_avatar_url: string | null;
  active_vouchers: unknown;
};

export const joinPayloadSchema = z.object({
  cards: z.array(
    z.object({
      program_id: z.uuid(),
      name: z.string(),
      type: z.string(),
      config: z.unknown(),
      state: z.unknown(),
      stamp_count: z.number(),
      card_token: customerTokenSchema,
      reward_text: z.string(),
      stamps_required: z.number(),
      expiry_days: z.number().nullable(),
      cycle_started_at: z.string().nullable(),
      active: z.boolean(),
      replaced_by_name: z.string().nullable(),
      replaced_by_stamp_count: z.number().nullable(),
      vendor_avatar_url: z.string().nullable(),
      active_vouchers: z
        .array(
          z.object({
            id: z.uuid(),
            voucher_token: customerTokenSchema,
            reward_text: z.string(),
            expires_at: z.string().nullable(),
          }),
        )
        .optional()
        .default([]),
    }),
  ),
  referral_credit: z.unknown().optional(),
});

type ReferralCredit = {
  pending: true;
  referralHostId: string;
  guestPhone: string;
};

export function isPendingReferralCredit(
  value: unknown,
): value is ReferralCredit {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { pending?: unknown }).pending === true &&
    z
      .string()
      .uuid()
      .safeParse((value as { referralHostId?: unknown }).referralHostId)
      .success &&
    z
      .string()
      .regex(/^\+65[3689]\d{7}$/)
      .safeParse((value as { guestPhone?: unknown }).guestPhone).success
  );
}

// Referral delivery is best effort after the guest enrollment commits.
export async function creditReferralHost(
  credit: ReferralCredit,
): Promise<void> {
  try {
    await completeReferralCredit(credit.referralHostId, credit.guestPhone);
  } catch {
    console.error("creditReferralHost failed");
  }
}
