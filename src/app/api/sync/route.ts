import { NextResponse } from "next/server";
import { syncMatches, markSyncing } from "~/lib/sync-matches";
import { env } from "~/env";

export const maxDuration = 30;

export async function GET(request: Request) {
  if (env.NODE_ENV === "production") {
    const authHeader = request.headers.get("authorization");
    if (!env.CRON_SECRET || authHeader !== `Bearer ${env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  await markSyncing();
  const result = await syncMatches();
  return NextResponse.json(result);
}
