import type { Metadata } from "next";
import { getEntitlement, isPro } from "@/lib/program";
import { SetupForm } from "@/app/setup/setup-form";
import { loadSetupProgram } from "@/app/setup/setup-context";
import { SetupShell } from "@/app/setup/setup-shell";

export const metadata: Metadata = { title: "Prep replacement" };

export default async function PrepProgramPage({
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
      title={`Set up ${program.name}'s replacement`}
      description="Set up the card that replaces it. It stays hidden from customers until you activate it."
      backHref="/setup"
      backLabel="Back to programs"
    >
      <SetupForm
        program={null}
        isEdit={false}
        replacingId={null}
        replacingType={null}
        prepping
        vendorAvatarUrl={vendorAvatarUrl}
        allowedFamilies={entitlement.allowedFamilies}
        allowedStampStyles={entitlement.allowedStampStyles}
        allowedCustomColor={entitlement.customColor}
      />
    </SetupShell>
  );
}
