import { cache } from "react";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Database = PostgresJsDatabase<typeof schema>;

function createPostgres() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  return postgres(url, {
    // Required for Supabase transaction pooler (port 6543).
    prepare: false,
    // One connection per client instance — correct for pooler transaction mode.
    max: 1,
    connect_timeout: 10,
    // Release pooler slots quickly on Vercel (warm lambdas otherwise hoard connections).
    idle_timeout: 2,
    max_lifetime: 60 * 3,
  });
}

/**
 * One postgres client per server request (React cache scope).
 * Avoids a module-level singleton that shares a single connection across
 * concurrent requests on the same warm Vercel instance — that exhausts the
 * Supabase pooler and pages hang indefinitely.
 */
export const getDb = cache((): Database => {
  return drizzle(createPostgres(), { schema });
});

/** @deprecated Prefer getDb() in new code. Delegates to per-request getDb(). */
export const db = new Proxy({} as Database, {
  get(_target, prop, receiver) {
    const instance = getDb();
    const value = Reflect.get(instance, prop, receiver);
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(instance)
      : value;
  },
});

export * from "./schema";
