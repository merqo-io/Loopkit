"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { redeemAction } from "@/app/dashboard/actions";
import type { StampCard } from "@/app/dashboard/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@merqo/ui";

/** Redeem control with a ConfirmDialog: consumes exactly one reward's worth of stamps and carries the rest over to the next card. */
export function RedeemButton({
  card,
  stampsRequired,
  onRedeemed,
}: {
  card: StampCard;
  stampsRequired: number;
  onRedeemed: (card: StampCard) => void;
}) {
  const router = useRouter();

  async function confirm() {
    const fd = new FormData();
    fd.set("card_id", card.id);
    const result = await redeemAction(fd);
    if (!result.success) throw new Error(result.error);
    toast.success(`Reward redeemed for ${card.phone}.`);
    onRedeemed(result.card);
    router.refresh();
  }

  return (
    <ConfirmDialog
      title="Redeem reward?"
      description={`Redeem reward for ${card.phone}? Uses ${stampsRequired} stamps, any extra carries over to their next card.`}
      confirmLabel="Redeem"
      pendingLabel="Redeeming…"
      onConfirm={confirm}
      trigger={
        <Button variant="outline" size="sm" className="rounded-xl">
          Redeem
        </Button>
      }
    />
  );
}
