import { Nav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { CardJourney } from "@/components/landing/card-journey";
import { LandingClosing, LandingFaq } from "@/components/landing/sections";
import { Footer } from "@/components/landing/footer";
import { BackToTop } from "@merqo/ui";
import { getLandingAccount } from "@/lib/landing-account";

export default async function Home() {
  // Reflect the session in the landing CTAs: a signed-in vendor jumps straight
  // to the dashboard instead of being sent back through /login.
  const account = await getLandingAccount();
  const authed = !!account;

  return (
    <>
      <Nav authed={authed} account={account} />
      <main>
        <Hero authed={authed} />
        <CardJourney />
        <LandingFaq />
        <LandingClosing authed={authed} />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
