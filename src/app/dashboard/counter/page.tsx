import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { requireVendor } from "@/features/auth";
import {
  listPrograms,
  currentProgram,
  isPro,
  getEntitlement,
} from "@/lib/program";
import { activeCardCountsByProgram } from "@/lib/cards";
import { getVendorProfile } from "@/lib/vendor";
import {
  PROGRAM_TYPE_BADGE,
  describeProgram,
} from "@/app/dashboard/program-display";
import { pickDefaultCounterProgram } from "@/app/dashboard/counter/counter-view";
import { RememberProgram } from "@/app/dashboard/counter/remember-program";
import { ServeCustomer } from "@/app/dashboard/serve-customer";
import { ProgramSwitcher } from "@/app/dashboard/program-switcher";
import { BackButton, qrSvg } from "@merqo/ui";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Counter" };

type CounterPageProps = {
  searchParams: Promise<{ p?: string; phone?: string }>;
};

export default async function CounterPage({ searchParams }: CounterPageProps) {
  const { user } = await requireVendor();

  const { p, phone } = await searchParams;

  const programs = await listPrograms();
  if (programs.length === 0) redirect("/dashboard");
  const activePrograms = programs.filter((prog) => prog.active);

  if (!p) {
    const counts = await activeCardCountsByProgram(
      activePrograms.map((prog) => prog.id),
    );
    const target = pickDefaultCounterProgram(activePrograms, counts);
    if (!target) redirect("/dashboard");
    redirect(`/dashboard/counter?p=${target}`);
  }

  const program = currentProgram(programs, p);
  if (!program) redirect("/dashboard");

  const badge = PROGRAM_TYPE_BADGE[program.type] ?? PROGRAM_TYPE_BADGE.stamp;
  const config = (program.config ?? {}) as {
    redemption_mode?: "catalog" | "offset";
  };

  const h = await headers();
  const origin =
    process.env.NEXT_PUBLIC_BASE_URL ??
    `https://${h.get("x-forwarded-host") ?? h.get("host")}`;
  const shopJoinLink = `${origin}/c?v=${user.id}`;
  const shopJoinQrSvg = await qrSvg(shopJoinLink);
  const shopName = (await getVendorProfile()).name ?? "Your stall";
  const entitlement = getEntitlement(await isPro());

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <BackButton href="/dashboard" label="Back to dashboard" />

      <PageHeader
        eyebrow="Daily work"
        title="Counter"
        className="mb-0"
        action={
          <ProgramSwitcher
            programs={activePrograms.map((prog) => ({
              id: prog.id,
              name: prog.name,
            }))}
            currentId={program.id}
            basePath="/dashboard/counter"
          />
        }
      >
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>
            {program.name} · {describeProgram(program)}
          </span>
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </span>
      </PageHeader>

      <RememberProgram id={program.id} />

      <ServeCustomer
        key={program.id}
        programId={program.id}
        type={program.type}
        stampsRequired={program.stamps_required}
        rewardText={program.reward_text}
        initialPhone={phone}
        pointsRedemptionMode={config.redemption_mode}
        shopName={shopName}
        shopJoinQrSvg={shopJoinQrSvg}
        shopJoinLink={shopJoinLink}
        showBranding={entitlement.showBranding}
      />
    </div>
  );
}
