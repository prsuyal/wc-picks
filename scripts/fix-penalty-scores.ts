/**
 * One-off fix: re-fetch all matches from the football API and correct scores.
 * For penalty shootout matches the API stuffs pen scores into fullTime —
 * we use extraTime or regularTime for the actual match score instead.
 *
 * Run: DATABASE_URL="..." FOOTBALL_DATA_API_KEY="..." npx tsx scripts/fix-penalty-scores.ts
 */
import { PrismaClient } from "../generated/prisma";

const db = new PrismaClient();
const API_KEY = process.env.FOOTBALL_DATA_API_KEY!;
const BASE_URL = "https://api.football-data.org/v4";

type Score = { home: number | null; away: number | null };

async function main() {
  console.log("Fetching matches from football API...");
  const res = await fetch(`${BASE_URL}/competitions/WC/matches`, {
    headers: { "X-Auth-Token": API_KEY },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);

  const data = (await res.json()) as {
    matches: {
      id: number;
      status: string;
      score: {
        fullTime: Score;
        regularTime: Score | null;
        extraTime: Score | null;
        penalties: Score | null;
      };
    }[];
  };

  let fixed = 0;
  for (const m of data.matches) {
    const { fullTime, regularTime, extraTime, penalties } = m.score;
    if (m.status !== "FINISHED") continue;

    const penaltyWinner =
      penalties?.home != null && penalties?.away != null
        ? penalties.home > penalties.away ? "home" : "away"
        : null;

    // For pen matches, fullTime has pen scores.
    // regularTime = 90min score, extraTime = ET-period goals only.
    // Correct after-ET score = regularTime + extraTime.
    let score: Score;
    if (penaltyWinner && regularTime?.home != null && regularTime?.away != null) {
      score = {
        home: regularTime.home + (extraTime?.home ?? 0),
        away: regularTime.away + (extraTime?.away ?? 0),
      };
    } else {
      score = fullTime;
    }

    if (score.home === null || score.away === null) continue;

    const result = await db.match.updateMany({
      where: { externalId: String(m.id) },
      data: { homeScore: score.home, awayScore: score.away, penaltyWinner },
    });

    if (result.count > 0) {
      console.log(`  Updated ${m.id}: ${score.home}-${score.away}${penaltyWinner ? ` (${penaltyWinner} wins pens)` : ""}`);
      fixed++;
    }
  }

  console.log(`\nDone. Updated ${fixed} matches.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
