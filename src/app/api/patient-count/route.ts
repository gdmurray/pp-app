import { NextResponse } from 'next/server'
import { db } from '@/db'
import { patients } from '@/db/schema'
import { sql } from 'drizzle-orm'
import { isApiAuthenticated } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!(await isApiAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(patients)
  return NextResponse.json(row?.count ?? 0)
}
