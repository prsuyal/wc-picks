import { z } from "zod";
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

  getForUser: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [matches, player] = await Promise.all([
        ctx.db.match.findMany({
          orderBy: { kickoffAt: "asc" },
          include: {
            predictions: {
              where: { userId: input.userId },
              take: 1,
            },
          },
        }),
        ctx.db.user.findUnique({
          where: { id: input.userId },
          select: { name: true, image: true },
        }),
      ]);
      return { matches, player };
    }),
});
