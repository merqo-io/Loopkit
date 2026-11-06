import { headers } from "next/headers";
import { requireVendor } from "@/features/auth";
import { listPrograms } from "@/lib/program";
import { listReferralHosts, referralLink } from "@/lib/referrals";
import { qrSvg } from "@merqo/ui";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { CustomersTabs } from "../customers-tabs";
import { ReferralsPanel } from "./referrals-panel";

export const metadata = { title: "Referrals" };

export default async function ReferralsPage() {
  const { user } = await requireVendor();

  const [programs, referralHosts] = await Promise.all([
    listPrograms(),
    listReferralHosts(),
  ]);
  const activePrograms = programs.filter((p) => p.active);
  const programNameById = Object.fromEntries(
    programs.map((p) => [p.id, p.name]),
  );

  const h = await headers();
  const origin =
    process.env.NEXT_PUBLIC_BASE_URL ??
    `https://${h.get("x-forwarded-host") ?? h.get("host")}`;

  const hosts = await Promise.all(
    referralHosts.map(async (host) => {
      const link = referralLink(origin, user.id, host.referralCode);
      return {
        id: host.id,
        programId: host.programId,
        programName: programNameById[host.programId] ?? "Unknown program",
        hostPhone: host.hostPhone,
        label: host.label,
        referralCode: host.referralCode,
        guestCount: host.guestCount,
        link,
        qr: await qrSvg(link),
      };
    }),
  );

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader eyebrow="Customers" title="Referrals" className="mb-0">
        A wedding or event guest is a one-off visit, but the host who chose you,
        the bride, groom, or organizer, is a real repeat relationship. Give a
        host their own link on one of your programs: every guest who joins
        through it earns their own card as usual, and bumps the host one
        stamp/visit.
      </PageHeader>
      <CustomersTabs current="referrals" />

      {activePrograms.length === 0 ? (
        <EmptyState title="No active program yet.">
          Set up an active program first, then come back to create a referral
          link.
        </EmptyState>
      ) : (
        <ReferralsPanel
          programs={activePrograms.map((p) => ({ id: p.id, name: p.name }))}
          initialHosts={hosts}
        />
      )}
    </div>
  );
}
