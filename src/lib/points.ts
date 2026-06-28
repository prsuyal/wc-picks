import type { Match, Prediction, Round } from "../../generated/prisma";

const MULTIPLIERS = {
  GROUP: 0.5,
  ROUND_OF_32: 1,
  ROUND_OF_16: 2,
  QUARTER_FINAL: 2.5,
  SEMI_FINAL: 3.5,
  THIRD_PLACE: 0.5,
  FINAL: 4,
} as const satisfies Record<Round, number>;

type MatchInput = Pick<Match, "homeScore" | "awayScore" | "round"> & {
  penaltyWinner?: string | null;
};
type PredictionInput = Pick<Prediction, "homeScorePred" | "awayScorePred"> & {
  penaltyWinnerPred?: string | null;
};

export function calculatePoints(
  match: MatchInput,
  prediction: PredictionInput,
): number | null {
  if (match.homeScore === null || match.awayScore === null) return null;

  const actualResult = Math.sign(match.homeScore - match.awayScore);
  const predResult = Math.sign(
    prediction.homeScorePred - prediction.awayScorePred,
  );

  if (actualResult !== predResult) return 0;

  let pts = 1;
  if (prediction.homeScorePred === match.homeScore) pts++;
  if (prediction.awayScorePred === match.awayScore) pts++;

  const actualDiff = Math.abs(match.homeScore - match.awayScore);
  const predDiff = Math.abs(
    prediction.homeScorePred - prediction.awayScorePred,
  );
  if (actualDiff === predDiff) pts++;

  // Bonus point for correct penalty winner (knockout draws only)
  const isKnockout = match.round !== "GROUP";
  if (
    isKnockout &&
    actualResult === 0 &&
    match.penaltyWinner &&
    prediction.penaltyWinnerPred &&
    match.penaltyWinner === prediction.penaltyWinnerPred
  ) {
    pts++;
  }

  return pts * MULTIPLIERS[match.round];
}

export function getMultiplier(round: Round): number {
  return MULTIPLIERS[round];
}

export const ROUND_LABELS: Record<Round, string> = {
  GROUP: "Group Stage",
  ROUND_OF_32: "Round of 32",
  ROUND_OF_16: "Round of 16",
  QUARTER_FINAL: "Quarterfinals",
  SEMI_FINAL: "Semifinals",
  THIRD_PLACE: "3rd Place",
  FINAL: "Final",
};

export const ROUND_ORDER: Round[] = [
  "GROUP",
  "ROUND_OF_32",
  "ROUND_OF_16",
  "QUARTER_FINAL",
  "SEMI_FINAL",
  "THIRD_PLACE",
  "FINAL",
];

type DailyPointsEntry = {
  userId: string;
  day: string;
  pts: number;
  multiplier: number;
};

/** Compute per-day daily-top-scorer bonus points for each user. */
export function computeDailyBonuses(entries: DailyPointsEntry[]): Map<string, number> {
  // Group by day
  const byDay = new Map<string, { maxPts: number; maxMultiplier: number; userPts: Map<string, number> }>();

  for (const { userId, day, pts, multiplier } of entries) {
    let slot = byDay.get(day);
    if (!slot) {
      slot = { maxPts: 0, maxMultiplier: 0, userPts: new Map() };
      byDay.set(day, slot);
    }
    slot.userPts.set(userId, (slot.userPts.get(userId) ?? 0) + pts);
    if (multiplier > slot.maxMultiplier) slot.maxMultiplier = multiplier;
  }

  // Recompute maxPts after aggregating per user
  for (const slot of byDay.values()) {
    for (const pts of slot.userPts.values()) {
      if (pts > slot.maxPts) slot.maxPts = pts;
    }
  }

  const bonusByUser = new Map<string, number>();

  for (const { maxPts, maxMultiplier, userPts } of byDay.values()) {
    if (maxPts <= 0) continue;
    for (const [userId, pts] of userPts) {
      if (pts === maxPts) {
        bonusByUser.set(userId, (bonusByUser.get(userId) ?? 0) + maxMultiplier);
      }
    }
  }

  return bonusByUser;
}

/** Same as computeDailyBonuses but returns a per-(userId, day) map for the progress chart. */
export function computeDailyBonusesByDay(
  entries: DailyPointsEntry[],
): Map<string, Map<string, number>> {
  const byDay = new Map<string, { maxPts: number; maxMultiplier: number; userPts: Map<string, number> }>();

  for (const { userId, day, pts, multiplier } of entries) {
    let slot = byDay.get(day);
    if (!slot) {
      slot = { maxPts: 0, maxMultiplier: 0, userPts: new Map() };
      byDay.set(day, slot);
    }
    slot.userPts.set(userId, (slot.userPts.get(userId) ?? 0) + pts);
    if (multiplier > slot.maxMultiplier) slot.maxMultiplier = multiplier;
  }

  for (const slot of byDay.values()) {
    for (const pts of slot.userPts.values()) {
      if (pts > slot.maxPts) slot.maxPts = pts;
    }
  }

  // bonusByUserDay[userId][day] = bonus pts earned that day
  const result = new Map<string, Map<string, number>>();

  for (const [day, { maxPts, maxMultiplier, userPts }] of byDay) {
    if (maxPts <= 0) continue;
    for (const [userId, pts] of userPts) {
      if (pts === maxPts) {
        let userMap = result.get(userId);
        if (!userMap) {
          userMap = new Map();
          result.set(userId, userMap);
        }
        userMap.set(day, (userMap.get(day) ?? 0) + maxMultiplier);
      }
    }
  }

  return result;
}
