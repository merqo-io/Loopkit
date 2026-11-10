import { updateSupabaseSession } from "@merqo/ui/supabase/middleware";
import type { NextRequest } from "next/server";

// Only these prefixes need a session; everything else (the landing page, the
// login page, and the public customer stamp-card view) is public.
const PROTECTED_PREFIXES = ["/dashboard", "/setup"];

// The public customer stamp-card view is anonymous and hot, so it skips the
// auth round-trip (and any auth-outage 500). Every other public route still
// refreshes the session: skipping it lets the token age out and silently logs
// the vendor out when they return.
function isCustomerView(path: string): boolean {
  return path === "/c" || path.startsWith("/c/");
}

export function updateSession(request: NextRequest) {
  return updateSupabaseSession(request, {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    schema: "loopkit",
    cookieDomain: process.env.NEXT_PUBLIC_AUTH_COOKIE_DOMAIN,
    protectedPrefixes: PROTECTED_PREFIXES,
    refreshPublicRoutes: !isCustomerView(request.nextUrl.pathname),
  });
}
