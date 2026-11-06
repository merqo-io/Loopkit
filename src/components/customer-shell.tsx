import type { ReactNode } from "react";
import { PageHeader } from "@merqo/ui";
import { Wordmark } from "@/components/landing/wordmark";

/**
 * The frame shared by the pages a shop's customers open from a QR code or
 * link (/c, /earn): one wordmark, one width, one header rhythm.
 */
export function CustomerShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  /** Muted line under the title. */
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-8 sm:py-12">
      <Wordmark className="mb-8 text-2xl" />
      <PageHeader responsive eyebrow={eyebrow} title={title}>
        {description}
      </PageHeader>
      {children}
    </main>
  );
}
