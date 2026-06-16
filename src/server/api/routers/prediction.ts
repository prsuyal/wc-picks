import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { calculatePoints } from "~/lib/points";

export const predictionRouter = createTRPCRouter({
  upsert: protectedProcedure
    .input(
      z.object({
        matchId: z.string(),
        homeScorePred: z.number().int().min(0),
        awayScorePred: z.number().int().min(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const match = await ctx.db.match.findUnique({
        where: { id: input.matchId },
      });

      if (!match) throw new TRPCError({ code: "NOT_FOUND" });

      if (match.kickoffAt <= new Date() || match.status !== "SCHEDULED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Predictions are locked once a match has kicked off.",
        });
      }

      return ctx.db.prediction.upsert({
        where: {
          userId_matchId: {
            userId: ctx.session.user.id,
            matchId: input.matchId,
          },
        },
        create: {
          userId: ctx.session.user.id,
          matchId: input.matchId,
          homeScorePred: input.homeScorePred,
          awayScorePred: input.awayScorePred,
        },
        update: {
          homeScorePred: input.homeScorePred,
          awayScorePred: input.awayScorePred,
        },
      });
    }),

  getMyPredictions: protectedProcedure.query(async ({ ctx }) => {
    const predictions = await ctx.db.prediction.findMany({
      where: { userId: ctx.session.user.id },
      include: { match: true },
      orderBy: { match: { kickoffAt: "asc" } },
    });

    return predictions.map((p) => ({
      ...p,
      points: calculatePoints(p.match, p),
    }));
  }),
});
