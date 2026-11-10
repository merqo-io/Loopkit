import type { Metadata } from "next";
import Link from "next/link";
import { canCreateProgram, getEntitlement, isPro } from "@/lib/program";
import { SetupForm } from "@/app/setup/setup-form";
import { ProLock } from "@merqo/ui";
import { loadSetupContext } from "@/app/setup/setup-context";
import { SetupShell } from "@/app/setup/setup-shell";
import { resolveNewView, type NewView } from "@/app/setup/setup-view";

export const metadata: Metadata = { title: "New program" };

function newProgramCopy(firstRun: boolean, view: NewView) {
  if (firstRun) {
    return {
      title: "Set up your loyalty card",
      description: "Set up your loyalty card in a minute.",
    };
  }
  if (view === "create") {
    return {
      title: "Create a program",
      description: "Pick a card type and set how customers earn their reward.",
    };
  }
  return {
    title: "Add a program",
    description: "You have reached your plan's program limit.",
  };
}

export default async function NewProgramPage() {
  const { vendorName, vendorAvatarUrl, programs } = await loadSetupContext();
  const entitlement = getEntitlement(await isPro());
  const canCreate = canCreateProgram(
    entitlement,
    programs.filter((p) => p.active).length,
  );
  const view = resolveNewView(canCreate);
  const copy = newProgramCopy(programs.length === 0, view);

  return (
    <SetupShell
      vendorName={vendorName}
      title={copy.title}
      description={copy.description}
    >
      {programs.length > 0 ? (
        <div className="mb-6 text-center">
          <Link
            href="/setup"
            className="text-sm font-medium text-primary hover:underline"
          >
            Manage your programs
          </Link>
        </div>
      ) : null}

      {view === "create" ? (
        <SetupForm
          program={null}
          isEdit={false}
          replacingId={null}
          replacingType={null}
          vendorAvatarUrl={vendorAvatarUrl}
          allowedFamilies={entitlement.allowedFamilies}
          allowedStampStyles={entitlement.allowedStampStyles}
          allowedCustomColor={entitlement.customColor}
        />
      ) : (
        <div className="rounded-2xl border bg-card shadow-sm">
          <div className="px-7 py-8">
            <h2 className="text-xl font-bold tracking-tight">
              Free plan: 1 program
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              You are on the free plan, which includes one loyalty program.
            </p>
            <ProLock
              href="/dashboard/plan"
              label="Upgrade to Pro"
              className="mt-4"
            />
          </div>
        </div>
      )}
    </SetupShell>
  );
}
