"use client";

import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { ChartContainer, type ChartConfig } from "~/components/ui/chart";

const COLORS = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#84cc16",
];

type Series = { id: string; name: string; data: { day: string; points: number }[] };

type Props = {
  days: string[];
  series: Series[];
};

// Find col count that distributes n items into equal rows
function legendCols(n: number): number {
  for (const c of [3, 4, 5, 2, 6]) {
    if (n % c === 0) return c;
  }
  return 4;
}

export function ProgressChart({ days, series }: Props) {
  if (days.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">
        No finished matches yet.
      </p>
    );
  }

  const chartConfig = Object.fromEntries(
    series.map((s, i) => [
      s.id,
      { label: s.name.split(" ")[0], color: COLORS[i % COLORS.length] },
    ]),
  ) satisfies ChartConfig;

  const rows = days.map((day) => {
    const row: Record<string, string | number> = {
      day: format(new Date(day + "T12:00:00"), "MMM d"),
    };
    for (const s of series) {
      const point = s.data.find((d) => d.day === day);
      row[s.id] = point?.points ?? 0;
    }
    return row;
  });

  const cols = legendCols(series.length);

  return (
    <div className="space-y-4">
      <ChartContainer
        config={chartConfig}
        className="h-[280px] w-full"
        initialDimension={{ width: 600, height: 280 }}
      >
        <LineChart data={rows} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="day" hide />
          <YAxis
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          {series.map((s) => (
            <Line
              key={s.id}
              type="monotone"
              dataKey={s.id}
              stroke={`var(--color-${s.id})`}
              strokeWidth={2}
              dot={false}
              activeDot={false}
            />
          ))}
        </LineChart>
      </ChartContainer>

      <div
        className="mx-auto grid w-fit gap-x-6 gap-y-2"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {series.map((s, i) => (
          <div key={s.id} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: COLORS[i % COLORS.length] }}
            />
            <span className="text-muted-foreground text-xs">
              {s.name.split(" ")[0]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
