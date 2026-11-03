import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Invalid email"),
  // No min-length here: unlike a new-password field, this just guards against
  // an empty submit — Supabase itself is the source of truth on password
  // policy and returns its own error for a rejected sign-in/sign-up.
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const supportMessageSchema = z.object({
  category: z.enum(["program", "customers", "billing", "other"]),
  body: z.string().trim().min(1, "Tell us what's wrong").max(2000),
});
export type SupportMessageInput = z.infer<typeof supportMessageSchema>;

export const SUPPORT_CATEGORY_LABELS: Record<
  SupportMessageInput["category"],
  string
> = {
  program: "Program / cards",
  customers: "Customers",
  billing: "Pro plan",
  other: "Something else",
};

// Route/action boundaries

export const authCallbackQuerySchema = z.object({
  code: z.string().min(1).max(512),
});

// Same-origin relative path only: a leading "//" or backslash would leave the site.
export const redirectPathSchema = z
  .string()
  .max(512)
  .regex(/^\/(?![/\\])/);
