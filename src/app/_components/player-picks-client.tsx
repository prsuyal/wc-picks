"use client";

import { useState, useMemo } from "react";
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
  currentUserId,
  dailyBonus,
}: {
  dateStr: string;
  matches: MatchWithPrediction[];
  currentUserId: string;
  dailyBonus?: number;
}) {
  const pts = computePts(matches);
  const total = pts !== null ? pts + (dailyBonus ?? 0) : null;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
          {dateLabel(dateStr)}
        </h2>
        {total !== null && (
          <span className="text-muted-foreground flex items-center gap-1 text-xs tabular-nums">
            {dailyBonus != null && <StarIcon className="size-3 fill-amber-400 text-amber-400" />}
            {formatPts(total)} pts
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

export function PlayerPicksClient({ userId, currentUserId }: { userId: string; currentUserId: string }) {
  const { data, isLoading } = api.match.getForUser.useQuery(
    { userId },
    { refetchInterval: 60_000 },
  );
  const { data: bonusWinners = {} } = api.leaderboard.getDailyBonusWinners.useQuery();

  const [wiggling, setWiggling] = useState(false);
  const [tab, setTab] = useState("picks");

  const groups = useMemo(() => {
    if (!data) return [];
    const now = new Date();
    // Only show matches that have already kicked off
    const locked = data.matches.filter((m) => new Date(m.kickoffAt) <= now);
    return groupByDate(locked).sort((a, b) => b.dateStr.localeCompare(a.dateStr));
  }, [data]);

  const totalPts = useMemo(() => {
    const base = computePts(groups.flatMap((g) => g.matches));
    const totalBonus = Object.entries(bonusWinners).reduce((sum, [, { userIds, bonus }]) =>
      userIds.includes(userId) ? sum + bonus : sum, 0);
    return base !== null ? base + totalBonus : null;
  }, [groups, bonusWinners, userId]);

  function handleUpcomingClick() {
    setTab("upcoming");
    setWiggling(true);
    setTimeout(() => setWiggling(false), 600);
  }

  const playerName = data?.player?.name ?? "player";
  const firstName = playerName.split(" ")[0] ?? playerName;

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
    <>
      <h1 className="mb-6 text-xl font-semibold">{firstName.toLowerCase()}&apos;s picks</h1>
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList className="mb-6 gap-2 bg-transparent p-0">
        <TabsTrigger
          value="picks"
          className="data-[state=active]:bg-foreground data-[state=active]:text-background text-sm"
        >
          their picks
        </TabsTrigger>
        <TabsTrigger
          value="upcoming"
          onClick={handleUpcomingClick}
          className="data-[state=active]:bg-foreground data-[state=active]:text-background text-sm"
          style={wiggling ? { animation: "wiggle 0.6s ease-in-out" } : undefined}
        >
          upcoming
        </TabsTrigger>
      </TabsList>

      <TabsContent value="picks" className="space-y-8">
        {groups.length === 0 ? (
          <p className="text-muted-foreground py-12 text-center text-sm">
            No picks yet.
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
            {groups.map(({ dateStr, matches }) => {
              const winner = bonusWinners[dateStr];
              const dailyBonus = winner?.userIds.includes(userId) ? winner.bonus : undefined;
              return (
                <DateSection
                  key={dateStr}
                  dateStr={dateStr}
                  matches={matches}
                  currentUserId={currentUserId}
                  dailyBonus={dailyBonus}
                />
              );
            })}
          </>
        )}
      </TabsContent>

      <TabsContent value="upcoming">
        <p className="text-muted-foreground py-12 text-center text-sm">
          no peeking! 🙈
        </p>
      </TabsContent>
    </Tabs>
    </>
  );
}
