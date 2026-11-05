import { CustomerShell } from "@/components/customer-shell";
import { createServerClient } from "@/lib/supabase/server";
import { CheckForm } from "@/features/card-check";
import { getShopName } from "@/lib/shop-name";

type CheckPageProps = {
  searchParams: Promise<{ v?: string; ref?: string }>;
};

export default async function CheckPage({ searchParams }: CheckPageProps) {
  const { v, ref } = await searchParams;

  // Resolve which active programs this vendor runs up front, so the
  // customer sees what a scan joins before they type anything.
  // vendor_active_programs is SECURITY DEFINER and public — an unknown
  // vendor id just returns an empty list.
  let programs: {
    id: string;
    name: string;
    type: string;
    reward_text: string;
  }[] = [];
  if (v) {
    const supabase = await createServerClient();
    const { data } = await supabase.rpc("vendor_active_programs", {
      p_vendor: v,
    });
    programs = data ?? [];
  }
  const shopName = v && programs.length > 0 ? await getShopName(v) : null;

  return (
    <CustomerShell
      eyebrow="Loyalty card"
      title={shopName ?? "Your loyalty card"}
      description={
        <>
          <p>
            {programs.length > 0
              ? `Join: ${programs.map((p) => p.name).join(", ")}`
              : "Check your rewards."}
          </p>
          <p className="mt-1 text-xs">
            New here? Enter your phone to join, no app needed.
          </p>
        </>
      }
    >
      <div className="rounded-2xl border bg-card px-6 py-8 shadow-sm">
        {v ? (
          <CheckForm vendorId={v} referralCode={ref} shopName={shopName} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Ask the shop for their loyalty link.
          </p>
        )}
      </div>
    </CustomerShell>
  );
}
