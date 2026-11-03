import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { listAllUsers } from "@/lib/list-all-users";
import { provisionBearerOk } from "@/lib/merqo-auth";
import { entitlementPayloadSchema } from "@/lib/merqo-entitlement-contract";

export const revalidate = 0;

const KIT = "loopkit";

export async function POST(request: Request) {
  if (!provisionBearerOk(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = entitlementPayloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const payload = parsed.data;
  if (payload.kit !== KIT) {
    return NextResponse.json({ error: "Wrong kit" }, { status: 400 });
  }

  const supabase = await createServiceClient();

  const usersRes = await listAllUsers(supabase);
  if (usersRes.error) {
    console.error(
      "merqo entitlement: user lookup failed",
      usersRes.error.message,
    );
    return NextResponse.json(
      { error: "Upstream unavailable" },
      { status: 503 },
    );
  }
  const key = payload.email.toLowerCase();
  const user = (usersRes.data?.users ?? []).find(
    (u) => u.email?.toLowerCase() === key,
  );
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "unknown_vendor" },
      { status: 404 },
    );
  }

  // The SQL function drops a push that is not newer than the stored one, so
  // a stale retry still answers 200 without overwriting later state.
  const { error } = await supabase.rpc("upsert_vendor_entitlement", {
    p_vendor_id: user.id,
    p_tier: payload.tier,
    p_founder: payload.founder,
    p_stats_window: payload.stats_window,
    p_valid_until: payload.valid_until,
    p_issued_at: payload.issued_at,
  });
  if (error) {
    console.error("merqo entitlement: upsert failed", error.message);
    return NextResponse.json(
      { error: "Could not store entitlement" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
