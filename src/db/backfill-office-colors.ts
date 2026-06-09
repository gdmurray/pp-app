/**
 * One-time backfill: clear stored office colors so resolveOfficeColor()
 * derives them from practice names. Run with:
 *   pnpm db:backfill-colors
 */
import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const client = postgres(process.env.DATABASE_URL!, { prepare: false, max: 1 })
const db = drizzle(client, { schema })

async function main() {
  const updated = await db
    .update(schema.offices)
    .set({ color: '', updatedAt: new Date() })
    .returning({ id: schema.offices.id, name: schema.offices.name })

  console.log(`Cleared custom colors on ${updated.length} office(s).`)
  for (const office of updated) {
    console.log(`  → ${office.name}`)
  }
  await client.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
