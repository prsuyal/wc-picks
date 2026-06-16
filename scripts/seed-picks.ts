/**
 * Seeds match predictions for all players.
 * Run all:        pnpm seed:picks
 * Run one player: pnpm seed:picks <email>
 */
import { PrismaClient } from "../generated/prisma";

const db = new PrismaClient();

type PickEntry = { home: string; away: string; homeScore: number; awayScore: number };

const PICKS_BY_EMAIL: Record<string, PickEntry[]> = {
  "suyalpranshu@gmail.com": [
    { home: "Mexico", away: "South Africa", homeScore: 2, awayScore: 1 },
    { home: "South Korea", away: "Czechia", homeScore: 1, awayScore: 1 },
    { home: "Bosnia", away: "Canada", homeScore: 1, awayScore: 0 },
    { home: "United States", away: "Paraguay", homeScore: 2, awayScore: 1 },
    { home: "Switzerland", away: "Qatar", homeScore: 2, awayScore: 0 },
    { home: "Brazil", away: "Morocco", homeScore: 3, awayScore: 1 },
    { home: "Scotland", away: "Haiti", homeScore: 2, awayScore: 1 },
    { home: "Turkey", away: "Australia", homeScore: 2, awayScore: 0 },
    { home: "Germany", away: "Curacao", homeScore: 3, awayScore: 0 },
    { home: "Japan", away: "Netherlands", homeScore: 2, awayScore: 1 },
    { home: "Ecuador", away: "Ivory Coast", homeScore: 1, awayScore: 1 },
    { home: "Sweden", away: "Tunisia", homeScore: 2, awayScore: 1 },
    { home: "Spain", away: "Cape Verde", homeScore: 3, awayScore: 1 },
    { home: "Egypt", away: "Belgium", homeScore: 2, awayScore: 1 },
    { home: "Saudi Arabia", away: "Uruguay", homeScore: 0, awayScore: 2 },
    { home: "Iran", away: "New Zealand", homeScore: 2, awayScore: 1 },
  ],

  "ayanp2007@gmail.com": [
    { home: "Mexico", away: "South Africa", homeScore: 2, awayScore: 0 },
    { home: "South Korea", away: "Czechia", homeScore: 1, awayScore: 0 },
    { home: "Canada", away: "Bosnia", homeScore: 1, awayScore: 0 },
    { home: "United States", away: "Paraguay", homeScore: 2, awayScore: 1 },
    { home: "Switzerland", away: "Qatar", homeScore: 2, awayScore: 0 },
    { home: "Brazil", away: "Morocco", homeScore: 3, awayScore: 1 },
    { home: "Scotland", away: "Haiti", homeScore: 2, awayScore: 1 },
    { home: "Turkey", away: "Australia", homeScore: 1, awayScore: 1 },
    { home: "Germany", away: "Curacao", homeScore: 2, awayScore: 0 },
    { home: "Japan", away: "Netherlands", homeScore: 2, awayScore: 1 },
    { home: "Ecuador", away: "Ivory Coast", homeScore: 1, awayScore: 0 },
    { home: "Sweden", away: "Tunisia", homeScore: 1, awayScore: 1 },
    { home: "Spain", away: "Cape Verde", homeScore: 3, awayScore: 0 },
    { home: "Belgium", away: "Egypt", homeScore: 2, awayScore: 1 },
    { home: "Uruguay", away: "Saudi Arabia", homeScore: 3, awayScore: 0 },
    { home: "Iran", away: "New Zealand", homeScore: 1, awayScore: 1 },
  ],

  "johnkenton94@gmail.com": [
    { home: "Mexico", away: "South Africa", homeScore: 2, awayScore: 2 },
    { home: "South Korea", away: "Czechia", homeScore: 2, awayScore: 0 },
    { home: "Bosnia", away: "Canada", homeScore: 1, awayScore: 1 },
    { home: "United States", away: "Paraguay", homeScore: 3, awayScore: 2 },
    { home: "Switzerland", away: "Qatar", homeScore: 3, awayScore: 0 },
    { home: "Brazil", away: "Morocco", homeScore: 2, awayScore: 1 },
    { home: "Scotland", away: "Haiti", homeScore: 3, awayScore: 1 },
    { home: "Turkey", away: "Australia", homeScore: 1, awayScore: 0 },
    { home: "Germany", away: "Curacao", homeScore: 4, awayScore: 1 },
    { home: "Netherlands", away: "Japan", homeScore: 1, awayScore: 1 },
    { home: "Ecuador", away: "Ivory Coast", homeScore: 1, awayScore: 1 },
    { home: "Sweden", away: "Tunisia", homeScore: 3, awayScore: 1 },
    { home: "Spain", away: "Cape Verde", homeScore: 3, awayScore: 0 },
    { home: "Belgium", away: "Egypt", homeScore: 3, awayScore: 1 },
    { home: "Uruguay", away: "Saudi Arabia", homeScore: 1, awayScore: 1 },
    { home: "Iran", away: "New Zealand", homeScore: 1, awayScore: 0 },
  ],

  "carbonfalcon42@gmail.com": [
    { home: "Mexico", away: "South Africa", homeScore: 1, awayScore: 1 },
    { home: "South Korea", away: "Czechia", homeScore: 3, awayScore: 1 },
    { home: "Canada", away: "Bosnia", homeScore: 1, awayScore: 1 },
    { home: "United States", away: "Paraguay", homeScore: 1, awayScore: 0 },
    { home: "Switzerland", away: "Qatar", homeScore: 3, awayScore: 0 },
    { home: "Morocco", away: "Brazil", homeScore: 1, awayScore: 1 },
    { home: "Scotland", away: "Haiti", homeScore: 2, awayScore: 1 },
    { home: "Turkey", away: "Australia", homeScore: 2, awayScore: 0 },
    { home: "Germany", away: "Curacao", homeScore: 4, awayScore: 0 },
    { home: "Netherlands", away: "Japan", homeScore: 2, awayScore: 1 },
    { home: "Ivory Coast", away: "Ecuador", homeScore: 1, awayScore: 1 },
    { home: "Sweden", away: "Tunisia", homeScore: 3, awayScore: 1 },
    { home: "Spain", away: "Cape Verde", homeScore: 4, awayScore: 0 },
    { home: "Belgium", away: "Egypt", homeScore: 3, awayScore: 1 },
    { home: "Uruguay", away: "Saudi Arabia", homeScore: 2, awayScore: 0 },
    { home: "Iran", away: "New Zealand", homeScore: 2, awayScore: 0 },
  ],

  "omagrawal.usa@gmail.com": [
    { home: "Mexico", away: "South Africa", homeScore: 2, awayScore: 0 },
    { home: "South Korea", away: "Czechia", homeScore: 2, awayScore: 1 },
    { home: "Canada", away: "Bosnia", homeScore: 1, awayScore: 1 },
    { home: "United States", away: "Paraguay", homeScore: 2, awayScore: 1 },
    { home: "Switzerland", away: "Qatar", homeScore: 3, awayScore: 0 },
    { home: "Brazil", away: "Morocco", homeScore: 2, awayScore: 1 },
    { home: "Scotland", away: "Haiti", homeScore: 2, awayScore: 1 },
    { home: "Turkey", away: "Australia", homeScore: 2, awayScore: 1 },
    { home: "Germany", away: "Curacao", homeScore: 3, awayScore: 0 },
    { home: "Japan", away: "Netherlands", homeScore: 2, awayScore: 1 },
    { home: "Ecuador", away: "Ivory Coast", homeScore: 1, awayScore: 0 },
    { home: "Sweden", away: "Tunisia", homeScore: 1, awayScore: 0 },
    { home: "Spain", away: "Cape Verde", homeScore: 3, awayScore: 1 },
    { home: "Belgium", away: "Egypt", homeScore: 2, awayScore: 1 },
    { home: "Uruguay", away: "Saudi Arabia", homeScore: 2, awayScore: 1 },
    { home: "Iran", away: "New Zealand", homeScore: 1, awayScore: 0 },
  ],

  "basineni.suchit@gmail.com": [
    { home: "Mexico", away: "South Africa", homeScore: 2, awayScore: 0 },
    { home: "South Korea", away: "Czechia", homeScore: 1, awayScore: 1 },
    { home: "Canada", away: "Bosnia", homeScore: 1, awayScore: 1 },
    { home: "United States", away: "Paraguay", homeScore: 1, awayScore: 0 },
    { home: "Switzerland", away: "Qatar", homeScore: 3, awayScore: 0 },
    { home: "Brazil", away: "Morocco", homeScore: 3, awayScore: 1 },
    { home: "Scotland", away: "Haiti", homeScore: 2, awayScore: 1 },
    { home: "Turkey", away: "Australia", homeScore: 2, awayScore: 1 },
    { home: "Germany", away: "Curacao", homeScore: 3, awayScore: 0 },
    { home: "Japan", away: "Netherlands", homeScore: 2, awayScore: 1 },
    { home: "Ecuador", away: "Ivory Coast", homeScore: 1, awayScore: 1 },
    // Sweden vs Tunisia: no pick — skipped
    { home: "Spain", away: "Cape Verde", homeScore: 4, awayScore: 0 },
    { home: "Belgium", away: "Egypt", homeScore: 3, awayScore: 1 },
    { home: "Uruguay", away: "Saudi Arabia", homeScore: 1, awayScore: 0 },
    { home: "Iran", away: "New Zealand", homeScore: 0, awayScore: 0 },
  ],

  "aarnavbaxi07@gmail.com": [
    { home: "Mexico", away: "South Africa", homeScore: 3, awayScore: 1 },
    { home: "South Korea", away: "Czechia", homeScore: 1, awayScore: 0 },
    { home: "Canada", away: "Bosnia", homeScore: 1, awayScore: 0 },
    { home: "United States", away: "Paraguay", homeScore: 2, awayScore: 1 },
    { home: "Switzerland", away: "Qatar", homeScore: 3, awayScore: 0 },
    { home: "Brazil", away: "Morocco", homeScore: 2, awayScore: 1 },
    { home: "Scotland", away: "Haiti", homeScore: 1, awayScore: 0 },
    { home: "Turkey", away: "Australia", homeScore: 2, awayScore: 0 },
    { home: "Germany", away: "Curacao", homeScore: 3, awayScore: 0 },
    { home: "Netherlands", away: "Japan", homeScore: 1, awayScore: 0 },
    { home: "Ecuador", away: "Ivory Coast", homeScore: 1, awayScore: 1 },
    { home: "Sweden", away: "Tunisia", homeScore: 2, awayScore: 1 },
    { home: "Spain", away: "Cape Verde", homeScore: 3, awayScore: 0 },
    { home: "Belgium", away: "Egypt", homeScore: 2, awayScore: 1 },
    { home: "Uruguay", away: "Saudi Arabia", homeScore: 1, awayScore: 0 },
    { home: "Iran", away: "New Zealand", homeScore: 2, awayScore: 0 },
  ],

  "rohit.kottomtharayil@gmail.com": [
    { home: "Mexico", away: "South Africa", homeScore: 2, awayScore: 0 },
    { home: "South Korea", away: "Czechia", homeScore: 1, awayScore: 1 },
    { home: "Canada", away: "Bosnia", homeScore: 2, awayScore: 1 },
    // USA vs Paraguay: no pick — skipped
    { home: "Switzerland", away: "Qatar", homeScore: 2, awayScore: 1 },
    { home: "Brazil", away: "Morocco", homeScore: 3, awayScore: 1 },
    { home: "Scotland", away: "Haiti", homeScore: 2, awayScore: 0 },
    { home: "Turkey", away: "Australia", homeScore: 2, awayScore: 1 },
    { home: "Germany", away: "Curacao", homeScore: 3, awayScore: 1 },
    { home: "Netherlands", away: "Japan", homeScore: 2, awayScore: 2 },
    { home: "Ecuador", away: "Ivory Coast", homeScore: 2, awayScore: 0 },
    { home: "Sweden", away: "Tunisia", homeScore: 1, awayScore: 1 },
    { home: "Spain", away: "Cape Verde", homeScore: 4, awayScore: 1 },
    { home: "Belgium", away: "Egypt", homeScore: 3, awayScore: 1 },
    { home: "Uruguay", away: "Saudi Arabia", homeScore: 1, awayScore: 0 },
    { home: "Iran", away: "New Zealand", homeScore: 1, awayScore: 0 },
  ],

  "hailstone556@gmail.com": [
    { home: "Mexico", away: "South Africa", homeScore: 3, awayScore: 1 },
    { home: "South Korea", away: "Czechia", homeScore: 2, awayScore: 1 },
    { home: "Canada", away: "Bosnia", homeScore: 1, awayScore: 0 },
    { home: "United States", away: "Paraguay", homeScore: 1, awayScore: 0 },
    { home: "Switzerland", away: "Qatar", homeScore: 3, awayScore: 0 },
    { home: "Brazil", away: "Morocco", homeScore: 2, awayScore: 0 },
    { home: "Scotland", away: "Haiti", homeScore: 2, awayScore: 1 },
    { home: "Turkey", away: "Australia", homeScore: 2, awayScore: 1 },
    { home: "Germany", away: "Curacao", homeScore: 2, awayScore: 0 },
    { home: "Japan", away: "Netherlands", homeScore: 1, awayScore: 0 },
    { home: "Ivory Coast", away: "Ecuador", homeScore: 1, awayScore: 1 },
    { home: "Sweden", away: "Tunisia", homeScore: 1, awayScore: 1 },
    { home: "Spain", away: "Cape Verde", homeScore: 3, awayScore: 1 },
    { home: "Belgium", away: "Egypt", homeScore: 2, awayScore: 1 },
    { home: "Uruguay", away: "Saudi Arabia", homeScore: 1, awayScore: 0 },
    { home: "Iran", away: "New Zealand", homeScore: 1, awayScore: 0 },
  ],
};

