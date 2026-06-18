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

      const isFinished = match.status === "FINISHED";

      const [predictions, allPredictions] = await Promise.all([
        ctx.db.prediction.findMany({
          where: { matchId: input.matchId },
          include: { user: { select: { id: true, name: true, image: true } } },
          orderBy: { user: { name: "asc" } },
        }),
        isFinished
          ? Promise.resolve(null)
          : ctx.db.prediction.findMany({
              where: { match: { status: "FINISHED" } },
              include: { match: true },
            }),
      ]);

      // Total leaderboard points per user (for sorting live/unfinished matches)
      const totalPointsByUser = new Map<string, number>();
      if (allPredictions) {
        for (const p of allPredictions) {
          const pts = calculatePoints(p.match, p) ?? 0;
          totalPointsByUser.set(p.userId, (totalPointsByUser.get(p.userId) ?? 0) + pts);
        }
      }

      const mapped = predictions.map((p) => ({
        userId: p.userId,
        userName: p.user.name,
        userImage: p.user.image,
        homeScorePred: p.homeScorePred,
        awayScorePred: p.awayScorePred,
        points: isFinished ? calculatePoints(match, p) : null,
        leaderboardPoints: totalPointsByUser.get(p.userId) ?? 0,
      }));

      if (isFinished) {
        mapped.sort((a, b) => {
          if (a.points !== null && b.points !== null && b.points !== a.points)
            return b.points - a.points;
          return (a.userName ?? "").localeCompare(b.userName ?? "");
        });
      } else {
        mapped.sort(
          (a, b) =>
            b.leaderboardPoints - a.leaderboardPoints ||
            (a.userName ?? "").localeCompare(b.userName ?? ""),
        );
      }

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
