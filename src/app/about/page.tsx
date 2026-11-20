import Link from "next/link";
import { AboutMerqo } from "@merqo/ui";
import { Nav } from "@/components/landing/nav";
import { Footer } from "@/components/landing/footer";
import { Button } from "@merqo/ui/primitives";
import { getLandingAccount } from "@/lib/landing-account";

export const metadata = {
  title: "About",
};

export default async function AboutPage() {
  // Reflect the session in the landing CTA: a signed-in vendor jumps straight
  // to the dashboard instead of being sent back through /login.
  const account = await getLandingAccount();
  const authed = !!account;

  return (
    <>
      <Nav authed={authed} account={account} />
      <main>
        <AboutMerqo kitName="loopkit">
          <Button asChild size="lg">
            <Link href="/">Back to loopkit</Link>
          </Button>
        </AboutMerqo>
      </main>
      <Footer />
    </>
  );
}
