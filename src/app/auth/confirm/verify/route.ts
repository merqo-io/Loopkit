import { handleAuthConfirm } from "@merqo/ui/auth";
import { createServerClient } from "@/lib/supabase/server";

export const POST = (request: Request) =>
  handleAuthConfirm(request, {
    createClient: createServerClient,
    defaultNext: "/dashboard",
    recovery: { path: "/reset-password" },
  });
