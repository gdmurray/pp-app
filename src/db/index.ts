import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// For server-side use only — never import in client components.
// Uses the pooler connection URL from Supabase.
const client = postgres(process.env.DATABASE_URL!, {
  prepare: false, // Required for Supabase Transaction Mode pooler
  // In production (Vercel) keep max:1 for serverless safety.
  // In dev the process is long-lived so allow parallel queries.
  max: process.env.NODE_ENV === "production" ? 1 : 10,
  connect_timeout: 10, // fail fast instead of hanging for 75s
  idle_timeout: 20,
});

export const db = drizzle(client, { schema });
export * from "./schema";
