import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { createServerClient } from "@/lib/supabase/server";
import { Wordmark } from "@/components/landing/wordmark";
import { Button } from "@merqo/ui/primitives";
import { AdminFrame } from "@/app/admin/admin-frame";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Gate every /admin route: non-admins get a 404 from requireAdmin.
  await requireAdmin();

  async function signOut() {
    "use server";
    const supabase = await createServerClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <AdminFrame
      wordmark={<Wordmark className="text-xl" />}
      actions={
        <form action={signOut}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="min-h-11 rounded-lg text-muted-foreground"
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Sign out</span>
            <span className="sr-only sm:hidden">Sign out</span>
          </Button>
        </form>
      }
    >
      {children}
    </AdminFrame>
  );
}
