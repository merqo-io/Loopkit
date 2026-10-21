"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { setMarketingConsentAction } from "../api/actions";
import type { MarketingStatus } from "../types";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function MarketingConsentToggle({
  vendorId,
  phone,
  initial,
}: {
  vendorId: string;
  phone: string;
  initial: MarketingStatus;
}) {
  const [granted, setGranted] = useState(initial.granted);
  const [pending, startTransition] = useTransition();

  function change(next: boolean) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("vendor", vendorId);
      fd.set("phone", phone);
      fd.set("granted", String(next));
      const res = await setMarketingConsentAction(fd);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      setGranted(res.granted);
      toast.success(res.granted ? "Offers turned on." : "Offers turned off.");
    });
  }

  return (
    <div className="space-y-2 rounded-xl border p-3">
      <div className="flex items-center justify-between gap-3">
        <Label
          htmlFor="marketing-consent"
          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          Offers by message
        </Label>
        <Switch
          id="marketing-consent"
          checked={granted}
          disabled={pending}
          onCheckedChange={change}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {granted ? initial.text : "Off. Turn on to agree: " + initial.text}
      </p>
      {initial.saveFailed && (
        <p role="alert" className="text-xs text-destructive">
          We could not save your offers choice. Try the switch again.
        </p>
      )}
    </div>
  );
}
