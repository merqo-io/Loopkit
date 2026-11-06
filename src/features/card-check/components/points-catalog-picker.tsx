"use client";

import { toast } from "sonner";
import { selectPointsRewardAction } from "../api/actions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@merqo/ui";

type CatalogItem = { id: string; label: string; cost: number };
type NewVoucher = { id: string; rewardText: string; qr: string };

// Only ever passed the already-affordable subset of a program's catalog
// (program-card-status.tsx filters); renders nothing at all rather than a
// permanently-disabled list when none are affordable yet.
export function PointsCatalogPicker({
  programId,
  vendorId = "",
  phone,
  items,
  onSelected,
}: {
  programId: string;
  vendorId?: string;
  phone: string;
  items: CatalogItem[];
  onSelected: (voucher: NewVoucher) => void;
}) {
  if (items.length === 0) return null;

  async function confirm(item: CatalogItem) {
    const fd = new FormData();
    fd.set("phone", phone);
    fd.set("program", programId);
    fd.set("vendor", vendorId);
    fd.set("item_id", item.id);
    let res: Awaited<ReturnType<typeof selectPointsRewardAction>>;
    try {
      res = await selectPointsRewardAction(fd);
    } catch {
      throw new Error("Could not redeem your reward. Try again.");
    }
    if (!res.success) throw new Error(res.error);
    toast.success(`${res.rewardText} redeemed. Show the QR to the shop.`);
    onSelected({ id: res.id, rewardText: res.rewardText, qr: res.qr });
  }

  return (
    <div className="w-full space-y-1.5">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Choose your reward
      </p>
      {items.map((item) => (
        <ConfirmDialog
          key={item.id}
          title={`Redeem ${item.label}?`}
          description={`Uses ${item.cost} points. Any remaining points stay on your card, you'll get a QR to show the shop.`}
          confirmLabel="Redeem"
          pendingLabel="Redeeming…"
          onConfirm={() => confirm(item)}
          trigger={
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full justify-between rounded-xl"
            >
              <span>{item.label}</span>
              <span className="text-muted-foreground">{item.cost} pts</span>
            </Button>
          }
        />
      ))}
    </div>
  );
}
