import { matchRouter } from "~/server/api/routers/match";
import { predictionRouter } from "~/server/api/routers/prediction";
import { leaderboardRouter } from "~/server/api/routers/leaderboard";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

export const appRouter = createTRPCRouter({
  match: matchRouter,
  prediction: predictionRouter,
  leaderboard: leaderboardRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
