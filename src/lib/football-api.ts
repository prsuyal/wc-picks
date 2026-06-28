import "server-only";
import type { MatchStatus, Round } from "../../generated/prisma";
import { env } from "~/env";

const BASE_URL = "https://api.football-data.org/v4";

interface ApiScore {
  home: number | null;
  away: number | null;
}

interface ApiMatch {
  id: number;
  utcDate: string;
  status: string;
  stage: string;
  group: string | null;
  homeTeam: { name: string };
  awayTeam: { name: string };
  score: {
    fullTime: ApiScore;
    regularTime?: ApiScore;
    extraTime?: ApiScore;
    penalties?: ApiScore;
  };
}

interface ApiResponse {
  matches: ApiMatch[];
}

function mapStageToRound(stage: string): Round | null {
  const map: Record<string, Round> = {
    GROUP_STAGE: "GROUP",
    ROUND_OF_32: "ROUND_OF_32",
    LAST_32: "ROUND_OF_32",
    ROUND_OF_16: "ROUND_OF_16",
    LAST_16: "ROUND_OF_16",
    QUARTER_FINALS: "QUARTER_FINAL",
    SEMI_FINALS: "SEMI_FINAL",
    THIRD_PLACE: "THIRD_PLACE",
    PLAY_OFF_FOR_THIRD_PLACE: "THIRD_PLACE",
    FINAL: "FINAL",
  };
  return map[stage] ?? null;
}

function mapStatus(status: string): MatchStatus {
  if (status === "FINISHED" || status === "AWARDED") return "FINISHED";
  if (
    status === "IN_PLAY" ||
    status === "PAUSED" ||
    status === "HALFTIME" ||
    status === "EXTRA_TIME" ||
    status === "PENALTY_SHOOTOUT"
  )
    return "LIVE";
  return "SCHEDULED";
}

function resolveScore(match: ApiMatch): {
  home: number | null;
  away: number | null;
  penaltyWinner: string | null;
} {
  const ft = match.score.fullTime;
  if (ft.home === null || ft.away === null) {
    return { home: null, away: null, penaltyWinner: null };
  }

  // For knockout matches, add ET goals to get the after-ET score
  const et = match.score.extraTime;
  const home = ft.home + (et?.home ?? 0);
  const away = ft.away + (et?.away ?? 0);

  // Penalty winner: whoever scored more in the shootout
  const pens = match.score.penalties;
  let penaltyWinner: string | null = null;
  if (pens && pens.home !== null && pens.away !== null) {
    penaltyWinner = pens.home > pens.away ? "home" : "away";
  }

  return { home, away, penaltyWinner };
}

export async function fetchAllMatches() {
  const res = await fetch(`${BASE_URL}/competitions/WC/matches`, {
    headers: { "X-Auth-Token": env.FOOTBALL_DATA_API_KEY },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`football-data.org API error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as ApiResponse;

  return data.matches.flatMap((match) => {
    const round = mapStageToRound(match.stage);
    if (!round) return [];

    // Skip matches where teams haven't been determined yet (knockout bracket TBD)
    if (!match.homeTeam.name || !match.awayTeam.name) return [];

    const score = resolveScore(match);

    return [
      {
        externalId: String(match.id),
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        kickoffAt: new Date(match.utcDate),
        round,
        groupName: match.group ?? null,
        homeScore: score.home,
        awayScore: score.away,
        penaltyWinner: score.penaltyWinner,
        status: mapStatus(match.status),
      },
    ];
  });
}
