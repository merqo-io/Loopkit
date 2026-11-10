import { createSupabaseBrowserClient } from "@merqo/ui/supabase";
import type { Database } from "@/lib/types";

export function createClient() {
  return createSupabaseBrowserClient<Database, "loopkit">({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    schema: "loopkit",
    // The reference stays literal so Next inlines it into the browser bundle.
    cookieDomain: process.env.NEXT_PUBLIC_AUTH_COOKIE_DOMAIN,
  });
}
