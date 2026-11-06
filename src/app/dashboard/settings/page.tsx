import { redirect } from "next/navigation";

/** Settings merged into Profile; the anchor lands on the integrations block. */
export default function SettingsRedirectPage() {
  redirect("/dashboard/profile#integrations");
}
