import { readAllRows, readRowsForIds } from "@/lib/read-all-rows";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { listAllUsers } from "@/lib/list-all-users";
import { bearerOk } from "@/lib/merqo-auth";
import { computeVendorActivity } from "@/lib/merqo-vendor-activity";

export const revalidate = 0;

const querySchema = z.object({ email: z.email() });

type ServiceClient = Awaited<ReturnType<typeof createServiceClient>>;

type ActivityEvent = {
  card_id: string;
  kind: string;
  created_at: string;
  payload?: unknown;
};

function upstreamUnavailable(message: string | undefined) {
  console.error("merqo vendor-activity: read failed", message);
  return NextResponse.json({ error: "Upstream unavailable" }, { status: 503 });
}

async function readProgramsAndPlan(supabase: ServiceClient, userId: string) {
  const [programsRes, proRes] = await Promise.all([
    readAllRows((start, end) =>
      supabase
        .from("programs")
        .select("id")
        .eq("vendor_id", userId)
        .order("id", { ascending: true })
        .range(start, end),
    ),
    readAllRows((start, end) =>
      supabase
        .from("vendor_pro")
        .select("vendor_id")
        .eq("vendor_id", userId)
        .order("vendor_id", { ascending: true })
        .range(start, end),
    ),
  ]);
  const failure = programsRes.error ?? proRes.error;
  if (failure) return { error: failure.message };
  return {
    isPro: (proRes.data ?? []).length > 0,
    programs: (programsRes.data ?? []).map((p) => ({ id: p.id as string })),
  };
}

async function readCardsAndEvents(
  supabase: ServiceClient,
  programIds: string[],
) {
  let cards: { id: string }[] = [];
  let events: ActivityEvent[] = [];
  if (programIds.length === 0) return { cards, events };

  const cardsRes = await readRowsForIds(programIds, (batch, start, end) =>
    supabase
      .from("cards")
      .select("id")
      .in("program_id", batch)
      .order("id", { ascending: true })
      .range(start, end),
  );
  if (cardsRes.error) return { error: cardsRes.error.message };
  cards = (cardsRes.data ?? []).map((c) => ({ id: c.id as string }));
  if (cards.length === 0) return { cards, events };

  const eventsRes = await readRowsForIds(
    cards.map((c) => c.id),
    (batch, start, end) =>
      supabase
        .from("stamp_events")
        .select("card_id, kind, created_at, payload")
        .in("card_id", batch)
        .order("id", { ascending: true })
        .range(start, end),
  );
  if (eventsRes.error) return { error: eventsRes.error.message };
  events = eventsRes.data ?? [];
  return { cards, events };
}

export async function GET(request: Request) {
  if (!bearerOk(request, "MERQO_METRICS_SECRET")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    email: searchParams.get("email") ?? "",
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  const supabase = await createServiceClient();

  const usersRes = await listAllUsers(supabase);
  if (usersRes.error) return upstreamUnavailable(usersRes.error.message);

  const key = parsed.data.email.toLowerCase();
  const user = (usersRes.data?.users ?? []).find(
    (u) => u.email?.toLowerCase() === key,
  );
  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const base = await readProgramsAndPlan(supabase, user.id);
  if ("error" in base) return upstreamUnavailable(base.error);
  const rest = await readCardsAndEvents(
    supabase,
    base.programs.map((p) => p.id),
  );
  if ("error" in rest) return upstreamUnavailable(rest.error);

  const payload = computeVendorActivity(
    base.isPro,
    { programs: base.programs, cards: rest.cards, events: rest.events },
    Date.now(),
  );
  return NextResponse.json(payload);
}
