/**
 * Seeds fake knockout stage matches in various states so you can preview the UI.
 * Run: pnpm seed:knockout-demo
 *
 * Creates:
 *  - 2 FINISHED R16 matches (one with pens)
 *  - 1 LIVE R16 match
 *  - 2 SCHEDULED R16 matches
 *  - 1 SCHEDULED QF match
 *
 * Cleans up any previously seeded demo matches first (identified by externalId prefix "demo-").
 */
import { PrismaClient } from "../generated/prisma";

const db = new PrismaClient();

const now = new Date();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000);
const hoursFromNow = (h: number) => new Date(now.getTime() + h * 60 * 60 * 1000);

const DEMO_MATCHES = [
  // --- FINISHED ---
  {
    externalId: "demo-r16-1",
    homeTeam: "Brazil",
    awayTeam: "Argentina",
    round: "ROUND_OF_16" as const,
    kickoffAt: hoursAgo(26),
    homeScore: 1,
    awayScore: 1,
    penaltyWinner: "away", // Argentina wins pens
    status: "FINISHED" as const,
  },
  {
    externalId: "demo-r16-2",
    homeTeam: "France",
    awayTeam: "England",
    round: "ROUND_OF_16" as const,
    kickoffAt: hoursAgo(22),
    homeScore: 2,
    awayScore: 1,
    penaltyWinner: null,
    status: "FINISHED" as const,
  },
  // --- LIVE ---
  {
    externalId: "demo-r16-3",
    homeTeam: "Spain",
    awayTeam: "Germany",
    round: "ROUND_OF_16" as const,
    kickoffAt: hoursAgo(1),
    homeScore: null,
    awayScore: null,
    penaltyWinner: null,
    status: "LIVE" as const,
  },
  // --- SCHEDULED (today/tomorrow) ---
  {
    externalId: "demo-r16-4",
    homeTeam: "United States",
    awayTeam: "Mexico",
    round: "ROUND_OF_16" as const,
    kickoffAt: hoursFromNow(4),
    homeScore: null,
    awayScore: null,
    penaltyWinner: null,
    status: "SCHEDULED" as const,
  },
  {
    externalId: "demo-r16-5",
    homeTeam: "Portugal",
    awayTeam: "Morocco",
    round: "ROUND_OF_16" as const,
    kickoffAt: hoursFromNow(28),
    homeScore: null,
    awayScore: null,
    penaltyWinner: null,
    status: "SCHEDULED" as const,
  },
  // --- SCHEDULED QF ---
  {
    externalId: "demo-qf-1",
    homeTeam: "Netherlands",
    awayTeam: "Japan",
    round: "QUARTER_FINAL" as const,
    kickoffAt: hoursFromNow(52),
    homeScore: null,
    awayScore: null,
    penaltyWinner: null,
    status: "SCHEDULED" as const,
  },
];

