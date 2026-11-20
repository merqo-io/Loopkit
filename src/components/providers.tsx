"use client";

import Link from "next/link";
import { AppLinkProvider } from "@merqo/ui";
import { Toaster } from "sonner";

/**
 * AppLinkProvider hands next/link to every client export of `@merqo/ui`
 * (nav, account menu, auth forms). Passing `LinkComponent={Link}` from a
 * Server Component instead fails: a function can't cross the server/client
 * boundary.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppLinkProvider component={Link}>
      {children}
      <Toaster position="top-right" richColors />
    </AppLinkProvider>
  );
}
