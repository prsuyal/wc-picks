"use client";

import { format } from "date-fns";
import { api } from "~/trpc/react";
import type { Match, Prediction } from "../../../generated/prisma";
import { getMultiplier } from "~/lib/points";
import { getFlag } from "~/lib/team-flags";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "~/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";

type MatchWithPrediction = Match & { predictions: Prediction[] };

function PointsBadge({ points }: { points: number | null }) {
  if (points === null) return <span className="w-14" />;
  const label = `${points % 1 === 0 ? points : points.toFixed(1)} pts`;
  if (points === 0)
    return (
      <Badge variant="destructive" className="w-14 justify-center text-xs">
        {label}
      </Badge>
    );
  return (
    <Badge className="w-14 justify-center border-transparent bg-green-100 text-xs text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200">
      {label}
    </Badge>
  );
}

export function MatchPredictionsSheet({
  match,
  open,
  onOpenChange,
  currentUserId,
}: {
  match: MatchWithPrediction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId: string;
}) {
  const { data, isLoading } = api.prediction.getForMatch.useQuery(
    { matchId: match.id },
    { enabled: open },
  );

  const multiplier = getMultiplier(match.round);
  const homeFlag = getFlag(match.homeTeam);
  const awayFlag = getFlag(match.awayTeam);
  const isFinished = match.status === "FINISHED";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="!w-full sm:!max-w-md">
        <SheetHeader>
          <SheetTitle>
            {homeFlag} {match.homeTeam} vs {match.awayTeam} {awayFlag}
          </SheetTitle>
          <SheetDescription asChild>
            <div className="flex items-center gap-2 text-xs">
              <span>{format(new Date(match.kickoffAt), "MMM d, h:mm a")}</span>
              <span>·</span>
              <span>{multiplier}×</span>
              {isFinished && (
                <>
                  <span>·</span>
                  <span className="font-semibold text-foreground tabular-nums">
                    {match.homeScore}
                    <span className="mx-1 text-base leading-none font-normal">
                      {match.penaltyWinner ? (match.penaltyWinner === "home" ? homeFlag : awayFlag) : "–"}
                    </span>
                    {match.awayScore}
                  </span>
                </>
              )}
            </div>
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-5 w-14" />
                </div>
              ))}
            </div>
          ) : data?.predictions.length === 0 ? (
            <p className="text-muted-foreground pt-8 text-center text-sm">
              No predictions for this match.
            </p>
          ) : (
            <div className="divide-y">
              {data?.predictions.map((p) => {
                const initials = p.userName
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);
                const isYou = p.userId === currentUserId;
                return (
                  <div key={p.userId} className="flex items-center gap-3 py-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={p.userImage ?? undefined} alt={p.userName ?? ""} />
                      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                    </Avatar>
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {p.userName ?? "unknown"}
                      {isYou && (
                        <span className="text-muted-foreground ml-1.5 text-xs">(you)</span>
                      )}
                    </span>
                    <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                      {p.homeScorePred}
                      <span className="mx-1 text-base leading-none">
                        {p.penaltyWinnerPred ? (p.penaltyWinnerPred === "home" ? homeFlag : awayFlag) : "–"}
                      </span>
                      {p.awayScorePred}
                    </span>
                    <PointsBadge points={p.points} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
