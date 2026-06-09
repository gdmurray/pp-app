import { cache } from "react";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Database = PostgresJsDatabase<typeof schema>;

/** Max concurrent queries in a single RSC request (layout + page Promise.all). */
const POOL_SIZE = 6;

function createPostgres() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  return postgres(url, {
    // Required for Supabase transaction pooler (port 6543).
    prepare: false,
    // MUST be >= parallel queries per request. max: 1 deadlocks with Promise.all
    // (postgres.js waits for a free slot that never opens). Layout + home page
    // run up to 5 queries concurrently.
    max: POOL_SIZE,
    connect_timeout: 10,
    // Release pooler slots quickly once the request finishes.
    idle_timeout: 2,
    max_lifetime: 60 * 3,
  });
}

/**
 * One postgres client per server request (React cache scope).
 * Avoids sharing a module-level singleton across concurrent Vercel invocations.
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
