"use client";

import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import {
  Upload,
  Cpu,
  HardDrive,
  MemoryStick,
  Loader2,
  AlertCircle,
  Download,
  Activity,
  BarChart3,
  FlaskConical,
  FileText,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  Zap,
} from "lucide-react";
import { postForecastMulti, type ForecastResponse, type MetricResult } from "@/lib/api";
import ForecastChart from "./components/ForecastChart";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PDF = any;

async function exportToPDF(metric: string, unit: string, data: ForecastResponse, chartEl?: HTMLElement | null) {
  const mod = await import("jspdf");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const JsPDF: new (opts: object) => PDF = (mod as any).jsPDF ?? mod.default;

  const pdf: PDF = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW: number = pdf.internal.pageSize.getWidth();
  const pageH: number = pdf.internal.pageSize.getHeight();
  const ml = 14;
  const mr = pageW - ml;
  let y = 16;

  const dateStr = new Date().toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });

  pdf.setFontSize(16);
  pdf.setTextColor(30, 41, 59);
  pdf.setFont("helvetica", "bold");
  pdf.text(`Laporan Forecast — ${metric} (${unit})`, ml, y);
  y += 7;
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(100, 116, 139);
  pdf.text(`Tanggal cetak: ${dateStr}`, ml, y);
  y += 10;

  if (chartEl) {
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(chartEl, { backgroundColor: "#ffffff", scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const imgW = mr - ml;
      const imgH = (canvas.height / canvas.width) * imgW;

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(30, 41, 59);
      pdf.text(`Grafik Forecast — ${metric}`, ml, y);
      y += 5;

      if (y + imgH > pageH - 16) { pdf.addPage(); y = 16; }
      pdf.addImage(imgData, "PNG", ml, y, imgW, imgH);
      y += imgH + 8;
    } catch { /* silently skip */ }
  }

  const diag = data.diagnostics;
  const mets = data.metrics;

  if (y + 70 > pageH - 16) { pdf.addPage(); y = 16; }

  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(30, 41, 59);
  pdf.text("Diagnostik Model", ml, y);
  y += 6;

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  const diagRows: [string, string][] = [
    ["Order (p,d,q)", `(${diag.order.join(",")})`],
    ...(diag.seasonal_order ? [["Seasonal (P,D,Q,m)", `(${diag.seasonal_order.join(",")})`] as [string, string]] : []),
    ["AIC", diag.aic.toFixed(2)],
    ["BIC", diag.bic.toFixed(2)],
    ["ADF Statistic", diag.adf_statistic.toFixed(4)],
    ["p-value (ADF)", diag.adf_pvalue.toFixed(6)],
    ["Status", diag.is_stationary ? "Stasioner" : "Non-Stasioner"],
    ["MAPE", mets.mape !== null ? `${mets.mape.toFixed(2)}%` : "-"],
    ["RMSE", mets.rmse !== null ? `${mets.rmse.toFixed(2)} ${unit}` : "-"],
    ["MAE", mets.mae !== null ? `${mets.mae.toFixed(2)} ${unit}` : "-"],
  ];
  for (const [label, val] of diagRows) {
    pdf.setTextColor(100, 116, 139);
    pdf.text(label, ml, y);
    pdf.setTextColor(30, 41, 59);
    pdf.text(val, mr, y, { align: "right" });
    y += 5.5;
  }
  y += 4;

  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(30, 41, 59);
  pdf.text("Tabel Hasil Forecast", ml, y);
  y += 7;

  const colX = [ml, ml + 44, ml + 88, ml + 128];
  const headers = [`Bulan`, `Forecast (${unit})`, `Batas Bawah (${unit})`, `Batas Atas (${unit})`];
  pdf.setFillColor(241, 245, 249);
  pdf.rect(ml, y - 4, mr - ml, 7, "F");
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(71, 85, 105);
  headers.forEach((h: string, i: number) => pdf.text(h, colX[i], y));
  y += 5;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  data.forecast.forEach((p, idx: number) => {
    if (y > pageH - 16) { pdf.addPage(); y = 16; }
    if (idx % 2 === 1) {
      pdf.setFillColor(248, 250, 252);
      pdf.rect(ml, y - 3.5, mr - ml, 6, "F");
    }
    const dateLabel = new Date(p.date).toLocaleDateString("id-ID", { month: "long", year: "numeric" });
    const fc = p.value !== null ? p.value.toFixed(2) : "-";
    const lo = p.lower_ci !== null ? p.lower_ci.toFixed(2) : "-";
    const hi = p.upper_ci !== null ? p.upper_ci.toFixed(2) : "-";
    pdf.setTextColor(30, 41, 59);
    pdf.text(dateLabel, colX[0], y);
    pdf.setTextColor(51, 65, 85);
    pdf.text(fc, colX[1], y);
    pdf.setTextColor(100, 116, 139);
    pdf.text(lo, colX[2], y);
    pdf.text(hi, colX[3], y);
    y += 6;
  });

  pdf.save(`forecast_${metric.toLowerCase()}.pdf`);
}

