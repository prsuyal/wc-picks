import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { PicksClient } from "../_components/picks-client";

export default async function PicksPage() {
  const session = await auth();
  if (!session?.user) redirect("/");

  void api.match.getAll.prefetch();

  return (
    <HydrateClient>
      <main className="mx-auto max-w-4xl px-4 py-8">
        <PicksClient currentUserId={session.user.id} />
      </main>
    </HydrateClient>
  );
}
