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

export function calculatePoints(
  match: Pick<Match, "homeScore" | "awayScore" | "round">,
  prediction: Pick<Prediction, "homeScorePred" | "awayScorePred">,
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
