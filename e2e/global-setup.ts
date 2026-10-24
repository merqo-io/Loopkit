import { startSupabaseMock } from "./mock-supabase";

// Starts the Supabase stand-in on the port of NEXT_PUBLIC_SUPABASE_URL (the CI
// dummy, 54321). When something already listens there (a real local stack) it
// stays out of the way and the signed-in spec skips itself.
export default async function globalSetup() {
  const url = new URL(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321",
  );
  const server = startSupabaseMock({
    tables: { admins: [{ user_id: "6df824a1-9da2-4608-ad13-2400a9114ec0" }] },
  });
  const started = await new Promise<boolean>((resolve) => {
    server.once("error", () => resolve(false));
    server.listen(Number(url.port), url.hostname, () => resolve(true));
  });
  if (!started) return;
  process.env.E2E_SUPABASE_MOCK = "1";
  return () => new Promise<void>((resolve) => server.close(() => resolve()));
}
