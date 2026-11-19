import { Nav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Benefits } from "@/components/landing/benefits";
import { Footer } from "@/components/landing/footer";
import { Faq } from "@/components/landing/faq";
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
        <HowItWorks />
        <Benefits />
        <Faq />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
