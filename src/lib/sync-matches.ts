import "server-only";
import { db } from "~/server/db";
import { fetchAllMatches } from "./football-api";

// During an active/live match window, sync every minute. Otherwise every 11 min.
const SYNC_INTERVAL_ACTIVE_MS = 60 * 1_000;
const SYNC_INTERVAL_IDLE_MS = 11 * 60 * 1_000;

async function hasActiveMatch(): Promise<boolean> {
  const match = await db.match.findFirst({
    where: {
      status: "LIVE",
    },
    select: { id: true },
  });
  return !!match;
}

// Atomically claim the right to run a sync. Returns true if this caller should sync.
async function claimSync(): Promise<boolean> {
  const isActive = await hasActiveMatch();
  const interval = isActive ? SYNC_INTERVAL_ACTIVE_MS : SYNC_INTERVAL_IDLE_MS;
  const staleBefore = new Date(Date.now() - interval);

  const claimed = await db.syncLog.updateMany({
    where: { id: "singleton", syncedAt: { lt: staleBefore } },
    data: { syncedAt: new Date() },
  });
  if (claimed.count > 0) return true;

  // First ever sync — row doesn't exist yet
  try {
    await db.syncLog.create({ data: { id: "singleton", syncedAt: new Date() } });
    return true;
  } catch {
    return false; // another request created it first
  }
}

export async function syncMatches(): Promise<{
  created: number;
  updated: number;
  total: number;
}> {
  const apiMatches = await fetchAllMatches();

  // Single query: get all existing match states
  const existing = await db.match.findMany({
    select: { externalId: true, status: true },
  });
  const dbState = new Map(existing.map((m) => [m.externalId, m.status]));

  let created = 0;
  let updated = 0;

  for (const match of apiMatches) {
    const dbStatus = dbState.get(match.externalId);

    if (!dbStatus) {
      await db.match.create({ data: match });
      created++;
    } else {
      await db.match.update({
        where: { externalId: match.externalId },
        data: {
          homeScore: match.homeScore,
          awayScore: match.awayScore,
          penaltyWinner: match.penaltyWinner,
          status: match.status,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          kickoffAt: match.kickoffAt,
        },
      });
      updated++;
    }
  }

  return { created, updated, total: apiMatches.length };
}

// Called from the explicit /api/sync cron route
export async function markSyncing(): Promise<void> {
  await db.syncLog.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", syncedAt: new Date() },
    update: { syncedAt: new Date() },
  });
}

// Called on each getAll request — syncs if stale, skips if not
export async function syncIfStale(): Promise<void> {
  if (!(await claimSync())) return;
  await syncMatches();
}
