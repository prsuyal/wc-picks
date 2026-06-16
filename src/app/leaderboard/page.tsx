import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { LeaderboardClient } from "../_components/leaderboard-client";

export default async function LeaderboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/");

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-xl font-semibold">leaderboard</h1>
      <LeaderboardClient userId={session.user.id} />
    </main>
  );
}
