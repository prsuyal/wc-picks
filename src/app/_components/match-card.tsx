"use client";

import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { LockIcon, MoonIcon } from "lucide-react";
import type { Match, Prediction } from "../../../generated/prisma";
import { calculatePoints, getMultiplier } from "~/lib/points";
import { getFlag } from "~/lib/team-flags";
import { api } from "~/trpc/react";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";

type MatchWithPrediction = Match & {
  predictions: Prediction[];
};

function formatGroupName(groupName: string) {
  return groupName.replaceAll("_", " ");
}

function isMatchLive(match: Match) {
  return match.kickoffAt <= new Date() && match.status !== "FINISHED";
}

function cleanScoreInput(value: string) {
  return value.replace(/\D/g, "").slice(0, 2);
}

function TeamName({ name }: { name: string }) {
  const flag = getFlag(name);
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      {flag && <span className="shrink-0 text-base leading-none">{flag}</span>}
      <span className="truncate text-sm font-medium">{name}</span>
    </span>
  );
}

function PointsBadge({
  points,
  multiplier,
}: {
  points: number | null;
  multiplier: number;
}) {
  if (points === null)
    return <span className="invisible h-5 w-16 shrink-0" aria-hidden />;

  const label = `${points % 1 === 0 ? points : points.toFixed(1)} pts`;

  if (points === 0)
    return (
      <Badge variant="destructive" className="w-16 justify-center text-xs">
        {label}
      </Badge>
    );
  return (
    <Badge className="w-16 justify-center border-transparent bg-green-100 text-xs text-green-800 hover:bg-green-100">
      {label}
    </Badge>
  );
}

export function MatchCard({ match }: { match: MatchWithPrediction }) {
  const existing = match.predictions[0];
  const [home, setHome] = useState<string>(
    existing?.homeScorePred?.toString() ?? "",
  );
  const [away, setAway] = useState<string>(
    existing?.awayScorePred?.toString() ?? "",
  );
  const submittedScoreKey = useRef<string | null>(null);

  const utils = api.useUtils();
  const upsert = api.prediction.upsert.useMutation({
    onSuccess: async () => {
      await utils.match.getAll.invalidate();
    },
  });

  const isLocked =
    match.status !== "SCHEDULED" || match.kickoffAt <= new Date();
  const isLive = isMatchLive(match);
  const multiplier = getMultiplier(match.round);
  const isLateKickoff = new Date(match.kickoffAt).getHours() < 6;

  const points =
    match.homeScore !== null && match.awayScore !== null
      ? existing
        ? calculatePoints(match, existing)
        : 0
      : null;

  useEffect(() => {
    if (isLocked) return;

    const h = parseInt(home, 10);
    const a = parseInt(away, 10);
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) return;

    const existingHome = existing?.homeScorePred;
    const existingAway = existing?.awayScorePred;
    if (h === existingHome && a === existingAway) return;

    const scoreKey = `${h}-${a}`;
    if (submittedScoreKey.current === scoreKey) return;

    const timeout = setTimeout(() => {
      submittedScoreKey.current = scoreKey;
      upsert.mutate({ matchId: match.id, homeScorePred: h, awayScorePred: a });
    }, 350);

    return () => clearTimeout(timeout);
  }, [
    away,
    existing?.awayScorePred,
    existing?.homeScorePred,
    home,
    isLocked,
    match.id,
    upsert,
  ]);

  return (
    <div className="grid items-center gap-3 rounded-lg border px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto]">
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <TeamName name={match.homeTeam} />
          <span className="text-muted-foreground shrink-0 text-xs">vs</span>
          <TeamName name={match.awayTeam} />
        </div>
        <div className="text-muted-foreground mt-0.5 flex min-w-0 items-center gap-2 text-xs">
          <span className={`tabular-nums${isLateKickoff ? " text-orange-500" : ""}`}>
            {format(new Date(match.kickoffAt), "MMM d, h:mm a")}
          </span>
          {isLateKickoff && <MoonIcon className="size-3 shrink-0 text-orange-500" />}
          {match.groupName ? (
            <>
              <span>·</span>
              <span className="truncate">
                {formatGroupName(match.groupName)}
              </span>
            </>
          ) : null}
          <span>·</span>
          <span className="tabular-nums">{multiplier}×</span>
        </div>
      </div>

      <div className="grid shrink-0 items-center justify-self-end">
        {isLocked ? (
          <div className="grid grid-cols-[4rem_4rem_4rem] items-center gap-2">
            {existing ? (
              <span className="text-muted-foreground text-center text-sm tabular-nums">
                {existing.homeScorePred} – {existing.awayScorePred}
              </span>
            ) : (
              <span className="text-muted-foreground text-center text-xs">
                no pick
              </span>
            )}
            {isLive ? (
              <span className="flex items-center justify-center gap-1.5 text-xs font-semibold tracking-wide text-red-600">
                <span className="size-1.5 animate-pulse rounded-full bg-red-600" />
                LIVE
              </span>
            ) : match.homeScore !== null && match.awayScore !== null ? (
              <span className="text-center text-sm font-semibold tabular-nums">
                {match.homeScore} – {match.awayScore}
              </span>
            ) : (
              <span className="invisible text-center text-sm font-semibold tabular-nums">
                0 – 0
              </span>
            )}
            {isLive ? (
              <span className="text-muted-foreground flex w-16 justify-center">
                <LockIcon className="size-4" aria-label="locked" />
              </span>
            ) : (
              <PointsBadge points={points} multiplier={multiplier} />
            )}
          </div>
        ) : (
          <div className="grid grid-cols-[3rem_0.5rem_3rem] items-center gap-2">
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={home}
              onChange={(e) => setHome(cleanScoreInput(e.target.value))}
              className="h-8 w-12 text-center tabular-nums"
              placeholder="-"
            />
            <span className="text-muted-foreground text-xs">–</span>
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={away}
              onChange={(e) => setAway(cleanScoreInput(e.target.value))}
              className="h-8 w-12 text-center tabular-nums"
              placeholder="-"
            />
          </div>
        )}
      </div>
    </div>
  );
}
