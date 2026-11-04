import { PageHeader } from "@/components/page-header";

export function AdminPageHeader({ title }: { title: string }) {
  return <PageHeader eyebrow="Internal" title={title} className="mb-0" />;
}
