import { LegalDocument } from "@merqo/ui";

export const metadata = { title: "Terms of service" };

export default function TermsPage() {
  return <LegalDocument doc="terms" kit="loopkit" />;
}
