"use client";

import { useMemo } from "react";
import { format, isToday, isYesterday } from "date-fns";
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
  const [y, m, d] = dateStr.split("-").map(Number);
  // Construct at local noon to avoid DST/midnight boundary issues
  const date = new Date(y!, m! - 1, d!, 12, 0, 0);
  if (isToday(date)) return "today";
  if (isYesterday(date)) return "yesterday";
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
    (m) => m.homeScore !== null && m.awayScore !== null,
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
}: {
  dateStr: string;
  matches: MatchWithPrediction[];
}) {
  const pts = computePts(matches);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
          {dateLabel(dateStr)}
        </h2>
        {pts !== null && (
          <span className="text-muted-foreground text-xs tabular-nums">
            {formatPts(pts)} pts
          </span>
        )}
      </div>
      <div className="space-y-2">
        {matches.map((m) => (
          <MatchCard key={m.id} match={m} />
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

export function PicksClient() {
  const { data: matches = [], isLoading } = api.match.getAll.useQuery(
    undefined,
    { refetchInterval: 60_000 },
  );

  const today = localDateStr(new Date());

  const { yourPicksGroups, upcomingGroups, totalPts } = useMemo(() => {
    const past = matches.filter(
      (m) => localDateStr(new Date(m.kickoffAt)) <= today,
    );
    const upcoming = matches.filter(
      (m) => localDateStr(new Date(m.kickoffAt)) > today,
    );

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
              <DateSection key={dateStr} dateStr={dateStr} matches={ms} />
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
            <DateSection key={dateStr} dateStr={dateStr} matches={ms} />
          ))
        )}
      </TabsContent>
    </Tabs>
  );
}
