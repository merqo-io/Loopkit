import { qrSvg } from "@merqo/ui";
import { getProgress } from "@/lib/engine";
import { isCardExpired } from "@/lib/expiry";
import type { CardStatus } from "../types";
import type { VendorJoinRow } from "./join-payload";

type RawVoucher = {
  id: string;
  voucher_token: string;
  reward_text: string;
  expires_at: string | null;
};

async function buildActiveVouchers(row: VendorJoinRow) {
  const rawVouchers = Array.isArray(row.active_vouchers)
    ? (row.active_vouchers as RawVoucher[])
    : [];
  return Promise.all(
    rawVouchers.map(async (v) => ({
      id: v.id,
      rewardText: v.reward_text,
      expiresAt: v.expires_at,
      qr: await qrSvg(v.voucher_token),
    })),
  );
}

export async function buildCardStatus(row: VendorJoinRow): Promise<CardStatus> {
  const programLike = {
    type: row.type,
    config: row.config,
    stamps_required: row.stamps_required,
    reward_text: row.reward_text,
  };
  const cardLike = {
    state: row.state,
    stamp_count: row.stamp_count ?? 0,
    reward_count: 0,
  };
  const progress = getProgress(programLike, cardLike, new Date());
  const qr = await qrSvg(row.card_token);
  const expired =
    row.cycle_started_at !== null &&
    row.cycle_started_at !== undefined &&
    isCardExpired(row.cycle_started_at, row.expiry_days, new Date());
  const activeVouchers = await buildActiveVouchers(row);

  return {
    programId: row.program_id,
    cardCode: row.card_token,
    name: row.name,
    label: progress.label,
    view: progress.view,
    rewardReady: progress.rewardReady,
    reward_text: row.reward_text,
    qr,
    expired,
    active: row.active,
    replacedByName: row.replaced_by_name ?? null,
    carriedOverCount:
      row.replaced_by_stamp_count && row.replaced_by_stamp_count > 0
        ? row.replaced_by_stamp_count
        : null,
    activeVouchers,
  };
}
