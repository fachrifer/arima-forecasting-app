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
  ci_low?: number | null;
  ci_high?: number | null;
  isSplitPoint?: boolean;
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

function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label, unit, isDark }: any) {
  if (!active || !payload?.length) return null;

  const historical = payload.find((p: { dataKey: string }) => p.dataKey === "historical");
  const forecast = payload.find((p: { dataKey: string }) => p.dataKey === "forecast");
  const ci_low = payload.find((p: { dataKey: string }) => p.dataKey === "ci_low");
  const ci_high = payload.find((p: { dataKey: string }) => p.dataKey === "ci_high");
  const isSplit = payload[0]?.payload?.isSplitPoint;

  const bg = isDark ? "#1a1d2e" : "#ffffff";
  const border = isDark ? "#2a2f45" : "#e2e8f0";
  const textPrimary = isDark ? "#e2e8f0" : "#1e293b";
  const textSub = isDark ? "#64748b" : "#94a3b8";

  return (
    <div
      style={{
        backgroundColor: bg,
        border: `1px solid ${border}`,
        borderRadius: 10,
        boxShadow: isDark ? "0 8px 24px rgba(0,0,0,0.5)" : "0 8px 24px rgba(0,0,0,0.12)",
        padding: "10px 14px",
        minWidth: 170,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <p style={{ color: textPrimary, fontWeight: 700, fontSize: 12, margin: 0 }}>{label}</p>
        {isSplit && (
          <span style={{ fontSize: 9, fontWeight: 600, color: "#6366f1", background: isDark ? "#1e2040" : "#eef2ff", borderRadius: 4, padding: "1px 5px" }}>
            Awal Forecast
          </span>
        )}
      </div>
      {historical?.value !== null && historical?.value !== undefined && (
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 4 }}>
          <span style={{ color: textSub, fontSize: 11 }}>Historis</span>
          <span style={{ color: textPrimary, fontWeight: 600, fontSize: 11, fontFamily: "monospace" }}>
            {Number(historical.value).toFixed(2)} {unit}
          </span>
        </div>
      )}
      {forecast?.value !== null && forecast?.value !== undefined && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 4 }}>
            <span style={{ color: textSub, fontSize: 11 }}>Forecast</span>
            <span style={{ color: forecast.color ?? textPrimary, fontWeight: 700, fontSize: 11, fontFamily: "monospace" }}>
              {Number(forecast.value).toFixed(2)} {unit}
            </span>
          </div>
          {ci_low?.value !== null && ci_high?.value !== null && ci_low?.value !== undefined && ci_high?.value !== undefined && (
            <div
              style={{
                marginTop: 6,
                paddingTop: 6,
                borderTop: `1px solid ${border}`,
                display: "flex",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <span style={{ color: textSub, fontSize: 10 }}>CI 95%</span>
              <span style={{ color: textSub, fontSize: 10, fontFamily: "monospace" }}>
                {Number(ci_low.value).toFixed(1)} – {Number(ci_high.value).toFixed(1)}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ForecastChart({
  historical,
  forecast,
  accentColor = "#6366f1",
  unit = "",
}: ForecastChartProps) {
  const isDark = useIsDark();

  const colors = {
    grid: isDark ? "#1e2235" : "#f1f5f9",
    tick: isDark ? "#475569" : "#94a3b8",
    historical: isDark ? "#94a3b8" : "#64748b",
    refLine: isDark ? "#3f4a6a" : "#cbd5e1",
    refText: isDark ? "#64748b" : "#94a3b8",
  };

  /* Build unified data array — for CI we use separate low/high keys
     so Recharts can render two separate Area fills */
  const histPoints: ChartPoint[] = historical.map((p) => ({
    date: p.date,
    label: formatDateLabel(p.date),
    historical: p.value,
    forecast: null,
    ci_low: null,
    ci_high: null,
  }));

  const lastHist = historical[historical.length - 1];

  const fcPoints: ChartPoint[] = forecast.map((p, i) => ({
    date: p.date,
    label: formatDateLabel(p.date),
    historical: i === 0 && lastHist ? lastHist.value : null,
    forecast: p.value,
    ci_low: p.lower_ci ?? null,
    ci_high: p.upper_ci ?? null,
    isSplitPoint: i === 0,
  }));

  const data: ChartPoint[] = [...histPoints, ...fcPoints];
  const splitDate = lastHist?.date;
  const splitLabel = splitDate ? formatDateLabel(splitDate) : undefined;

  const tickFormatter = (v: number) => {
    if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(1)}k`;
    return String(Number(v.toFixed(1)));
  };

  /* Show only a reasonable number of x-axis ticks */
  const totalPoints = data.length;
  const xInterval = totalPoints > 48 ? 11 : totalPoints > 24 ? 5 : totalPoints > 12 ? 2 : 0;

  /* Unique gradient id per accent so multiple charts don't clash */
  const gradId = `ci-fill-${accentColor.replace("#", "")}`;
  const histGradId = `hist-fill-${accentColor.replace("#", "")}`;

  return (
    <ResponsiveContainer width="100%" height={340}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
        <defs>
          {/* CI band gradient */}
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accentColor} stopOpacity={isDark ? 0.25 : 0.2} />
            <stop offset="100%" stopColor={accentColor} stopOpacity={0.01} />
          </linearGradient>
          {/* Subtle historical area fill */}
          <linearGradient id={histGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.historical} stopOpacity={isDark ? 0.12 : 0.08} />
            <stop offset="100%" stopColor={colors.historical} stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          stroke={colors.grid}
          vertical={false}
        />

        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: colors.tick }}
          tickLine={false}
          axisLine={false}
          interval={xInterval}
        />

        <YAxis
          tick={{ fontSize: 10, fill: colors.tick }}
          tickLine={false}
          axisLine={false}
          tickFormatter={tickFormatter}
          width={52}
          label={
            unit
              ? { value: unit, angle: -90, position: "insideLeft", offset: 14, style: { fontSize: 10, fill: colors.tick } }
              : undefined
          }
        />

        <Tooltip
          content={<CustomTooltip unit={unit} isDark={isDark} />}
          cursor={{ stroke: accentColor, strokeWidth: 1, strokeDasharray: "4 3", opacity: 0.5 }}
        />

        <Legend
          wrapperStyle={{ fontSize: 11, paddingTop: 8, color: colors.tick }}
          formatter={(value) =>
            value === "historical" ? "Historis"
            : value === "forecast" ? "Forecast"
            : value === "ci_low" ? "CI Bawah"
            : value === "ci_high" ? "CI Atas"
            : value
          }
          iconType="line"
        />

        {/* Forecast start reference line */}
        {splitLabel && (
          <ReferenceLine
            x={splitLabel}
            stroke={colors.refLine}
            strokeWidth={1.5}
            strokeDasharray="5 4"
            label={{
              value: "Forecast ▶",
              position: "insideTopRight",
              fontSize: 9,
              fill: colors.refText,
              fontWeight: 600,
            }}
          />
        )}

        {/* CI upper boundary — invisible line but needed for area */}
        <Area
          type="monotone"
          dataKey="ci_high"
          fill={`url(#${gradId})`}
          stroke={accentColor}
          strokeWidth={0.5}
          strokeOpacity={0.3}
          strokeDasharray="3 3"
          legendType="none"
          tooltipType="none"
          connectNulls
          isAnimationActive={false}
          dot={false}
          activeDot={false}
        />

        {/* CI lower boundary */}
        <Area
          type="monotone"
          dataKey="ci_low"
          fill="transparent"
          stroke={accentColor}
          strokeWidth={0.5}
          strokeOpacity={0.3}
          strokeDasharray="3 3"
          legendType="none"
          tooltipType="none"
          connectNulls
          isAnimationActive={false}
          dot={false}
          activeDot={false}
        />

        {/* Historical subtle area fill */}
        <Area
          type="monotone"
          dataKey="historical"
          fill={`url(#${histGradId})`}
          stroke="none"
          legendType="none"
          tooltipType="none"
          connectNulls
          isAnimationActive={false}
          dot={false}
          activeDot={false}
        />

        {/* Historical line */}
        <Line
          type="monotone"
          dataKey="historical"
          stroke={colors.historical}
          strokeWidth={1.75}
          dot={false}
          activeDot={{ r: 5, fill: colors.historical, stroke: isDark ? "#1a1d2e" : "#fff", strokeWidth: 2 }}
          connectNulls
          animationDuration={600}
        />

        {/* Forecast line */}
        <Line
          type="monotone"
          dataKey="forecast"
          stroke={accentColor}
          strokeWidth={2.5}
          strokeDasharray="7 3"
          dot={false}
          activeDot={{ r: 5, fill: accentColor, stroke: isDark ? "#1a1d2e" : "#fff", strokeWidth: 2 }}
          connectNulls
          animationDuration={800}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
