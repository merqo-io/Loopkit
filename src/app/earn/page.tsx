import { z } from "zod";
import { EarnForm } from "./earn-form";
import { createServiceClient } from "@/lib/supabase/server";
import { getShopName } from "@/lib/shop-name";

async function earnShopName(order: string): Promise<string | null> {
  if (!z.string().uuid().safeParse(order).success) return null;
  const supabase = await createServiceClient();
  const { data } = await supabase.rpc("qkit_earn_vendor", {
    p_order_id: order,
  });
  const vendorId = z.string().uuid().safeParse(data);
  return vendorId.success ? getShopName(vendorId.data) : null;
}

interface Props {
  searchParams: Promise<{ order?: string }>;
}

export const revalidate = 0;

export default async function EarnPage({ searchParams }: Props) {
  const { order } = await searchParams;
  if (!order) {
    return (
      <main className="mx-auto max-w-sm p-6 text-center text-sm text-muted-foreground">
        Missing order reference.
      </main>
    );
  }

  const shopName = await earnShopName(order);
  return (
    <main className="mx-auto max-w-sm p-6">
      <EarnForm
        orderId={order}
        vendorName={shopName ?? undefined}
        shopName={shopName}
      />
    </main>
  );
}
