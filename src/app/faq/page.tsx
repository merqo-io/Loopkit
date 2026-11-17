import { FaqPage } from "@merqo/ui";
import { Nav } from "@/components/landing/nav";
import { Footer } from "@/components/landing/footer";
import { createServerClient } from "@/lib/supabase/server";
import { FAQ_GROUPS, FAQ_INTRO, FAQ_TITLE } from "./faq-content";

export const metadata = {
  title: "FAQ",
};

export default async function FaqRoute() {
  // Reflect the session in the nav CTA, as /about does.
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <Nav authed={!!user} />
      <main>
        <FaqPage title={FAQ_TITLE} intro={FAQ_INTRO} groups={FAQ_GROUPS} />
      </main>
      <Footer />
    </>
  );
}
