import type { Metadata } from "next";
import { getEntitlement, isPro } from "@/lib/program";
import { SetupForm } from "@/app/setup/setup-form";
import { loadSetupProgram } from "@/app/setup/setup-context";
import { SetupShell } from "@/app/setup/setup-shell";

export const metadata: Metadata = { title: "Change card type" };

export default async function MigrateProgramPage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const { programId } = await params;
  const { vendorName, vendorAvatarUrl, program } =
    await loadSetupProgram(programId);
  const entitlement = getEntitlement(await isPro());

  return (
    <SetupShell
      vendorName={vendorName}
      title={`Change ${program.name}'s type`}
      description="Your current card stops collecting new stamps. Customers who already have it keep it and can still redeem what they have earned, but they will not see it as something to keep working toward. Everyone gets moved onto the new card automatically next time they check their rewards."
      backHref="/setup"
      backLabel="Back to programs"
    >
      <SetupForm
        program={null}
        isEdit={false}
        replacingId={program.id}
        replacingType={program.type}
        vendorAvatarUrl={vendorAvatarUrl}
        cardCount={0}
        allowedFamilies={entitlement.allowedFamilies}
        allowedStampStyles={entitlement.allowedStampStyles}
        allowedCustomColor={entitlement.customColor}
      />
    </SetupShell>
  );
}
