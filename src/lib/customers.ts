import { z } from "zod";
import { containsPattern } from "@/lib/ilike";
import { readRowsForIds } from "@/lib/read-all-rows";
import { createServerClient } from "@/lib/supabase/server";
import { listPrograms, type Program } from "@/lib/program";

export type VendorCustomerRow = {
  phone: string;
  name: string | null;
  programNames: string[];
  totalStamps: number;
  totalRewards: number;
  lastSeenAt: string;
  firstSeenAt: string;
  rewardReady: boolean;
  bestGap: number | null;
  recentProgramId: string | null;
  recentProgramName: string | null;
};

type CustomerFields = {
  phone: string;
  name: string | null;
  first_seen_at: string;
  last_seen_at: string;
};
type CardFields = {
  phone: string;
  program_id: string;
  stamp_count: number;
  reward_count?: number;
  updated_at: string;
};
type ProgramMeta = { name: string; stampsRequired: number };

// Pure: merge one vendor's customers rows with their cards across every
// program into one row per phone. programNames are deduped, and the row
// carries derived progress fields (rewardReady, bestGap) plus the program
// of the most recently touched card for the Serve link target.
export function aggregateCustomers(
  customers: CustomerFields[],
  cards: CardFields[],
  programsById: Record<string, ProgramMeta>,
): VendorCustomerRow[] {
  const cardsByPhone = new Map<string, CardFields[]>();
  for (const card of cards) {
    const existing = cardsByPhone.get(card.phone) ?? [];
    existing.push(card);
    cardsByPhone.set(card.phone, existing);
  }

  const rows = customers.map((customer) => {
    const ownCards = cardsByPhone.get(customer.phone) ?? [];
    const programNames = [...new Set(ownCards.map((c) => c.program_id))]
      .map((id) => programsById[id]?.name)
      .filter((name): name is string => name !== undefined);

    const gaps: number[] = [];
    let rewardReady = false;
    for (const c of ownCards) {
      const required = programsById[c.program_id]?.stampsRequired;
      if (required === undefined) continue;
      gaps.push(Math.max(0, required - c.stamp_count));
      if (c.stamp_count >= required) rewardReady = true;
    }

    const recent = ownCards.reduce<CardFields | null>(
      (best, c) => (best && best.updated_at >= c.updated_at ? best : c),
      null,
    );

    return {
      phone: customer.phone,
      name: customer.name,
      programNames,
      totalStamps: ownCards.reduce((sum, c) => sum + c.stamp_count, 0),
      totalRewards: ownCards.reduce((sum, c) => sum + (c.reward_count ?? 0), 0),
      lastSeenAt: customer.last_seen_at,
      firstSeenAt: customer.first_seen_at,
      rewardReady,
      bestGap: gaps.length > 0 ? Math.min(...gaps) : null,
      recentProgramId: recent?.program_id ?? null,
      recentProgramName: recent
        ? (programsById[recent.program_id]?.name ?? null)
        : null,
    };
  });

  return rows.sort((a, b) => {
    if (a.lastSeenAt !== b.lastSeenAt)
      return a.lastSeenAt < b.lastSeenAt ? 1 : -1;
    return a.phone < b.phone ? -1 : 1;
  });
}

export const CUSTOMER_PAGE_SIZE = 50;

const customerCursorSchema = z.tuple([
  z.iso.datetime({ offset: true }),
  z.string().regex(/^\+?\d{1,20}$/),
]);

export function encodeCustomerCursor(row: {
  last_seen_at: string;
  phone: string;
}): string {
  return Buffer.from(JSON.stringify([row.last_seen_at, row.phone])).toString(
    "base64url",
  );
}

// The cursor arrives from a URL, so anything that is not a well-formed
// (timestamp, phone) pair is dropped rather than interpolated into the
// PostgREST filter.
export function decodeCustomerCursor(
  raw: string | undefined,
): { lastSeenAt: string; phone: string } | null {
  if (!raw) return null;
  try {
    const parsed = customerCursorSchema.safeParse(
      JSON.parse(Buffer.from(raw, "base64url").toString("utf8")),
    );
    if (!parsed.success) return null;
    return { lastSeenAt: parsed.data[0], phone: parsed.data[1] };
  } catch {
    return null;
  }
}

export type VendorCustomerPage = {
  rows: VendorCustomerRow[];
  nextCursor: string | null;
};