// Predictions: one entry per (userEmail, matchExternalId)
// penaltyWinnerPred only on draw predictions for knockout matches
const DEMO_PICKS: {
  email: string;
  matchId: string;
  home: number;
  away: number;
  penWinner?: "home" | "away";
}[] = [
  // --- Brazil 1-1 Argentina (pens: Argentina) ---
  { email: "suyalpranshu@gmail.com",         matchId: "demo-r16-1", home: 1, away: 1, penWinner: "away" }, // correct draw + correct pens ✓
  { email: "ayanp2007@gmail.com",            matchId: "demo-r16-1", home: 1, away: 1, penWinner: "home" }, // correct draw, wrong pens
  { email: "johnkenton94@gmail.com",         matchId: "demo-r16-1", home: 2, away: 1 },                    // wrong result
  { email: "carbonfalcon42@gmail.com",       matchId: "demo-r16-1", home: 1, away: 1, penWinner: "away" }, // correct draw + correct pens ✓
  { email: "omagrawal.usa@gmail.com",        matchId: "demo-r16-1", home: 0, away: 1 },                    // wrong result
  { email: "basineni.suchit@gmail.com",      matchId: "demo-r16-1", home: 1, away: 1 },                    // correct draw, no pen pick
  { email: "aarnavbaxi07@gmail.com",         matchId: "demo-r16-1", home: 2, away: 2, penWinner: "away" }, // wrong score, right result, right pens
  { email: "rohit.kottomtharayil@gmail.com", matchId: "demo-r16-1", home: 1, away: 1, penWinner: "away" }, // correct ✓
  { email: "hailstone556@gmail.com",         matchId: "demo-r16-1", home: 1, away: 2 },                    // wrong result

  // --- France 2-1 England ---
  { email: "suyalpranshu@gmail.com",         matchId: "demo-r16-2", home: 2, away: 1 }, // exact ✓
  { email: "ayanp2007@gmail.com",            matchId: "demo-r16-2", home: 1, away: 0 }, // right result, wrong scores
  { email: "johnkenton94@gmail.com",         matchId: "demo-r16-2", home: 3, away: 1 }, // right result, right diff
  { email: "carbonfalcon42@gmail.com",       matchId: "demo-r16-2", home: 1, away: 1, penWinner: "home" }, // draw prediction (wrong)
  { email: "omagrawal.usa@gmail.com",        matchId: "demo-r16-2", home: 2, away: 1 }, // exact ✓
  { email: "basineni.suchit@gmail.com",      matchId: "demo-r16-2", home: 2, away: 0 }, // right result, wrong scores
  { email: "aarnavbaxi07@gmail.com",         matchId: "demo-r16-2", home: 1, away: 2 }, // wrong result
  { email: "rohit.kottomtharayil@gmail.com", matchId: "demo-r16-2", home: 2, away: 1 }, // exact ✓
  // hailstone has no pick for this match

  // --- Spain vs Germany (LIVE — no points yet) ---
  { email: "suyalpranshu@gmail.com",         matchId: "demo-r16-3", home: 2, away: 1 },
  { email: "ayanp2007@gmail.com",            matchId: "demo-r16-3", home: 1, away: 1, penWinner: "home" },
  { email: "johnkenton94@gmail.com",         matchId: "demo-r16-3", home: 1, away: 2 },
  { email: "carbonfalcon42@gmail.com",       matchId: "demo-r16-3", home: 1, away: 1, penWinner: "away" },
  { email: "omagrawal.usa@gmail.com",        matchId: "demo-r16-3", home: 2, away: 0 },
  { email: "basineni.suchit@gmail.com",      matchId: "demo-r16-3", home: 1, away: 1, penWinner: "home" },
  { email: "aarnavbaxi07@gmail.com",         matchId: "demo-r16-3", home: 2, away: 1 },
  { email: "rohit.kottomtharayil@gmail.com", matchId: "demo-r16-3", home: 0, away: 0, penWinner: "away" },
  { email: "hailstone556@gmail.com",         matchId: "demo-r16-3", home: 1, away: 0 },

  // --- USA vs Mexico (SCHEDULED, upcoming — no picks visible yet) ---
  { email: "suyalpranshu@gmail.com",         matchId: "demo-r16-4", home: 2, away: 1 },
  { email: "ayanp2007@gmail.com",            matchId: "demo-r16-4", home: 1, away: 1, penWinner: "away" },
  { email: "johnkenton94@gmail.com",         matchId: "demo-r16-4", home: 1, away: 0 },
  { email: "carbonfalcon42@gmail.com",       matchId: "demo-r16-4", home: 2, away: 2, penWinner: "home" },
  { email: "omagrawal.usa@gmail.com",        matchId: "demo-r16-4", home: 3, away: 1 },
  // basineni, aarnav, rohit, hailstone have no pick

  // --- Portugal vs Morocco (SCHEDULED, upcoming) ---
  { email: "suyalpranshu@gmail.com",         matchId: "demo-r16-5", home: 2, away: 0 },
  { email: "ayanp2007@gmail.com",            matchId: "demo-r16-5", home: 1, away: 1, penWinner: "home" },

  // --- Netherlands vs Japan QF (SCHEDULED, further out) ---
  { email: "suyalpranshu@gmail.com",         matchId: "demo-qf-1", home: 2, away: 1 },
  { email: "ayanp2007@gmail.com",            matchId: "demo-qf-1", home: 1, away: 1, penWinner: "home" },
];

async function main() {
  console.log("🧹  Cleaning up old demo data...");
  const old = await db.match.findMany({
    where: { externalId: { startsWith: "demo-" } },
    select: { id: true },
  });
  if (old.length) {
    await db.prediction.deleteMany({ where: { matchId: { in: old.map((m) => m.id) } } });
    await db.match.deleteMany({ where: { id: { in: old.map((m) => m.id) } } });
    console.log(`   Removed ${old.length} old demo matches.`);
  }

  console.log("🏟️  Creating demo matches...");
  for (const m of DEMO_MATCHES) {
    await db.match.create({ data: m });
    console.log(`   ✓ ${m.homeTeam} vs ${m.awayTeam} [${m.status}]`);
  }

  console.log("🔮  Seeding predictions...");
  const matchRows = await db.match.findMany({
    where: { externalId: { startsWith: "demo-" } },
    select: { id: true, externalId: true },
  });
  const matchById = new Map(matchRows.map((m) => [m.externalId, m.id]));

  const allUsers = await db.user.findMany({ select: { id: true, email: true } });
  const userByEmail = new Map(allUsers.map((u) => [u.email, u.id]));

  let seeded = 0;
  for (const pick of DEMO_PICKS) {
    const matchId = matchById.get(pick.matchId);
    const userId = userByEmail.get(pick.email);
    if (!matchId || !userId) {
      console.warn(`   ⚠ skipping ${pick.email} / ${pick.matchId} — not found`);
      continue;
    }
    await db.prediction.upsert({
      where: { userId_matchId: { userId, matchId } },
      create: {
        userId,
        matchId,
        homeScorePred: pick.home,
        awayScorePred: pick.away,
        penaltyWinnerPred: pick.penWinner ?? null,
      },
      update: {
        homeScorePred: pick.home,
        awayScorePred: pick.away,
        penaltyWinnerPred: pick.penWinner ?? null,
      },
    });
    seeded++;
  }
  console.log(`   ${seeded} predictions seeded.`);
  console.log("\n✅  Done! Open http://localhost:3000/picks to see the UI.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
