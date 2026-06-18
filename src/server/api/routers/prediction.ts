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

  getForMatch: protectedProcedure
    .input(z.object({ matchId: z.string() }))
    .query(async ({ ctx, input }) => {
      const match = await ctx.db.match.findUnique({ where: { id: input.matchId } });
      if (!match) throw new TRPCError({ code: "NOT_FOUND" });
      if (match.kickoffAt > new Date())
        throw new TRPCError({ code: "FORBIDDEN", message: "Predictions are hidden until kickoff." });

      const predictions = await ctx.db.prediction.findMany({
        where: { matchId: input.matchId },
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { user: { name: "asc" } },
      });

      const mapped = predictions.map((p) => ({
        userId: p.userId,
        userName: p.user.name,
        userImage: p.user.image,
        homeScorePred: p.homeScorePred,
        awayScorePred: p.awayScorePred,
        points: match.status === "FINISHED" ? calculatePoints(match, p) : null,
      }));

      mapped.sort((a, b) => {
        if (a.points !== null && b.points !== null) {
          if (b.points !== a.points) return b.points - a.points;
        } else if (a.points !== null) return -1;
        else if (b.points !== null) return 1;
        return (a.userName ?? "").localeCompare(b.userName ?? "");
      });

      return { match, predictions: mapped };
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
