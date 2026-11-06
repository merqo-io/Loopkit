import type { CoreTables } from "./tables-core";
import type { VendorCustomerTables } from "./tables-vendor-customer";
import type { DatabaseFunctions } from "./functions";

// Hand-written mirror of supabase/migrations/0001_loopkit_core.sql — no live
// DB/codegen available yet. Keep in sync with the migration; keep the schema
// key in sync with `db.schema` in src/lib/supabase/{client,server}.ts and
// src/lib/supabase/middleware.ts, or supabase-js queries degrade to `never`.
export interface Database {
  loopkit: {
    Tables: CoreTables & VendorCustomerTables;
    Views: Record<string, never>;
    Functions: DatabaseFunctions;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
