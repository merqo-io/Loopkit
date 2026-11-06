import { PageHeader } from "@merqo/ui";

export function AdminPageHeader({ title }: { title: string }) {
  return (
    <PageHeader responsive eyebrow="Internal" title={title} className="mb-0" />
  );
}