// Impure shell: one page of the signed-in vendor's customers across every
// program, most recently active first (ties broken by phone so the keyset is
// total). RLS scopes both `customers` and `cards` to the vendor
// automatically (owns_program / customers_own), so no explicit vendor_id
// filter is needed here, only the program-id narrowing for the cards join.
// Cards are read only for the phones on the returned page.
export async function listVendorCustomers({
  q,
  cursor,
  limit = CUSTOMER_PAGE_SIZE,
}: {
  q?: string;
  cursor?: string;
  limit?: number;
} = {}): Promise<VendorCustomerPage> {
  const supabase = await createServerClient();
  const programs = await listPrograms();
  const programsById = Object.fromEntries(
    programs.map((p) => [
      p.id,
      { name: p.name, stampsRequired: p.stamps_required },
    ]),
  );
  const programIds = programs.map((p) => p.id);

  let customersQuery = supabase
    .from("customers")
    .select("phone,name,first_seen_at,last_seen_at")
    .order("last_seen_at", { ascending: false })
    .order("phone", { ascending: true })
    .limit(limit + 1);
  const term = q?.trim();
  if (term)
    customersQuery = customersQuery.ilike("phone", containsPattern(term));
  const after = decodeCustomerCursor(cursor);
  if (after) {
    customersQuery = customersQuery.or(
      `last_seen_at.lt."${after.lastSeenAt}",and(last_seen_at.eq."${after.lastSeenAt}",phone.gt."${after.phone}")`,
    );
  }

  const { data, error: customersError } = await customersQuery;
  if (customersError)
    throw new Error(`listVendorCustomers: ${customersError.message}`);

  const fetched = data ?? [];
  const pageRows = fetched.slice(0, limit);
  const last = pageRows.at(-1);
  const nextCursor =
    fetched.length > limit && last ? encodeCustomerCursor(last) : null;

  if (programIds.length === 0 || pageRows.length === 0) {
    return { rows: aggregateCustomers(pageRows, [], programsById), nextCursor };
  }

  const { data: cardsData, error: cardsError } = await readRowsForIds(
    pageRows.map((c) => c.phone),
    (batch, start, end) =>
      supabase
        .from("cards")
        .select("phone,program_id,stamp_count,reward_count,updated_at")
        .in("phone", batch)
        .in("program_id", programIds)
        .order("id", { ascending: true })
        .range(start, end),
  );
  if (cardsError) throw new Error(`listVendorCustomers: ${cardsError.message}`);

  return {
    rows: aggregateCustomers(pageRows, cardsData ?? [], programsById),
    nextCursor,
  };
}

export type CustomerCardRow = {
  programId: string;
  programName: string;
  programType: string;
  stampCount: number;
  rewardCount: number;
  updatedAt: string;
};

export type CustomerDetail = {
  phone: string;
  name: string | null;
  lastSeenAt: string | null;
  cards: CustomerCardRow[];
};

// One customer's real name (from `customers`, synced off card/stamp
// events — see 0021_loopkit_customers.sql) plus every card they hold
// across the vendor's own programs. RLS scopes both reads to the
// signed-in vendor automatically, same as listVendorCustomers.
export async function getCustomerDetail(
  phone: string,
): Promise<CustomerDetail> {
  const supabase = await createServerClient();
  const programs = await listPrograms();
  const programById = new Map<string, Program>(programs.map((p) => [p.id, p]));
  const programIds = programs.map((p) => p.id);

  const { data: customerData, error: customerError } = await supabase
    .from("customers")
    .select("name,last_seen_at")
    .eq("phone", phone)
    .maybeSingle();
  if (customerError)
    throw new Error(`getCustomerDetail: ${customerError.message}`);

  let cards: CustomerCardRow[] = [];
  if (programIds.length > 0) {
    const { data: cardsData, error: cardsError } = await readRowsForIds(
      programIds,
      (batch, start, end) =>
        supabase
          .from("cards")
          .select("program_id,stamp_count,reward_count,updated_at")
          .eq("phone", phone)
          .in("program_id", batch)
          .order("id", { ascending: true })
          .range(start, end),
    );
    if (cardsError) throw new Error(`getCustomerDetail: ${cardsError.message}`);
    cards = (cardsData ?? [])
      .map((card) => {
        const program = programById.get(card.program_id);
        if (!program) return null;
        return {
          programId: card.program_id,
          programName: program.name,
          programType: program.type,
          stampCount: card.stamp_count,
          rewardCount: card.reward_count,
          updatedAt: card.updated_at,
        };
      })
      .filter((row): row is CustomerCardRow => row !== null);
  }

  return {
    phone,
    name: customerData?.name ?? null,
    lastSeenAt: customerData?.last_seen_at ?? null,
    cards,
  };
}

export type MarketingConsentStatus = {
  granted: boolean;
  recordedAt: string;
  vendorRecorded: boolean;
} | null;

// Latest row wins; RLS limits the read to the signed-in vendor's own log.
export async function getMarketingConsentStatus(
  phone: string,
): Promise<MarketingConsentStatus> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("marketing_consents")
    .select("granted,recorded_at,source")
    .eq("phone", phone)
    .order("recorded_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`getMarketingConsentStatus: ${error.message}`);
  if (!data) return null;
  return {
    granted: data.granted,
    recordedAt: data.recorded_at,
    vendorRecorded: data.source === "vendor_recorded",
  };
}
