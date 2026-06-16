"use client";

import { api } from "~/trpc/react";
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

export function LeaderboardClient({ userId }: { userId: string }) {
  const { data: standings = [] } = api.leaderboard.getStandings.useQuery(
    undefined,
    { refetchInterval: 60_000 },
  );
  const { data: progress } = api.leaderboard.getDailyProgress.useQuery(
    undefined,
    { refetchInterval: 60_000 },
  );

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">#</TableHead>
            <TableHead>player</TableHead>
            <TableHead className="w-16 text-left">pts</TableHead>
            <TableHead className="w-16 text-left">picks</TableHead>
            <TableHead className="w-20 text-left">per pick</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {standings.map((player, i) => {
            const initials = player.name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);
            const isMe = player.id === userId;

            return (
              <TableRow
                key={player.id}
                className={isMe ? "bg-muted/50" : undefined}
              >
                <TableCell className="text-sm text-muted-foreground">
                  {i + 1}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={player.image ?? undefined}
                        alt={player.name ?? ""}
                      />
                      <AvatarFallback className="text-[10px]">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">
                      {player.name}
                      {isMe && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          (you)
                        </span>
                      )}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-left font-semibold tabular-nums">
                  {player.totalPoints % 1 === 0
                    ? player.totalPoints
                    : player.totalPoints.toFixed(1)}
                </TableCell>
                <TableCell className="text-left tabular-nums text-muted-foreground">
                  {player.predictionsCount}
                </TableCell>
                <TableCell className="text-left tabular-nums text-muted-foreground">
                  {player.pointsPerGame !== null
                    ? player.pointsPerGame.toFixed(2)
                    : "—"}
                </TableCell>
              </TableRow>
            );
          })}
          {standings.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="py-8 text-center text-sm text-muted-foreground"
              >
                No picks yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {progress && (
        <div className="mt-12">
          <h2 className="text-muted-foreground mb-4 text-sm font-medium tracking-widest uppercase">
            points over time
          </h2>
          <ProgressChart days={progress.days} series={progress.series} />
        </div>
      )}
    </>
  );
}
