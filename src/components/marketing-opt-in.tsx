"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { marketingConsentText } from "@/lib/marketing-consent";

export function MarketingOptIn({
  id,
  shopName,
}: {
  id: string;
  shopName: string | null;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border p-3">
      <input type="hidden" name="marketing_shop" value={shopName ?? ""} />
      <Checkbox id={id} name="marketing" value="yes" className="mt-0.5" />
      <Label htmlFor={id} className="text-sm leading-snug font-normal">
        {marketingConsentText(shopName)}
      </Label>
    </div>
  );
}
