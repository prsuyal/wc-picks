const DAY_MS = 1000 * 60 * 60 * 24;

export const LEADERBOARD_TIME_ZONE = "America/New_York";
export const TOURNAMENT_START_DAY = "2026-06-11";

const leaderboardDayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: LEADERBOARD_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function formatUtcDay(date: Date): string {
  const year = date.getUTCFullYear().toString().padStart(4, "0");
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const day = date.getUTCDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dayTimestamp(day: string): number {
  return Date.parse(`${day}T00:00:00.000Z`);
}

function getPart(parts: Intl.DateTimeFormatPart[], type: string): string {
  const value = parts.find((part) => part.type === type)?.value;
  if (!value) throw new Error(`Missing ${type} in leaderboard date`);
  return value;
}

export function getLeaderboardDay(date: Date): string {
  const parts = leaderboardDayFormatter.formatToParts(date);
  const year = getPart(parts, "year");
  const month = getPart(parts, "month");
  const day = getPart(parts, "day");
  return `${year}-${month}-${day}`;
}

export function addLeaderboardDays(day: string, days: number): string {
  return formatUtcDay(new Date(dayTimestamp(day) + days * DAY_MS));
}

export function getLeaderboardDayNumber(day: string): number {
  return (
    Math.round(
      (dayTimestamp(day) - dayTimestamp(TOURNAMENT_START_DAY)) / DAY_MS,
    ) + 1
  );
}

export function getLeaderboardDaysThrough(
  throughDay = getLeaderboardDay(new Date()),
): string[] {
  if (throughDay < TOURNAMENT_START_DAY) return [];

  const days: string[] = [];
  for (
    let day = TOURNAMENT_START_DAY;
    day <= throughDay;
    day = addLeaderboardDays(day, 1)
  ) {
    days.push(day);
  }
  return days;
}
