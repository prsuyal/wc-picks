/**
 * Pre-creates placeholder User rows for all players.
 * When they sign in with Google, NextAuth links their account automatically.
 * Run: pnpm seed:users
 */
import { PrismaClient } from "../generated/prisma";

const db = new PrismaClient();

const PLAYERS = [
  { email: "johnkenton94@gmail.com", name: "Abhinav Kartik" },
  { email: "aarnavbaxi07@gmail.com", name: "Aarnav Baxi" },
  { email: "ayanp2007@gmail.com", name: "Ayan Patel" },
  { email: "carbonfalcon42@gmail.com", name: "Indus Boddu" },
  { email: "hailstone556@gmail.com", name: "Minghan Li" },
  { email: "omagrawal.usa@gmail.com", name: "Om Agrawal" },
  { email: "rohit.kottomtharayil@gmail.com", name: "Rohit Kottomtharayil" },
  { email: "basineni.suchit@gmail.com", name: "Suchit Basineni" },
];

async function main() {
  for (const player of PLAYERS) {
    const result = await db.user.upsert({
      where: { email: player.email },
      update: { name: player.name },
      create: { email: player.email, name: player.name },
    });
    const created = result.name === player.name ? "✓" : "↺";
    console.log(`${created}  ${player.name} (${player.email})`);
  }
  console.log(`\nDone — ${PLAYERS.length} players ready.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
