"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAsyncAction } from "@merqo/ui";
import { applyPointsOffsetAction } from "@/app/dashboard/redeem-actions";
import type { StampCard } from "@/app/dashboard/card";
import { Button, Input, Label } from "@merqo/ui/primitives";

// Offset-mode redemption control — a small inline form, not an
// AlertDialog like RedeemButton/RedeemVoucherConfirm: there's a number to
// pick here (up to the balance), not a single yes/no confirmation.
export function PointsOffsetForm({
  card,
  onApplied,
}: {
  card: StampCard;
  onApplied: (card: StampCard, dollars: number) => void;
}) {
  const { pending, run } = useAsyncAction((fn: () => Promise<void>) => fn());
  const [points, setPoints] = useState(card.stamp_count);

  function apply() {
    run(async () => {
      const fd = new FormData();
      fd.set("card_id", card.id);
      fd.set("points", String(points));
      const res = await applyPointsOffsetAction(fd);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      onApplied(
        { id: card.id, phone: res.phone, stamp_count: res.stampCount },
        res.dollars,
      );
    });
  }

  const invalid = points < 1 || points > card.stamp_count;

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="space-y-1.5">
        <Label
          htmlFor="offset_points"
          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          Points to apply
        </Label>
        <Input
          id="offset_points"
          type="number"
          min={1}
          max={card.stamp_count}
          value={points}
          onChange={(e) => setPoints(Number(e.target.value))}
          className="h-11 w-28 rounded-xl"
        />
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending || invalid}
        onClick={apply}
        className="rounded-xl"
      >
        {pending ? "Applying…" : "Apply"}
      </Button>
    </div>
  );
}
