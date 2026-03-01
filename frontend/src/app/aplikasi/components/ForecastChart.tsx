"use client";

import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { ForecastPoint, HistoricalPoint } from "@/lib/api";

interface ChartPoint {
  date: string;
  label: string;
  historical?: number | null;
  forecast?: number | null;
  ci?: [number, number] | null;
}

interface ForecastChartProps {
  historical: HistoricalPoint[];
  forecast: ForecastPoint[];
  accentColor?: string;
  unit?: string;
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
}

export default function ForecastChart({
  historical,
  forecast,
  accentColor = "#6366f1",
  unit = "",
}: ForecastChartProps) {
  const histPoints: ChartPoint[] = historical.map((p) => ({
    date: p.date,
    label: formatDateLabel(p.date),
    historical: p.value,
    forecast: null,
    ci: null,
  }));

  const lastHist = historical[historical.length - 1];
  const fcPoints: ChartPoint[] = forecast.map((p, i) => ({
    date: p.date,
    label: formatDateLabel(p.date),
    historical: i === 0 && lastHist ? lastHist.value : null,
    forecast: p.value,
    ci:
      p.lower_ci !== null && p.upper_ci !== null
        ? [p.lower_ci, p.upper_ci]
        : null,
  }));

  const data: ChartPoint[] = [...histPoints, ...fcPoints];

  const splitDate = lastHist?.date;

  const tickFormatter = (v: number) => {
    if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(1)}k`;
    return String(Number(v.toFixed(1)));
  };

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart
        data={data}
        margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
      >
        <defs>
          <linearGradient id={`ci-${accentColor}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={accentColor} stopOpacity={0.15} />
            <stop offset="95%" stopColor={accentColor} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={tickFormatter}
          width={52}
          label={
            unit
              ? {
                  value: unit,
                  angle: -90,
                  position: "insideLeft",
                  offset: 12,
                  style: { fontSize: 10, fill: "#94a3b8" },
                }
              : undefined
          }
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            color: "#1e293b",
          }}
          labelStyle={{ color: "#1e293b", fontWeight: 600, marginBottom: 4 }}
          itemStyle={{ color: "#334155" }}
          formatter={(value: number, name: string) => {
            const label =
              name === "historical"
                ? "Historis"
                : name === "forecast"
                  ? "Forecast"
                  : name;
            return [`${Number(value).toFixed(2)}${unit ? ` ${unit}` : ""}`, label];
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          formatter={(value) =>
            value === "historical"
              ? "Historis"
              : value === "forecast"
                ? "Forecast"
                : value
          }
        />
        {splitDate && (
          <ReferenceLine
            x={formatDateLabel(splitDate)}
            stroke="#94a3b8"
            strokeDasharray="4 4"
            label={{
              value: "Mulai Forecast",
              position: "insideTopLeft",
              fontSize: 10,
              fill: "#94a3b8",
            }}
          />
        )}
        <Area
          type="monotone"
          dataKey="ci"
          fill={`url(#ci-${accentColor})`}
          stroke="none"
          legendType="none"
          tooltipType="none"
          isAnimationActive={false}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="historical"
          stroke="#64748b"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "#64748b" }}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="forecast"
          stroke={accentColor}
          strokeWidth={2.5}
          strokeDasharray="6 3"
          dot={false}
          activeDot={{ r: 4, fill: accentColor }}
          connectNulls
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
