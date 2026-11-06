import type { ReactNode } from "react";
import { BackButton, PageHeader } from "@merqo/ui";

export function SetupShell({
  vendorName,
  title,
  description,
  backHref = "/dashboard",
  backLabel = "Back to dashboard",
  children,
}: {
  vendorName: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col p-5 md:max-w-4xl">
      <div className="w-full">
        <div className="mb-4">
          <BackButton href={backHref} label={backLabel} />
        </div>
        <PageHeader responsive eyebrow={vendorName} title={title}>
          {description}
        </PageHeader>
        {children}
      </div>
    </main>
  );
}