const METRICS = [
  { value: "CPU", label: "CPU", description: "Persentase penggunaan CPU (%)", unit: "%", icon: Cpu, color: "indigo" },
  { value: "Memory", label: "Memory", description: "Penggunaan memori (GB/TB)", unit: "GB", icon: MemoryStick, color: "violet" },
  { value: "Storage", label: "Storage", description: "Penggunaan disk (GB/TB)", unit: "GB", icon: HardDrive, color: "blue" },
] as const;

const METRIC_COLORS: Record<string, { badge: string; line: string; kpi: string; border: string }> = {
  CPU: {
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800",
    line: "#6366f1",
    kpi: "from-indigo-500 to-indigo-600",
    border: "border-indigo-500",
  },
  Memory: {
    badge: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800",
    line: "#7c3aed",
    kpi: "from-violet-500 to-violet-600",
    border: "border-violet-500",
  },
  Storage: {
    badge: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
    line: "#3b82f6",
    kpi: "from-blue-500 to-blue-600",
    border: "border-blue-500",
  },
};

const CSV_FORMAT_COLUMNS = [
  { name: "Tanggal", type: "Date", desc: "Tanggal observasi", example: "01/01/2022", required: true },
  { name: "CPU", type: "Float (%)", desc: "Penggunaan CPU", example: "72.5", required: false },
  { name: "Memory", type: "Float (GB/TB)", desc: "Penggunaan memori", example: "128.5", required: false },
  { name: "Storage", type: "Float (GB/TB)", desc: "Penggunaan disk", example: "820.3", required: false },
];

