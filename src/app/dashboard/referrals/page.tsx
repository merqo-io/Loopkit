import { redirect } from "next/navigation";

/** Referrals moved under Customers; kept so old bookmarks and links still land. */
export default function ReferralsRedirectPage() {
  redirect("/dashboard/customers/referrals");
}
