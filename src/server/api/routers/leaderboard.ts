import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { calculatePoints, computeDailyBonuses, computeDailyBonusesByDay, getMultiplier } from "~/lib/points";
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

    // Collect daily point entries for all users
    const dailyEntries: { userId: string; day: string; pts: number; multiplier: number }[] = [];

    const standingsBase = users.map((user) => {
      let regularPoints = 0;
      let predictionsWithPoints = 0;

      for (const prediction of user.predictions) {
        const pts = calculatePoints(prediction.match, prediction);
        if (pts === null) continue;
        regularPoints += pts;
        predictionsWithPoints++;

        const day = getLeaderboardDay(prediction.match.kickoffAt);
        dailyEntries.push({
          userId: user.id,
          day,
          pts,
          multiplier: getMultiplier(prediction.match.round),
        });
      }

      return { user, regularPoints, predictionsWithPoints };
    });

    const bonusByUser = computeDailyBonuses(dailyEntries);

    const standings = standingsBase.map(({ user, regularPoints, predictionsWithPoints }) => {
      const dailyBonus = bonusByUser.get(user.id) ?? 0;
      const totalPoints = regularPoints + dailyBonus;
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

    return standings.sort(
      (a, b) =>
        b.totalPoints - a.totalPoints ||
        (a.name ?? "").localeCompare(b.name ?? ""),
    );
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
            penaltyWinner: true,
          },
        },
      },
    });

    // Points per user per day
    const pointsByUserDay = new Map<string, Map<string, number>>();
    for (const user of users) {
      pointsByUserDay.set(user.id, new Map());
    }

    const dailyEntries: { userId: string; day: string; pts: number; multiplier: number }[] = [];
    const allDays = new Set<string>();

    for (const pred of predictions) {
      const pts = calculatePoints(pred.match, pred);
      if (pts === null) continue;
      const day = getLeaderboardDay(pred.match.kickoffAt);
      allDays.add(day);
      const userMap = pointsByUserDay.get(pred.userId);
      if (userMap) userMap.set(day, (userMap.get(day) ?? 0) + pts);

      dailyEntries.push({
        userId: pred.userId,
        day,
        pts,
        multiplier: getMultiplier(pred.match.round),
      });
    }

    // Daily top scorer bonuses per user per day
    const bonusByUserDay = computeDailyBonusesByDay(dailyEntries);
    for (const [userId, dayMap] of bonusByUserDay) {
      const userMap = pointsByUserDay.get(userId);
      if (!userMap) continue;
      for (const [day, bonus] of dayMap) {
        allDays.add(day);
        userMap.set(day, (userMap.get(day) ?? 0) + bonus);
      }
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
