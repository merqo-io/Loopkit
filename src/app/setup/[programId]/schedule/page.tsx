import type { Metadata } from "next";
import { ScheduleRetirementForm } from "@/app/setup/schedule-retirement-form";
import { loadSetupProgram } from "@/app/setup/setup-context";
import { SetupShell } from "@/app/setup/setup-shell";

export const metadata: Metadata = { title: "Schedule retirement" };

export default async function ScheduleProgramPage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const { programId } = await params;
  const { vendorName, programs, program } = await loadSetupProgram(programId);
  const successors = programs.filter((p) => p.active && p.id !== program.id);

  return (
    <SetupShell
      vendorName={vendorName}
      title={`Schedule ${program.name}'s retirement`}
      description="Pick the date it retires and which card takes over."
      backHref="/setup"
      backLabel="Back to programs"
    >
      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="px-7 py-8">
          <p className="text-sm text-muted-foreground">
            {program.name} keeps running until the date you pick, then it hands
            over automatically.
          </p>
          <ScheduleRetirementForm program={program} successors={successors} />
        </div>
      </div>
    </SetupShell>
  );
}
