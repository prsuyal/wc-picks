"use client";

import { useMemo } from "react";
import { format, isToday, isTomorrow, isYesterday } from "date-fns";
import { StarIcon } from "lucide-react";
import { api } from "~/trpc/react";
import { calculatePoints } from "~/lib/points";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Skeleton } from "~/components/ui/skeleton";
import { MatchCard } from "./match-card";
import type { Match, Prediction } from "../../../generated/prisma";

type MatchWithPrediction = Match & { predictions: Prediction[] };

function localDateStr(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function dateLabel(dateStr: string): string {
  // T12:00:00 forces local time parse (date-only strings parse as UTC)
  const date = new Date(dateStr + "T12:00:00");
  if (isToday(date)) return "today";
  if (isYesterday(date)) return "yesterday";
  if (isTomorrow(date)) return "tomorrow";
  return format(date, "EEEE, MMMM d").toLowerCase();
}

function groupByDate(
  matches: MatchWithPrediction[],
): { dateStr: string; matches: MatchWithPrediction[] }[] {
  const map: Record<string, MatchWithPrediction[]> = {};
  for (const m of matches) {
    const key = localDateStr(new Date(m.kickoffAt));
    map[key] = [...(map[key] ?? []), m];
  }
  return Object.entries(map).map(([dateStr, ms]) => ({ dateStr, matches: ms }));
}

function formatPts(pts: number): string {
  return pts % 1 === 0 ? pts.toString() : pts.toFixed(1);
}

function computePts(matches: MatchWithPrediction[]): number | null {
  const finished = matches.filter(
    (m) => m.status === "FINISHED" && m.homeScore !== null && m.awayScore !== null,
  );
  if (finished.length === 0) return null;
  return finished.reduce((sum, m) => {
    const pred = m.predictions[0];
    const pts = pred ? calculatePoints(m, pred) : 0;
    return sum + (pts ?? 0);
  }, 0);
}

function DateSection({
  dateStr,
  matches,
  currentUserId,
  isTopScorer,
}: {
  dateStr: string;
  matches: MatchWithPrediction[];
  currentUserId: string;
  isTopScorer?: boolean;
}) {
  const pts = computePts(matches);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
          {dateLabel(dateStr)}
        </h2>
        {pts !== null && (
          <span className="text-muted-foreground flex items-center gap-1 text-xs tabular-nums">
            {isTopScorer && <StarIcon className="size-3 fill-amber-400 text-amber-400" />}
            {formatPts(pts)} pts
          </span>
        )}
      </div>
      <div className="space-y-2">
        {matches.map((m) => (
          <MatchCard key={m.id} match={m} currentUserId={currentUserId} />
        ))}
      </div>
    </div>
  );
}

function MatchSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-lg border px-4 py-3">
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-8 w-28" />
    </div>
  );
}

export function PicksClient({ currentUserId }: { currentUserId: string }) {
  const { data: matches = [], isLoading } = api.match.getAll.useQuery(
    undefined,
    { refetchInterval: 60_000 },
  );
  const { data: bonusWinners = {} } = api.leaderboard.getDailyBonusWinners.useQuery();

  const today = localDateStr(new Date());

  const { yourPicksGroups, upcomingGroups, totalPts } = useMemo(() => {
    const now = new Date();
    const tomorrowDate = new Date(now);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowStr = localDateStr(tomorrowDate);

    const isMidnightGame = (m: MatchWithPrediction) =>
      new Date(m.kickoffAt).getHours() < 6;

    // "your picks" = today or earlier OR tomorrow's sub-6am games (late-night picks)
    const past = matches.filter((m) => {
      const dateStr = localDateStr(new Date(m.kickoffAt));
      return (
        dateStr <= today ||
        (dateStr === tomorrowStr && isMidnightGame(m))
      );
    });
    const upcoming = matches.filter((m) => {
      const dateStr = localDateStr(new Date(m.kickoffAt));
      return (
        dateStr > today &&
        !(dateStr === tomorrowStr && isMidnightGame(m))
      );
    });

    const pastGroups = groupByDate(past).sort((a, b) =>
      b.dateStr.localeCompare(a.dateStr),
    );
    const upcomingGroups = groupByDate(upcoming).sort((a, b) =>
      a.dateStr.localeCompare(b.dateStr),
    );

    const totalPts = computePts(matches);

    return { yourPicksGroups: pastGroups, upcomingGroups, totalPts };
  }, [matches, today]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <MatchSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <Tabs defaultValue="picks">
      <TabsList className="mb-6 gap-2 bg-transparent p-0">
        <TabsTrigger
          value="picks"
          className="data-[state=active]:bg-foreground data-[state=active]:text-background text-sm"
        >
          your picks
        </TabsTrigger>
        <TabsTrigger
          value="upcoming"
          className="data-[state=active]:bg-foreground data-[state=active]:text-background text-sm"
        >
          upcoming
        </TabsTrigger>
      </TabsList>

      <TabsContent value="picks" className="space-y-8">
        {yourPicksGroups.length === 0 ? (
          <p className="text-muted-foreground py-12 text-center text-sm">
            No matches yet — check back once the tournament starts.
          </p>
        ) : (
          <>
            {totalPts !== null && (
              <p className="text-muted-foreground -mt-2 mb-2 text-sm">
                <span className="text-foreground text-lg font-semibold tabular-nums">
                  {formatPts(totalPts)}
                </span>{" "}
                pts total
              </p>
            )}
            {yourPicksGroups.map(({ dateStr, matches: ms }) => (
              <DateSection
                key={dateStr}
                dateStr={dateStr}
                matches={ms}
                currentUserId={currentUserId}
                isTopScorer={bonusWinners[dateStr]?.includes(currentUserId)}
              />
            ))}
          </>
        )}
      </TabsContent>

      <TabsContent value="upcoming" className="space-y-8">
        {upcomingGroups.length === 0 ? (
          <p className="text-muted-foreground py-12 text-center text-sm">
            No upcoming matches available yet.
          </p>
        ) : (
          upcomingGroups.map(({ dateStr, matches: ms }) => (
            <DateSection key={dateStr} dateStr={dateStr} matches={ms} currentUserId={currentUserId} />
          ))
        )}
      </TabsContent>
    </Tabs>
  );
}