// Normalize: lowercase + strip diacritics
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "")
    .replace(/[^a-z0-9 ]/g, "");
}

function teamMatch(dbName: string, searchName: string): boolean {
  const d = normalize(dbName);
  const search = normalize(searchName);
  return d.includes(search) || search.includes(d);
}

async function seedPicksForEmail(email: string) {
  const picks = PICKS_BY_EMAIL[email];
  if (!picks) {
    console.error(`No picks data found for ${email}`);
    return;
  }

  const user = await db.user.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  const allMatches = await db.match.findMany({ where: { round: "GROUP" } });
  if (allMatches.length === 0) {
    console.error("No matches in DB. Run the app first to trigger a sync.");
    process.exit(1);
  }

  let seeded = 0;

  for (const pick of picks) {
    const match = allMatches.find(
      (m) =>
        (teamMatch(m.homeTeam, pick.home) && teamMatch(m.awayTeam, pick.away)) ||
        (teamMatch(m.homeTeam, pick.away) && teamMatch(m.awayTeam, pick.home)),
    );

    if (!match) {
      console.warn(`  ⚠  No match: ${pick.home} vs ${pick.away}`);
      continue;
    }

    const isSwapped =
      teamMatch(match.homeTeam, pick.away) && teamMatch(match.awayTeam, pick.home);
    const homeScorePred = isSwapped ? pick.awayScore : pick.homeScore;
    const awayScorePred = isSwapped ? pick.homeScore : pick.awayScore;

    await db.prediction.upsert({
      where: { userId_matchId: { userId: user.id, matchId: match.id } },
      create: { userId: user.id, matchId: match.id, homeScorePred, awayScorePred },
      update: { homeScorePred, awayScorePred },
    });

    seeded++;
  }

  console.log(`  ${seeded}/${picks.length} picks`);
}

async function main() {
  const emailArg = process.argv[2];

  const targets = emailArg
    ? [emailArg]
    : Object.keys(PICKS_BY_EMAIL);

  for (const email of targets) {
    process.stdout.write(`${email} ... `);
    await seedPicksForEmail(email);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
