import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { syncIfStale } from "~/lib/sync-matches";

export const matchRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    // Keep live/recent matches fresh before returning the list.
    await syncIfStale().catch(() => { /* sync failure is non-fatal — return stale data */ });

    return ctx.db.match.findMany({
      orderBy: { kickoffAt: "asc" },
      include: {
        predictions: {
          where: { userId: ctx.session.user.id },
          take: 1,
        },
      },
    });
  }),
});