function mapeColor(mape: number | null) {
  if (mape === null) return "text-slate-500 dark:text-slate-400";
  if (mape < 10) return "text-emerald-600 dark:text-emerald-400";
  if (mape < 20) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function mapeLabel(mape: number | null) {
  if (mape === null) return "-";
  if (mape < 10) return "Sangat Baik";
  if (mape < 20) return "Baik";
  return "Perlu Perhatian";
}

function mapeBg(mape: number | null) {
  if (mape === null) return "bg-slate-50 dark:bg-[var(--surface-alt)]";
  if (mape < 10) return "bg-emerald-50 dark:bg-emerald-950";
  if (mape < 20) return "bg-amber-50 dark:bg-amber-950";
  return "bg-red-50 dark:bg-red-950";
}

function mapeTrend(mape: number | null) {
  if (mape === null) return <Minus className="h-4 w-4 text-slate-400" />;
  if (mape < 10) return <TrendingUp className="h-4 w-4 text-emerald-500" />;
  if (mape < 20) return <TrendingDown className="h-4 w-4 text-amber-500" />;
  return <TrendingDown className="h-4 w-4 text-red-500" />;
}

function formatNum(v: number | null | undefined, decimals = 4): string {
  if (v === null || v === undefined) return "-";
  return v.toFixed(decimals);
}

function hasNullMetrics(metrics: { mape: number | null; rmse: number | null; mae: number | null }): boolean {
  return metrics.mape === null || metrics.rmse === null || metrics.mae === null;
}

function exportForecastCSV(metric: string, unit: string, data: ForecastResponse) {
  const histRows = data.historical.map((p) => ({
    Tanggal: p.date, Tipe: "Historis", [`${metric} (${unit})`]: p.value, "Batas Bawah CI": "", "Batas Atas CI": "",
  }));
  const fcRows = data.forecast.map((p) => ({
    Tanggal: p.date, Tipe: "Forecast", [`${metric} (${unit})`]: p.value ?? "", "Batas Bawah CI": p.lower_ci ?? "", "Batas Atas CI": p.upper_ci ?? "",
  }));
  const csv = Papa.unparse([...histRows, ...fcRows]);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `forecast_${metric.toLowerCase()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function CsvFormatGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3 rounded-lg border border-[var(--border)] bg-slate-50 dark:bg-[var(--surface-alt)]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300"
      >
        <span className="flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-indigo-400" />
          Format CSV yang diperlukan
        </span>
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>
      {open && (
        <div className="border-t border-[var(--border)] p-3">
          <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
            File CSV harus memiliki kolom berikut (minimal kolom Tanggal + satu metrik):
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[380px] text-xs">
              <thead>
                <tr className="bg-slate-100 text-left dark:bg-[var(--surface)]">
                  <th className="px-2 py-1.5 font-semibold text-slate-600 dark:text-slate-300">Kolom</th>
                  <th className="px-2 py-1.5 font-semibold text-slate-600 dark:text-slate-300">Tipe</th>
                  <th className="px-2 py-1.5 font-semibold text-slate-600 dark:text-slate-300">Contoh</th>
                  <th className="px-2 py-1.5 font-semibold text-slate-600 dark:text-slate-300">Wajib</th>
                </tr>
              </thead>
              <tbody>
                {CSV_FORMAT_COLUMNS.map((col) => (
                  <tr key={col.name} className="border-t border-[var(--border)]">
                    <td className="px-2 py-1.5 font-mono font-semibold text-slate-700 dark:text-slate-200">{col.name}</td>
                    <td className="px-2 py-1.5 text-slate-500 dark:text-slate-400">{col.type}</td>
                    <td className="px-2 py-1.5 font-mono text-slate-600 dark:text-slate-300">{col.example}</td>
                    <td className="px-2 py-1.5">
                      {col.required ? (
                        <span className="rounded bg-red-100 px-1.5 py-0.5 text-red-600 dark:bg-red-950 dark:text-red-400">Wajib</span>
                      ) : (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-400 dark:bg-[var(--surface)] dark:text-slate-500">Opsional</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2.5 rounded bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            <strong>Catatan:</strong> Format tanggal: DD/MM/YYYY atau YYYY-MM-DD. Minimal 24 baris data historis.
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── KPI summary strip above the chart ─────────────────────────────────── */
function KpiStrip({ result }: { result: MetricResult }) {
  if (result.error) return null;
  const { data } = result;
  const metricMeta = METRICS.find((m) => m.value === result.metric);
  const unit = metricMeta?.unit ?? "";
  const colors = METRIC_COLORS[result.metric] ?? METRIC_COLORS.CPU;

  const lastFc = data.forecast[data.forecast.length - 1];
  const firstFc = data.forecast[0];
  const lastHist = data.historical[data.historical.length - 1];

  const delta =
    firstFc && lastHist && firstFc.value !== null && lastHist.value !== null
      ? firstFc.value - lastHist.value
      : null;
  const pct = delta !== null && lastHist.value ? (delta / lastHist.value) * 100 : null;

  const kpis = [
    {
      label: "Titik Terakhir",
      value: lastHist ? formatNum(lastHist.value, 2) : "-",
      sub: unit,
      icon: Activity,
    },
    {
      label: "Forecast Pertama",
      value: firstFc ? formatNum(firstFc.value, 2) : "-",
      sub: unit,
      icon: TrendingUp,
    },
    {
      label: "Forecast Akhir",
      value: lastFc ? formatNum(lastFc.value, 2) : "-",
      sub: unit,
      icon: BarChart3,
    },
    {
      label: "Perubahan Awal",
      value: pct !== null ? `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%` : "-",
      sub: delta !== null ? `${delta >= 0 ? "+" : ""}${delta.toFixed(2)} ${unit}` : "",
      icon: delta !== null && delta >= 0 ? TrendingUp : TrendingDown,
      accent: delta !== null ? (delta >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400") : "text-slate-500",
    },
    {
      label: "MAPE",
      value: data.metrics.mape !== null ? `${data.metrics.mape.toFixed(2)}%` : "-",
      sub: mapeLabel(data.metrics.mape),
      icon: Zap,
      accent: mapeColor(data.metrics.mape),
    },
  ];

  return (
    <div className={`mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5`}>
      {kpis.map(({ label, value, sub, icon: Icon, accent }) => (
        <div
          key={label}
          className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{label}</p>
            <div className={`flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br ${colors.kpi} text-white`}>
              <Icon className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className={`mt-2 text-xl font-bold leading-none ${accent ?? "text-slate-800 dark:text-slate-100"}`}>
            {value}
          </p>
          {sub && <p className="mt-1 text-[10px] text-slate-400">{sub}</p>}
        </div>
      ))}
    </div>
  );
}

/* ─── Diagnostics side panel ─────────────────────────────────────────────── */
function DiagnosticsPanel({ result }: { result: MetricResult }) {
  if (result.error) return null;
  const { data } = result;
  const metricMeta = METRICS.find((m) => m.value === result.metric);
  const unit = metricMeta?.unit ?? "";

  const rows: { label: string; value: string; mono?: boolean }[] = [
    { label: "Model", value: data.diagnostics.seasonal_order ? "SARIMA" : "ARIMA", mono: false },
    { label: "Order (p,d,q)", value: `(${data.diagnostics.order.join(",")})`, mono: true },
    ...(data.diagnostics.seasonal_order
      ? [{ label: "Seasonal (P,D,Q,m)", value: `(${data.diagnostics.seasonal_order.join(",")})`, mono: true }]
      : []),
    { label: "AIC", value: formatNum(data.diagnostics.aic, 2), mono: true },
    { label: "BIC", value: formatNum(data.diagnostics.bic, 2), mono: true },
    { label: "ADF p-value", value: formatNum(data.diagnostics.adf_pvalue, 4), mono: true },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Model params */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
        <h4 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          <Info className="h-3.5 w-3.5" />
          Diagnostik Model
        </h4>
        <dl className="space-y-2.5">
          {rows.map(({ label, value, mono }) => (
            <div key={label} className="flex items-center justify-between gap-2">
              <dt className="text-xs text-slate-500 dark:text-slate-400">{label}</dt>
              <dd className={`text-xs font-semibold text-slate-800 dark:text-slate-100 ${mono ? "font-mono" : ""}`}>{value}</dd>
            </div>
          ))}
          <div className="border-t border-[var(--border-light)] pt-2">
            <div className="flex items-center justify-between">
              <dt className="text-xs text-slate-500 dark:text-slate-400">Stasioneritas</dt>
              <dd>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    data.diagnostics.is_stationary
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${data.diagnostics.is_stationary ? "bg-emerald-500" : "bg-amber-500"}`} />
                  {data.diagnostics.is_stationary ? "Stasioner" : "Non-Stasioner"}
                </span>
              </dd>
            </div>
          </div>
        </dl>
      </div>

      {/* Evaluation */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
        <h4 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          <Zap className="h-3.5 w-3.5" />
          Evaluasi Model
        </h4>

        {/* MAPE prominent */}
        <div className={`mb-3 rounded-lg p-3 ${mapeBg(data.metrics.mape)}`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">MAPE</span>
            <div className="flex items-center gap-1">
              {mapeTrend(data.metrics.mape)}
              <span className={`text-[11px] font-semibold ${mapeColor(data.metrics.mape)}`}>
                {mapeLabel(data.metrics.mape)}
              </span>
            </div>
          </div>
          <p className={`mt-1 text-2xl font-bold leading-none ${mapeColor(data.metrics.mape)}`}>
            {data.metrics.mape !== null ? `${data.metrics.mape.toFixed(2)}%` : "—"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-[var(--surface-alt)]">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">RMSE</p>
            <p className="mt-0.5 font-mono text-sm font-bold text-slate-800 dark:text-slate-100">
              {formatNum(data.metrics.rmse, 2)}
            </p>
            <p className="text-[10px] text-slate-400">{unit}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-[var(--surface-alt)]">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">MAE</p>
            <p className="mt-0.5 font-mono text-sm font-bold text-slate-800 dark:text-slate-100">
              {formatNum(data.metrics.mae, 2)}
            </p>
            <p className="text-[10px] text-slate-400">{unit}</p>
          </div>
        </div>

        {hasNullMetrics(data.metrics) && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2 text-[11px] text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
            <p className="font-semibold">Mengapa ada nilai kosong?</p>
            <ul className="mt-1 list-inside list-disc space-y-0.5 text-amber-600 dark:text-amber-400">
              <li>Data historis terlalu sedikit (butuh min. 24 baris).</li>
              {data.metrics.mape === null && data.metrics.rmse !== null && (
                <li>MAPE tidak bisa dihitung jika ada nilai aktual = 0.</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Forecast table ─────────────────────────────────────────────────────── */
function ForecastTableSection({ result }: { result: MetricResult }) {
  const metricMeta = METRICS.find((m) => m.value === result.metric);
  const MetricIcon = metricMeta?.icon ?? Cpu;
  const unit = metricMeta?.unit ?? "";
  const colors = METRIC_COLORS[result.metric] ?? METRIC_COLORS.CPU;

  if (result.error) return null;
  const { data } = result;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3.5">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colors.badge}`}>
            <MetricIcon className="h-3 w-3" />
            {result.metric} ({unit})
          </span>
          <span className="text-xs text-slate-400">— {data.forecast.length} bulan</span>
        </div>
        <button
          onClick={() => exportForecastCSV(result.metric, unit, data)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 dark:hover:bg-indigo-900"
        >
          <Download className="h-3.5 w-3.5" />
          Ekspor CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr className="bg-slate-50 text-left dark:bg-[var(--surface-alt)]">
              <th className="w-8 px-3 py-2.5 text-center text-xs font-semibold text-slate-400">#</th>
              <th className="whitespace-nowrap px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300">Bulan</th>
              <th className="whitespace-nowrap px-4 py-2.5 text-right text-xs font-semibold text-slate-600 dark:text-slate-300">Forecast ({unit})</th>
              <th className="whitespace-nowrap px-4 py-2.5 text-right text-xs font-semibold text-slate-600 dark:text-slate-300">Batas Bawah CI</th>
              <th className="whitespace-nowrap px-4 py-2.5 text-right text-xs font-semibold text-slate-600 dark:text-slate-300">Batas Atas CI</th>
              <th className="whitespace-nowrap px-4 py-2.5 text-right text-xs font-semibold text-slate-600 dark:text-slate-300">Rentang CI</th>
            </tr>
          </thead>
          <tbody>
            {data.forecast.map((p, idx) => {
              const range = p.lower_ci !== null && p.upper_ci !== null ? p.upper_ci - p.lower_ci : null;
              const widthPct = range !== null && data.forecast.length > 0
                ? Math.min(100, (range / (data.forecast[data.forecast.length - 1]?.upper_ci ?? 1 || 1)) * 100)
                : 0;
              return (
                <tr
                  key={p.date}
                  className={`group transition-colors hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 ${
                    idx % 2 === 0 ? "bg-[var(--surface)]" : "bg-slate-50/50 dark:bg-[var(--surface-alt)]/50"
                  }`}
                >
                  <td className="px-3 py-2 text-center text-xs text-slate-400">{idx + 1}</td>
                  <td className="whitespace-nowrap px-4 py-2 font-medium text-slate-700 dark:text-slate-200">
                    {new Date(p.date).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right font-mono font-semibold text-slate-800 dark:text-slate-100">
                    {formatNum(p.value, 2)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right font-mono text-slate-500 dark:text-slate-400">
                    {formatNum(p.lower_ci, 2)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right font-mono text-slate-500 dark:text-slate-400">
                    {formatNum(p.upper_ci, 2)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 dark:bg-[var(--surface-alt)]">
                        <div
                          className="h-full rounded-full bg-indigo-300 dark:bg-indigo-700 transition-all"
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs text-slate-400">
                        {range !== null ? `± ${(range / 2).toFixed(2)}` : "-"}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Main result dashboard ──────────────────────────────────────────────── */
function MetricDashboard({ result }: { result: MetricResult }) {
  const metricMeta = METRICS.find((m) => m.value === result.metric);
  const MetricIcon = metricMeta?.icon ?? Cpu;
  const unit = metricMeta?.unit ?? "";
  const colors = METRIC_COLORS[result.metric] ?? METRIC_COLORS.CPU;
  const [pdfLoading, setPdfLoading] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  if (result.error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500 dark:text-red-400" />
          <div>
            <p className="font-semibold text-red-700 dark:text-red-300">Forecast {result.metric} Gagal</p>
            <p className="mt-0.5 text-sm text-red-600 dark:text-red-400">{result.error}</p>
          </div>
        </div>
      </div>
    );
  }

  const { data } = result;

  async function handleExportPDF() {
    setPdfLoading(true);
    try { await exportToPDF(result.metric, unit, data, chartRef.current); }
    finally { setPdfLoading(false); }
  }

  return (
    <div className="space-y-4">
      {/* Dashboard header bar */}
      <div className={`flex items-center justify-between rounded-xl border-l-4 ${colors.border} border border-[var(--border)] bg-[var(--surface)] px-5 py-3.5 shadow-sm`}>
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${colors.kpi} text-white shadow-sm`}>
            <MetricIcon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{result.metric} Dashboard</p>
            <p className="text-xs text-slate-400">
              {data.historical.length} titik historis · {data.forecast.length} bulan forecast · Satuan: {unit}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportForecastCSV(result.metric, unit, data)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-[var(--surface-alt)]"
          >
            <Download className="h-3.5 w-3.5" />
            CSV
          </button>
          <button
            onClick={handleExportPDF}
            disabled={pdfLoading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100 disabled:opacity-60 dark:bg-rose-950 dark:text-rose-300 dark:hover:bg-rose-900"
          >
            {pdfLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            PDF
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <KpiStrip result={result} />

      {/* Chart + side panel */}
      <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
        {/* Chart card */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3.5">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Grafik Forecast — {result.metric}
            </h4>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${colors.badge}`}>
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
              Live
            </span>
          </div>
          <div className="p-4" ref={chartRef}>
            <ForecastChart
              historical={data.historical}
              forecast={data.forecast}
              accentColor={colors.line}
              unit={unit}
            />
          </div>
        </div>

        {/* Side panel */}
        <DiagnosticsPanel result={result} />
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function AplikasiPage() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedMetrics, setSelectedMetrics] = useState<Set<string>>(new Set(["CPU"]));
  const [forecastMonths, setForecastMonths] = useState(12);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [results, setResults] = useState<MetricResult[] | null>(null);
  const [activeTab, setActiveTab] = useState<string>("");
  const [activeTableTab, setActiveTableTab] = useState<string>("");
  const [showTable, setShowTable] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length > 0) {
      setFile(accepted[0]);
      setResults(null);
      setGlobalError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    multiple: false,
  });

  function toggleMetric(value: string) {
    setSelectedMetrics((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        if (next.size === 1) return next;
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  }

  async function handleSubmit() {
    if (!file) { setGlobalError("Pilih file CSV terlebih dahulu."); return; }
    if (selectedMetrics.size === 0) { setGlobalError("Pilih minimal satu metrik."); return; }
    setLoading(true);
    setGlobalError(null);
    setResults(null);
    setShowTable(false);
    try {
      const metrics = METRICS.filter((m) => selectedMetrics.has(m.value)).map((m) => m.value);
      const res = await postForecastMulti(file, metrics, forecastMonths);
      setResults(res);
      const firstSuccess = res.find((r) => !r.error);
      setActiveTab(firstSuccess?.metric ?? res[0].metric);
      setActiveTableTab(firstSuccess?.metric ?? res[0].metric);
    } catch {
      setGlobalError("Terjadi kesalahan tak terduga. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  const successCount = results?.filter((r) => !r.error).length ?? 0;
  const errorCount = results?.filter((r) => r.error).length ?? 0;

  return (
    <main className="min-h-screen bg-white dark:bg-[var(--background)]">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">

        {/* Page header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Forecasting Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Prediksi utilisasi sumber daya menggunakan Auto ARIMA/SARIMA
            </p>
          </div>
          {results && (
            <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 dark:border-emerald-900 dark:bg-emerald-950">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                {successCount} metrik berhasil
                {errorCount > 0 && `, ${errorCount} gagal`}
              </span>
            </div>
          )}
        </div>

        <div className="grid gap-6 xl:grid-cols-[300px_1fr]">

          {/* ── Config sidebar ──────────────────────────────────── */}
          <aside className="space-y-4">

            {/* Upload */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
              <div className="border-b border-[var(--border)] px-4 py-3">
                <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <Upload className="h-3.5 w-3.5" />
                  Data Sumber
                </h2>
              </div>
              <div className="p-4">
                <div
                  {...getRootProps()}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors ${
                    isDragActive
                      ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-950"
                      : "border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/40 dark:border-[var(--border)] dark:bg-[var(--surface-alt)] dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30"
                  }`}
                >
                  <input {...getInputProps()} />
                  {file ? (
                    <>
                      <CheckCircle2 className="mb-2 h-7 w-7 text-emerald-500 dark:text-emerald-400" />
                      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{file.name}</p>
                      <p className="mt-0.5 text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB · klik untuk ganti</p>
                    </>
                  ) : (
                    <>
                      <Upload className="mb-2 h-7 w-7 text-slate-300 dark:text-slate-600" />
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Seret CSV ke sini</p>
                      <p className="mt-0.5 text-xs text-slate-400">atau klik untuk memilih</p>
                    </>
                  )}
                </div>
                <CsvFormatGuide />
              </div>
            </div>

            {/* Metric selector */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
              <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
                <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <Activity className="h-3.5 w-3.5" />
                  Metrik
                </h2>
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {selectedMetrics.size}/3
                </span>
              </div>
              <div className="space-y-1 p-3">
                {METRICS.map((m) => {
                  const Icon = m.icon;
                  const active = selectedMetrics.has(m.value);
                  const colors = METRIC_COLORS[m.value];
                  return (
                    <button
                      key={m.value}
                      onClick={() => toggleMetric(m.value)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all ${
                        active
                          ? `${colors.badge} border border-current`
                          : "border border-transparent text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-[var(--surface-alt)]"
                      }`}
                    >
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${active ? `bg-gradient-to-br ${colors.kpi} text-white` : "bg-slate-100 text-slate-500 dark:bg-[var(--surface-alt)] dark:text-slate-400"}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{m.label}</p>
                        <p className={`truncate text-[11px] ${active ? "opacity-70" : "text-slate-400"}`}>{m.description}</p>
                      </div>
                      <div className={`h-4 w-4 shrink-0 rounded border-2 transition-all ${active ? "border-current bg-current" : "border-slate-300 dark:border-slate-600"}`}>
                        {active && (
                          <svg viewBox="0 0 16 16" fill="none" className="h-full w-full">
                            <path d="M3 8l3.5 3.5L13 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Forecast period */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
              <div className="border-b border-[var(--border)] px-4 py-3">
                <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <BarChart3 className="h-3.5 w-3.5" />
                  Periode Prediksi
                </h2>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={60}
                    value={forecastMonths}
                    onChange={(e) => setForecastMonths(Number(e.target.value))}
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-indigo-600 dark:bg-[var(--border)]"
                  />
                  <div className="relative shrink-0">
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={forecastMonths}
                      onChange={(e) => {
                        const v = Math.max(1, Math.min(60, Number(e.target.value) || 1));
                        setForecastMonths(v);
                      }}
                      className="w-16 rounded-lg border border-indigo-200 bg-indigo-50 px-2 py-1.5 text-center text-sm font-bold text-indigo-700 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
                    />
                    <span className="absolute -bottom-4 left-0 w-full text-center text-[10px] text-slate-400">bln</span>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400">{forecastMonths} bulan</span>
                  {forecastMonths >= 12 && (
                    <span className="text-slate-400">
                      ≈ {(forecastMonths / 12).toFixed(forecastMonths % 12 === 0 ? 0 : 1)} tahun
                    </span>
                  )}
                </div>

                {/* Accuracy band visual */}
                <div className="mt-3 overflow-hidden rounded-lg bg-slate-100 dark:bg-[var(--surface-alt)]">
                  <div
                    className={`h-1.5 rounded-lg transition-all duration-300 ${
                      forecastMonths <= 12 ? "bg-emerald-400" : forecastMonths <= 24 ? "bg-amber-400" : "bg-red-400"
                    }`}
                    style={{ width: `${(forecastMonths / 60) * 100}%` }}
                  />
                </div>
                <p className={`mt-1.5 text-[11px] font-medium ${
                  forecastMonths <= 12 ? "text-emerald-600 dark:text-emerald-400"
                  : forecastMonths <= 24 ? "text-amber-600 dark:text-amber-400"
                  : "text-red-600 dark:text-red-400"
                }`}>
                  Akurasi: {forecastMonths <= 12 ? "Tinggi (≤ 12 bln)" : forecastMonths <= 24 ? "Sedang (≤ 24 bln)" : "Rendah (> 24 bln)"}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  CI melebar seiring bertambahnya periode prediksi.
                </p>
              </div>
            </div>

            {/* Run button */}
            <button
              onClick={handleSubmit}
              disabled={loading || selectedMetrics.size === 0 || !file}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:shadow-none"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memproses {selectedMetrics.size} metrik…
                </>
              ) : (
                <>
                  <FlaskConical className="h-4 w-4" />
                  Jalankan Forecast
                </>
              )}
            </button>

            {globalError && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {globalError}
              </div>
            )}
          </aside>

          {/* ── Results area ────────────────────────────────────── */}
          <div className="min-w-0 space-y-5">

            {/* Empty / Loading states */}
            {!results && !loading && (
              <div className="flex h-full min-h-[480px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)]/60">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-[var(--surface-alt)]">
                  <BarChart3 className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                </div>
                <p className="mt-4 text-base font-semibold text-slate-500 dark:text-slate-400">Dashboard kosong</p>
                <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
                  Unggah CSV dan klik &quot;Jalankan Forecast&quot; untuk memulai
                </p>
              </div>
            )}

            {loading && (
              <div className="flex h-full min-h-[480px] flex-col items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-500 dark:text-indigo-400" />
                <p className="mt-4 text-base font-semibold text-slate-600 dark:text-slate-300">Menjalankan ARIMA/SARIMA…</p>
                <p className="mt-1 text-sm text-slate-400">Memproses {selectedMetrics.size} metrik, mohon tunggu</p>
              </div>
            )}

            {results && !loading && (
              <>
                {/* Metric tabs */}
                {results.length > 1 && (
                  <div className="flex gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-sm">
                    {results.map((r) => {
                      const Icon = METRICS.find((m) => m.value === r.metric)?.icon ?? Cpu;
                      const colors = METRIC_COLORS[r.metric];
                      const isActive = activeTab === r.metric;
                      return (
                        <button
                          key={r.metric}
                          onClick={() => setActiveTab(r.metric)}
                          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                            isActive
                              ? `${colors.badge} shadow-sm`
                              : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-[var(--surface-alt)]"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {r.metric}
                          {r.error && <AlertCircle className="h-3 w-3 text-red-400" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Active metric dashboard */}
                {results.filter((r) => r.metric === activeTab).map((r) => (
                  <MetricDashboard key={r.metric} result={r} />
                ))}

                {/* Forecast table toggle */}
                {results.some((r) => !r.error) && (
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                    <button
                      onClick={() => setShowTable((v) => !v)}
                      className="flex w-full items-center justify-between px-5 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-200"
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-indigo-400" />
                        Tabel Data Forecast
                      </span>
                      {showTable ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                    </button>

                    {showTable && (
                      <div className="border-t border-[var(--border)] p-4 space-y-4">
                        {/* Table metric tabs */}
                        {results.filter((r) => !r.error).length > 1 && (
                          <div className="flex gap-1 rounded-lg border border-[var(--border)] bg-slate-50 p-1 dark:bg-[var(--surface-alt)]">
                            {results.filter((r) => !r.error).map((r) => {
                              const Icon = METRICS.find((m) => m.value === r.metric)?.icon ?? Cpu;
                              const colors = METRIC_COLORS[r.metric];
                              const isActive = activeTableTab === r.metric;
                              return (
                                <button
                                  key={r.metric}
                                  onClick={() => setActiveTableTab(r.metric)}
                                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                                    isActive ? `${colors.badge} shadow-sm` : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                                  }`}
                                >
                                  <Icon className="h-3 w-3" />
                                  {r.metric}
                                </button>
                              );
                            })}
                          </div>
                        )}
                        {results.filter((r) => r.metric === activeTableTab && !r.error).map((r) => (
                          <ForecastTableSection key={r.metric} result={r} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
