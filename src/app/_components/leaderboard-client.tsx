"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from "lucide-react";
import { format } from "date-fns";
import { api } from "~/trpc/react";
import {
  getLeaderboardDayNumber,
  getLeaderboardDaysThrough,
} from "~/lib/leaderboard-days";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { ProgressChart } from "./progress-chart";

function formatPts(pts: number): string {
  return pts % 1 === 0 ? pts.toString() : pts.toFixed(1);
}

export function LeaderboardClient({ userId }: { userId: string }) {
  const { data: standings = [] } = api.leaderboard.getStandings.useQuery(
    undefined,
    { refetchInterval: 60_000 },
  );
  const { data: progress } = api.leaderboard.getDailyProgress.useQuery(
    undefined,
    { refetchInterval: 60_000 },
  );
  const { data: bonusWinners = {} } = api.leaderboard.getDailyBonusWinners.useQuery();

  const [dayIndex, setDayIndex] = useState<number | null>(null);

  // Full day range from tournament start to today
  const allDays = useMemo(() => {
    return getLeaderboardDaysThrough();
  }, []);

  // Expand progress series to cover all days, carrying forward last known total
  const fullSeries = useMemo(() => {
    if (!progress) return null;
    return progress.series.map((s) => {
      const dayMap = new Map(s.data.map((d) => [d.day, d.points]));
      let last = 0;
      const data = allDays.map((day) => {
        if (dayMap.has(day)) last = dayMap.get(day)!;
        return { day, points: last };
      });
      return { ...s, data };
    });
  }, [progress, allDays]);

  const selectedIndex = dayIndex ?? allDays.length - 1;
  const selectedDay = allDays[selectedIndex];

  // Build a lookup of id → { image } from standings
  const infoById = useMemo(() => {
    const map = new Map<
      string,
      { image: string | null; email: string | null }
    >();
    for (const s of standings)
      map.set(s.id, { image: s.image, email: s.email });
    return map;
  }, [standings]);

  // Derive per-day standings from full series
  const dayStandings = useMemo(() => {
    if (!fullSeries) return null;
    return fullSeries
      .map((s) => ({
        id: s.id,
        name: s.name,
        image: infoById.get(s.id)?.image ?? null,
        pts: s.data[selectedIndex]?.points ?? 0,
      }))
      .sort((a, b) => b.pts - a.pts);
  }, [fullSeries, selectedIndex, infoById]);

  const rows =
    dayStandings ??
    standings.map((s) => ({
      id: s.id,
      name: s.name,
      image: s.image,
      pts: s.totalPoints,
    }));

  const canGoPrev = selectedIndex > 0;
  const canGoNext = selectedIndex < allDays.length - 1;

  return (
    <>
      {/* Day navigator */}
      {allDays.length > 0 && selectedDay && (
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => setDayIndex(selectedIndex - 1)}
            disabled={!canGoPrev}
            className="text-muted-foreground hover:text-foreground p-1 transition-opacity disabled:opacity-20"
            aria-label="Previous day"
          >
            <ChevronLeftIcon className="size-5" />
          </button>
          <span className="text-sm font-medium tabular-nums">
            day {getLeaderboardDayNumber(selectedDay)}{" "}
            <span className="text-muted-foreground font-normal">
              · {format(new Date(selectedDay + "T12:00:00"), "MMM d")}
            </span>
          </span>
          <button
            onClick={() => setDayIndex(canGoNext ? selectedIndex + 1 : null)}
            disabled={!canGoNext}
            className="text-muted-foreground hover:text-foreground p-1 transition-opacity disabled:opacity-20"
            aria-label="Next day"
          >
            <ChevronRightIcon className="size-5" />
          </button>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">#</TableHead>
            <TableHead>player</TableHead>
            <TableHead className="w-16 text-center">pts</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((player, i) => {
            const initials = player.name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);
            const isMe = player.id === userId;
            const isDailyTopScorer = selectedDay
              ? bonusWinners[selectedDay]?.userIds.includes(player.id)
              : false;

            return (
              <TableRow
                key={player.id}
                className={isMe ? "bg-muted/50" : undefined}
              >
                <TableCell className="text-muted-foreground text-sm">
                  {i + 1}
                </TableCell>
                <TableCell>
                  <Link
                    href={isMe ? "/picks" : `/player/${player.id}`}
                    className="flex items-center gap-2 transition-opacity hover:opacity-70"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={player.image ?? undefined}
                        alt={player.name ?? ""}
                      />
                      <AvatarFallback className="text-[10px]">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="flex items-center gap-1 text-sm">
                      {player.name}
                      {isMe && (
                        <span className="text-muted-foreground ml-0.5 text-xs">
                          (you)
                        </span>
                      )}
                      {isDailyTopScorer && (
                        <StarIcon className="size-3 fill-amber-400 text-amber-400" />
                      )}
                    </span>
                  </Link>
                </TableCell>
                <TableCell className="text-center font-semibold tabular-nums">
                  {formatPts(player.pts)}
                </TableCell>
              </TableRow>
            );
          })}
          {rows.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={3}
                className="text-muted-foreground py-8 text-center text-sm"
              >
                No picks yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {fullSeries && (
        <div className="mt-12">
          <h2 className="text-muted-foreground mb-4 text-sm font-medium tracking-widest uppercase">
            points over time
          </h2>
          <ProgressChart days={allDays} series={fullSeries} />
        </div>
      )}
    </>
  );
}
