import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { PlayerPicksClient } from "~/app/_components/player-picks-client";

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/");

  const { userId } = await params;

  // Redirect to own picks page
  if (userId === session.user.id) redirect("/picks");

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <PlayerPicksClient userId={userId} currentUserId={session.user.id} />
    </main>
  );
}
