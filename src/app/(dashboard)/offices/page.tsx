export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { OfficesHome } from "@/components/offices/offices-home";
import { db } from "@/db";
import { offices, patients, calls } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Skeleton } from "@/components/ui/skeleton";

async function OfficesContent() {
  const [allOffices, allPatients, allCalls] = await Promise.all([
    db.select().from(offices),
    db.select().from(patients).orderBy(desc(patients.recordedAt)),
    db.select().from(calls).orderBy(desc(calls.recordedAt)),
  ]);
  return (
    <OfficesHome
      allOffices={allOffices}
      allPatients={allPatients}
      allCalls={allCalls}
    />
  );
}

export default function OfficesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 p-7">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      }
    >
      <OfficesContent />
    </Suspense>
  );
}
