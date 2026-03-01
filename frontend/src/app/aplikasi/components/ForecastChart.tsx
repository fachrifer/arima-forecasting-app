"use client";

import { useEffect, useState } from "react";
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

function useIsDark() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const check = () => setDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

export default function ForecastChart({
  historical,
  forecast,
  accentColor = "#6366f1",
  unit = "",
}: ForecastChartProps) {
  const isDark = useIsDark();

  const colors = {
    grid: isDark ? "#2a2f45" : "#f1f5f9",
    tick: isDark ? "#64748b" : "#94a3b8",
    historical: isDark ? "#94a3b8" : "#64748b",
    refLine: isDark ? "#64748b" : "#94a3b8",
    tooltipBg: isDark ? "#1a1d2e" : "#ffffff",
    tooltipBorder: isDark ? "#2a2f45" : "#e2e8f0",
    tooltipText: isDark ? "#e2e8f0" : "#1e293b",
    tooltipItem: isDark ? "#cbd5e1" : "#334155",
  };

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
            <stop offset="5%" stopColor={accentColor} stopOpacity={isDark ? 0.2 : 0.15} />
            <stop offset="95%" stopColor={accentColor} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: colors.tick }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: colors.tick }}
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
                  style: { fontSize: 10, fill: colors.tick },
                }
              : undefined
          }
        />
        <Tooltip
          contentStyle={{
            backgroundColor: colors.tooltipBg,
            border: `1px solid ${colors.tooltipBorder}`,
            borderRadius: "8px",
            boxShadow: isDark ? "0 4px 12px rgba(0,0,0,0.4)" : "0 4px 12px rgba(0,0,0,0.1)",
            color: colors.tooltipText,
          }}
          labelStyle={{ color: colors.tooltipText, fontWeight: 600, marginBottom: 4 }}
          itemStyle={{ color: colors.tooltipItem }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any, name: any) => {
            const label =
              name === "historical"
                ? "Historis"
                : name === "forecast"
                  ? "Forecast"
                  : String(name ?? "");
            const formatted =
              value !== null && value !== undefined
                ? `${Number(value).toFixed(2)}${unit ? ` ${unit}` : ""}`
                : "-";
            return [formatted, label];
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
            stroke={colors.refLine}
            strokeDasharray="4 4"
            label={{
              value: "Mulai Forecast",
              position: "insideTopLeft",
              fontSize: 10,
              fill: colors.refLine,
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
          stroke={colors.historical}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: colors.historical }}
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
