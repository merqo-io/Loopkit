import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
} from "@merqo/ui/supabase/server";
import type { Database } from "@/lib/types";

export function createServerClient() {
  return createSupabaseServerClient<Database, "loopkit">({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    schema: "loopkit",
    cookieDomain: process.env.NEXT_PUBLIC_AUTH_COOKIE_DOMAIN,
  });
}

// Bypasses RLS: use only in Server Actions and Route Handlers.
export async function createServiceClient() {
  return createSupabaseServiceClient<Database, "loopkit">({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secretKey: process.env.SUPABASE_SECRET_KEY,
    schema: "loopkit",
  });
}
