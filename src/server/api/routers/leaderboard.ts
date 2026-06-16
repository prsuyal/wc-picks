import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { calculatePoints } from "~/lib/points";
import { getLeaderboardDay } from "~/lib/leaderboard-days";

export const leaderboardRouter = createTRPCRouter({
  getStandings: protectedProcedure.query(async ({ ctx }) => {
    const users = await ctx.db.user.findMany({
      include: {
        predictions: {
          include: { match: true },
        },
      },
    });

    const standings = users.map((user) => {
      let totalPoints = 0;
      let predictionsWithPoints = 0;

      for (const prediction of user.predictions) {
        const pts = calculatePoints(prediction.match, prediction);
        if (pts !== null) {
          totalPoints += pts;
          predictionsWithPoints++;
        }
      }

      return {
        id: user.id,
        name: user.name,
        image: user.image,
        email: user.email,
        totalPoints,
        predictionsCount: predictionsWithPoints,
        pointsPerGame:
          predictionsWithPoints > 0
            ? totalPoints / predictionsWithPoints
            : null,
      };
    });

    return standings.sort((a, b) => b.totalPoints - a.totalPoints);
  }),

  getDailyProgress: protectedProcedure.query(async ({ ctx }) => {
    const users = await ctx.db.user.findMany({
      select: { id: true, name: true },
    });

    const predictions = await ctx.db.prediction.findMany({
      where: { match: { status: "FINISHED" } },
      include: {
        match: {
          select: {
            kickoffAt: true,
            homeScore: true,
            awayScore: true,
            round: true,
          },
        },
      },
    });

    // Points per user per day
    const pointsByUserDay = new Map<string, Map<string, number>>();
    for (const user of users) {
      pointsByUserDay.set(user.id, new Map());
    }

    const allDays = new Set<string>();
    for (const pred of predictions) {
      const pts = calculatePoints(pred.match, pred);
      if (pts === null) continue;
      const day = getLeaderboardDay(pred.match.kickoffAt);
      allDays.add(day);
      const userMap = pointsByUserDay.get(pred.userId);
      if (userMap) userMap.set(day, (userMap.get(day) ?? 0) + pts);
    }

    const sortedDays = [...allDays].sort();

    // Build cumulative series per user
    const series = users.map((user) => {
      const userMap = pointsByUserDay.get(user.id) ?? new Map<string, number>();
      let cumulative = 0;
      const data = sortedDays.map((day) => {
        cumulative += userMap.get(day) ?? 0;
        return { day, points: Math.round(cumulative * 10) / 10 };
      });
      return { id: user.id, name: user.name ?? user.id, data };
    });

    return { days: sortedDays, series };
  }),
});
