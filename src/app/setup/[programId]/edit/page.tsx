import type { Metadata } from "next";
import { getEntitlement, isPro } from "@/lib/program";
import { programCardCount } from "@/lib/cards";
import { SetupForm } from "@/app/setup/setup-form";
import { loadSetupProgram } from "@/app/setup/setup-context";
import { SetupShell } from "@/app/setup/setup-shell";

export const metadata: Metadata = { title: "Edit program" };

export default async function EditProgramPage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const { programId } = await params;
  const { vendorName, vendorAvatarUrl, program } =
    await loadSetupProgram(programId);
  const entitlement = getEntitlement(await isPro());
  const cardCount = await programCardCount(program.id).catch(() => 0);

  return (
    <SetupShell
      vendorName={vendorName}
      title="Edit your card"
      description="Change how customers earn their reward."
      backHref="/setup"
      backLabel="Back to programs"
    >
      <SetupForm
        program={program}
        isEdit
        replacingId={null}
        replacingType={null}
        vendorAvatarUrl={vendorAvatarUrl}
        cardCount={cardCount}
        allowedFamilies={entitlement.allowedFamilies}
        allowedStampStyles={entitlement.allowedStampStyles}
        allowedCustomColor={entitlement.customColor}
      />
    </SetupShell>
  );
}
