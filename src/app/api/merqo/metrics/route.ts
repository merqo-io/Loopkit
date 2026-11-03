import { readAllRows } from "@/lib/read-all-rows";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { computeLoopkitMetrics } from "@/lib/metrics";
import { bearerOk } from "@/lib/merqo-auth";

export const revalidate = 0;

export async function GET(request: Request) {
  if (!bearerOk(request, "MERQO_METRICS_SECRET")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServiceClient();

  // Four independent reads, issue them concurrently so endpoint latency is
  // one round-trip, not the sum of three.
  const [programsRes, cardsRes, stampEventsRes, entitlementsRes] =
    await Promise.all([
      readAllRows((start, end) =>
        supabase
          .from("programs")
          .select("id, active, created_at")
          .order("id", { ascending: true })
          .range(start, end),
      ),
      readAllRows((start, end) =>
        supabase
          .from("cards")
          .select("id, program_id")
          .order("id", { ascending: true })
          .range(start, end),
      ),
      readAllRows((start, end) =>
        supabase
          .from("stamp_events")
          .select("card_id, kind, created_at, payload")
          .order("id", { ascending: true })
          .range(start, end),
      ),
      readAllRows((start, end) =>
        supabase
          .from("vendor_entitlements")
          .select("vendor_id, tier, valid_until")
          .order("vendor_id", { ascending: true })
          .range(start, end),
      ),
    ]);

  for (const r of [programsRes, cardsRes, stampEventsRes, entitlementsRes]) {
    if (r.error) {
      console.error("merqo metrics: read failed", r.error.message);
      return NextResponse.json(
        { error: "Upstream unavailable" },
        { status: 503 },
      );
    }
  }

  const metrics = computeLoopkitMetrics({
    nowMs: Date.now(),
    programs: programsRes.data ?? [],
    cards: cardsRes.data ?? [],
    stampEvents: stampEventsRes.data ?? [],
    entitlements: entitlementsRes.data ?? [],
  });

  return NextResponse.json({
    product: "loopkit",
    generated_at: new Date().toISOString(),
    ...metrics,
  });
}
