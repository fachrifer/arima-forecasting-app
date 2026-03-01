"use client";

import { useState, useCallback } from "react";
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
} from "lucide-react";
import { postForecastMulti, type ForecastResponse, type MetricResult } from "@/lib/api";
import ForecastChart from "./components/ForecastChart";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PDF = any;

async function exportToPDF(metric: string, unit: string, data: ForecastResponse) {
  const mod = await import("jspdf");
  // jsPDF v3+ uses named export; v2 uses default
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

  const diag = data.diagnostics;
  const mets = data.metrics;

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
    if (y > pageH - 16) {
      pdf.addPage();
      y = 16;
    }
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
  {
    value: "CPU",
    label: "CPU",
    description: "Persentase penggunaan CPU (%)",
    unit: "%",
    icon: Cpu,
    color: "indigo",
  },
  {
    value: "Memory",
    label: "Memory",
    description: "Penggunaan memori (GB/TB)",
    unit: "GB",
    icon: MemoryStick,
    color: "violet",
  },
  {
    value: "Storage",
    label: "Storage",
    description: "Penggunaan disk (GB/TB)",
    unit: "GB",
    icon: HardDrive,
    color: "blue",
  },
] as const;

const METRIC_COLORS: Record<string, { badge: string; line: string }> = {
  CPU: { badge: "bg-indigo-50 text-indigo-700 border-indigo-200", line: "#6366f1" },
  Memory: { badge: "bg-violet-50 text-violet-700 border-violet-200", line: "#7c3aed" },
  Storage: { badge: "bg-blue-50 text-blue-700 border-blue-200", line: "#3b82f6" },
};

const CSV_FORMAT_COLUMNS = [
  { name: "Tanggal", type: "Date", desc: "Tanggal observasi", example: "01/01/2022", required: true },
  { name: "CPU", type: "Float (%)", desc: "Penggunaan CPU", example: "72.5", required: false },
  { name: "Memory", type: "Float (GB/TB)", desc: "Penggunaan memori", example: "128.5", required: false },
  { name: "Storage", type: "Float (GB/TB)", desc: "Penggunaan disk", example: "820.3", required: false },
];

function mapeColor(mape: number | null) {
  if (mape === null) return "text-slate-500";
  if (mape < 10) return "text-emerald-600";
  if (mape < 20) return "text-amber-600";
  return "text-red-600";
}

function mapeLabel(mape: number | null) {
  if (mape === null) return "-";
  if (mape < 10) return "Sangat Baik";
  if (mape < 20) return "Baik";
  return "Perlu Perhatian";
}

function mapeBg(mape: number | null) {
  if (mape === null) return "bg-slate-50";
  if (mape < 10) return "bg-emerald-50";
  if (mape < 20) return "bg-amber-50";
  return "bg-red-50";
}

function formatNum(v: number | null | undefined, decimals = 4): string {
  if (v === null || v === undefined) return "-";
  return v.toFixed(decimals);
}

function exportForecastCSV(metric: string, unit: string, data: ForecastResponse) {
  const histRows = data.historical.map((p) => ({
    Tanggal: p.date,
    Tipe: "Historis",
    [`${metric} (${unit})`]: p.value,
    "Batas Bawah CI": "",
    "Batas Atas CI": "",
  }));
  const fcRows = data.forecast.map((p) => ({
    Tanggal: p.date,
    Tipe: "Forecast",
    [`${metric} (${unit})`]: p.value ?? "",
    "Batas Bawah CI": p.lower_ci ?? "",
    "Batas Atas CI": p.upper_ci ?? "",
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
    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-xs font-semibold text-slate-600"
      >
        <span className="flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-indigo-400" />
          Format CSV yang diperlukan
        </span>
        {open ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
      </button>
      {open && (
        <div className="border-t border-slate-200 p-3">
          <p className="mb-2 text-xs text-slate-500">
            File CSV harus memiliki kolom berikut (minimal kolom Tanggal + satu metrik):
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[380px] text-xs">
              <thead>
                <tr className="bg-slate-100 text-left">
                  <th className="px-2 py-1.5 font-semibold text-slate-600">Kolom</th>
                  <th className="px-2 py-1.5 font-semibold text-slate-600">Tipe</th>
                  <th className="px-2 py-1.5 font-semibold text-slate-600">Contoh</th>
                  <th className="px-2 py-1.5 font-semibold text-slate-600">Wajib</th>
                </tr>
              </thead>
              <tbody>
                {CSV_FORMAT_COLUMNS.map((col) => (
                  <tr key={col.name} className="border-t border-slate-200">
                    <td className="px-2 py-1.5 font-mono font-semibold text-slate-700">
                      {col.name}
                    </td>
                    <td className="px-2 py-1.5 text-slate-500">{col.type}</td>
                    <td className="px-2 py-1.5 font-mono text-slate-600">
                      {col.example}
                    </td>
                    <td className="px-2 py-1.5">
                      {col.required ? (
                        <span className="rounded bg-red-100 px-1.5 py-0.5 text-red-600">Wajib</span>
                      ) : (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-400">Opsional</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2.5 rounded bg-amber-50 px-3 py-2 text-xs text-amber-700">
            <strong>Catatan:</strong> Format tanggal: DD/MM/YYYY atau YYYY-MM-DD.
            Minimal 24 baris data historis untuk hasil yang akurat.
          </div>
        </div>
      )}
    </div>
  );
}

function MetricResultCard({ result }: { result: MetricResult }) {
  const metricMeta = METRICS.find((m) => m.value === result.metric);
  const MetricIcon = metricMeta?.icon ?? Cpu;
  const unit = metricMeta?.unit ?? "";
  const colors = METRIC_COLORS[result.metric] ?? METRIC_COLORS.CPU;
  const [pdfLoading, setPdfLoading] = useState(false);

  if (result.error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          <div>
            <p className="font-semibold text-red-700">
              Forecast {result.metric} Gagal
            </p>
            <p className="mt-0.5 text-sm text-red-600">{result.error}</p>
          </div>
        </div>
      </div>
    );
  }

  const { data } = result;

  async function handleExportPDF() {
    setPdfLoading(true);
    try {
      await exportToPDF(result.metric, unit, data);
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${colors.badge} border`}
          >
            <MetricIcon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{result.metric}</p>
            <p className="text-xs text-slate-400">Satuan: {unit}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            disabled={pdfLoading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100 disabled:opacity-60"
          >
            {pdfLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            PDF
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-800">
            Grafik Forecast — {result.metric}
          </h4>
          <span className="text-xs text-slate-400">Satuan: {unit}</span>
        </div>
        <ForecastChart
          historical={data.historical}
          forecast={data.forecast}
          accentColor={colors.line}
          unit={unit}
        />
      </div>

      {/* Diagnostics + Metrics */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Diagnostics */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h4 className="mb-4 text-sm font-semibold text-slate-800">
            Diagnostik Model
          </h4>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Order (p,d,q)</dt>
              <dd className="font-mono font-semibold text-slate-800">
                ({data.diagnostics.order.join(",")})
              </dd>
            </div>
            {data.diagnostics.seasonal_order && (
              <div className="flex justify-between">
                <dt className="text-slate-500">Seasonal (P,D,Q,m)</dt>
                <dd className="font-mono font-semibold text-slate-800">
                  ({data.diagnostics.seasonal_order.join(",")})
                </dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-slate-500">AIC</dt>
              <dd className="font-mono font-semibold text-slate-800">
                {formatNum(data.diagnostics.aic, 2)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">BIC</dt>
              <dd className="font-mono font-semibold text-slate-800">
                {formatNum(data.diagnostics.bic, 2)}
              </dd>
            </div>
            <div className="border-t border-slate-100 pt-3">
              <div className="flex justify-between">
                <dt className="text-slate-500">ADF Statistic</dt>
                <dd className="font-mono font-semibold text-slate-800">
                  {formatNum(data.diagnostics.adf_statistic)}
                </dd>
              </div>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">p-value (ADF)</dt>
              <dd className="font-mono font-semibold text-slate-800">
                {formatNum(data.diagnostics.adf_pvalue, 6)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Status</dt>
              <dd>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    data.diagnostics.is_stationary
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {data.diagnostics.is_stationary ? "Stasioner" : "Non-Stasioner"}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        {/* Evaluation */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h4 className="mb-4 text-sm font-semibold text-slate-800">
            Evaluasi Model
          </h4>
          <div className="space-y-3">
            <div className={`rounded-lg p-3.5 ${mapeBg(data.metrics.mape)}`}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500">MAPE</p>
                <span className={`text-xs font-semibold ${mapeColor(data.metrics.mape)}`}>
                  {mapeLabel(data.metrics.mape)}
                </span>
              </div>
              <p className={`mt-0.5 text-2xl font-bold ${mapeColor(data.metrics.mape)}`}>
                {data.metrics.mape !== null
                  ? `${data.metrics.mape.toFixed(2)}%`
                  : "-"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-slate-50 p-3.5">
                <p className="text-xs font-medium text-slate-500">RMSE</p>
                <p className="mt-0.5 text-lg font-bold text-slate-800">
                  {formatNum(data.metrics.rmse, 2)}
                </p>
                <p className="text-xs text-slate-400">{unit}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3.5">
                <p className="text-xs font-medium text-slate-500">MAE</p>
                <p className="mt-0.5 text-lg font-bold text-slate-800">
                  {formatNum(data.metrics.mae, 2)}
                </p>
                <p className="text-xs text-slate-400">{unit}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ForecastTableSection({ result }: { result: MetricResult }) {
  const metricMeta = METRICS.find((m) => m.value === result.metric);
  const MetricIcon = metricMeta?.icon ?? Cpu;
  const unit = metricMeta?.unit ?? "";
  const colors = METRIC_COLORS[result.metric] ?? METRIC_COLORS.CPU;

  if (result.error) return null;
  const { data } = result;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colors.badge}`}>
            <MetricIcon className="h-3 w-3" />
            {result.metric} ({unit})
          </span>
          <h4 className="text-sm font-semibold text-slate-800">
            Tabel Hasil Forecast
          </h4>
          <span className="text-xs text-slate-400">— {data.forecast.length} bulan</span>
        </div>
        <button
          onClick={() => exportForecastCSV(result.metric, unit, data)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
        >
          <Download className="h-3.5 w-3.5" />
          Ekspor CSV
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-100">
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr className="bg-slate-50 text-left">
              <th className="w-8 px-3 py-2.5 text-center font-semibold text-slate-400">#</th>
              <th className="whitespace-nowrap px-4 py-2.5 font-semibold text-slate-600">Bulan</th>
              <th className="whitespace-nowrap px-4 py-2.5 text-right font-semibold text-slate-600">
                Forecast ({unit})
              </th>
              <th className="whitespace-nowrap px-4 py-2.5 text-right font-semibold text-slate-600">
                Batas Bawah CI ({unit})
              </th>
              <th className="whitespace-nowrap px-4 py-2.5 text-right font-semibold text-slate-600">
                Batas Atas CI ({unit})
              </th>
              <th className="whitespace-nowrap px-4 py-2.5 text-right font-semibold text-slate-600">
                Rentang CI ({unit})
              </th>
            </tr>
          </thead>
          <tbody>
            {data.forecast.map((p, idx) => {
              const range =
                p.lower_ci !== null && p.upper_ci !== null
                  ? p.upper_ci - p.lower_ci
                  : null;
              return (
                <tr
                  key={p.date}
                  className={`transition-colors hover:bg-indigo-50/30 ${
                    idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                  }`}
                >
                  <td className="px-3 py-2 text-center text-xs text-slate-400">{idx + 1}</td>
                  <td className="whitespace-nowrap px-4 py-2 font-medium text-slate-700">
                    {new Date(p.date).toLocaleDateString("id-ID", {
                      month: "long",
                      year: "numeric",
                    })}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right font-mono font-semibold text-slate-800">
                    {formatNum(p.value, 2)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right font-mono text-slate-500">
                    {formatNum(p.lower_ci, 2)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right font-mono text-slate-500">
                    {formatNum(p.upper_ci, 2)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right font-mono text-slate-400">
                    {range !== null ? `± ${(range / 2).toFixed(2)}` : "-"}
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

export default function AplikasiPage() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedMetrics, setSelectedMetrics] = useState<Set<string>>(
    new Set(["CPU"]),
  );
  const [forecastYears, setForecastYears] = useState(1);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [results, setResults] = useState<MetricResult[] | null>(null);
  const [activeTab, setActiveTab] = useState<string>("");

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
    if (!file) {
      setGlobalError("Pilih file CSV terlebih dahulu.");
      return;
    }
    if (selectedMetrics.size === 0) {
      setGlobalError("Pilih minimal satu metrik.");
      return;
    }
    setLoading(true);
    setGlobalError(null);
    setResults(null);
    try {
      const metrics = METRICS.filter((m) => selectedMetrics.has(m.value)).map(
        (m) => m.value,
      );
      const res = await postForecastMulti(file, metrics, forecastYears);
      setResults(res);
      const firstSuccess = res.find((r) => !r.error);
      setActiveTab(firstSuccess?.metric ?? res[0].metric);
    } catch {
      setGlobalError("Terjadi kesalahan tak terduga. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  const successCount = results?.filter((r) => !r.error).length ?? 0;
  const errorCount = results?.filter((r) => r.error).length ?? 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Aplikasi Forecasting
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 sm:text-base">
            Unggah data CSV utilisasi, pilih kombinasi metrik, dan jalankan
            prediksi menggunakan ARIMA/SARIMA.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          {/* ── Input Panel ─────────────────────────────── */}
          <div className="space-y-5">
            {/* Upload */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Upload className="h-4 w-4 text-indigo-500" />
                Unggah Data CSV
              </h2>
              <div
                {...getRootProps()}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-7 text-center transition-colors ${
                  isDragActive
                    ? "border-indigo-400 bg-indigo-50"
                    : "border-slate-300 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/50"
                }`}
              >
                <input {...getInputProps()} />
                {file ? (
                  <>
                    <CheckCircle2 className="mb-2 h-8 w-8 text-emerald-500" />
                    <p className="text-sm font-medium text-emerald-700">
                      {file.name}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {(file.size / 1024).toFixed(1)} KB — klik untuk ganti
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="mb-2 h-8 w-8 text-slate-400" />
                    <p className="text-sm font-medium text-slate-700">
                      Seret file CSV ke sini
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      atau klik untuk memilih
                    </p>
                  </>
                )}
              </div>
              <CsvFormatGuide />
            </div>

            {/* Metric Multi-Select */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Activity className="h-4 w-4 text-indigo-500" />
                  Pilih Metrik
                </h2>
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                  {selectedMetrics.size} dipilih
                </span>
              </div>
              <p className="mb-3 text-xs text-slate-500">
                Pilih satu atau lebih metrik. Setiap metrik diproses secara
                terpisah.
              </p>
              <div className="space-y-2">
                {METRICS.map((m) => {
                  const Icon = m.icon;
                  const active = selectedMetrics.has(m.value);
                  const colors = METRIC_COLORS[m.value];
                  return (
                    <button
                      key={m.value}
                      onClick={() => toggleMetric(m.value)}
                      className={`flex w-full items-center gap-3 rounded-lg border px-3.5 py-3 text-left transition-all ${
                        active
                          ? `${colors.badge} border-current shadow-sm`
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          active ? "bg-white/60" : "bg-slate-100"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{m.label}</p>
                        <p className={`text-xs ${active ? "opacity-70" : "text-slate-400"}`}>
                          {m.description}
                        </p>
                      </div>
                      <div
                        className={`h-4 w-4 shrink-0 rounded border-2 transition-all ${
                          active
                            ? "border-current bg-current"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {active && (
                          <svg viewBox="0 0 16 16" fill="none" className="h-full w-full">
                            <path
                              d="M3 8l3.5 3.5L13 5"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Forecast period */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <BarChart3 className="h-4 w-4 text-indigo-500" />
                Periode Prediksi
              </h2>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={forecastYears}
                  onChange={(e) => setForecastYears(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-indigo-600"
                />
                <span className="min-w-[4rem] rounded-lg bg-indigo-50 px-3 py-1.5 text-center text-sm font-bold text-indigo-700">
                  {forecastYears} tahun
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-400">
                {forecastYears * 12} bulan ke depan
              </p>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading || selectedMetrics.size === 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-600/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memproses {selectedMetrics.size} metrik…
                </>
              ) : (
                <>
                  <FlaskConical className="h-4 w-4" />
                  Proses Forecast ({selectedMetrics.size} metrik)
                </>
              )}
            </button>

            {globalError && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {globalError}
              </div>
            )}
          </div>

          {/* ── Results Panel ───────────────────────────── */}
          <div className="space-y-6">
            {!results && !loading && (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/60 py-24 text-center">
                <BarChart3 className="mb-3 h-10 w-10 text-slate-300" />
                <p className="text-sm font-medium text-slate-500">
                  Hasil forecast akan muncul di sini
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Unggah data dan klik &quot;Proses Forecast&quot; untuk memulai
                </p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-24 text-center">
                <Loader2 className="mb-3 h-8 w-8 animate-spin text-indigo-500" />
                <p className="text-sm font-medium text-slate-600">
                  Menjalankan model ARIMA/SARIMA…
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Memproses {selectedMetrics.size} metrik sekaligus, mohon tunggu
                </p>
              </div>
            )}

            {results && !loading && (
              <>
                {/* Summary bar */}
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold">{successCount} metrik</span>{" "}
                    berhasil diproses
                    {errorCount > 0 && (
                      <span className="ml-1 text-red-600">
                        ({errorCount} gagal)
                      </span>
                    )}
                  </p>
                </div>

                {/* Tab navigation */}
                {results.length > 1 && (
                  <div className="flex gap-1.5 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
                    {results.map((r) => {
                      const Icon =
                        METRICS.find((m) => m.value === r.metric)?.icon ?? Cpu;
                      const colors = METRIC_COLORS[r.metric];
                      const isActive = activeTab === r.metric;
                      return (
                        <button
                          key={r.metric}
                          onClick={() => setActiveTab(r.metric)}
                          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                            isActive
                              ? `${colors.badge} shadow-sm`
                              : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {r.metric}
                          {r.error && (
                            <AlertCircle className="h-3 w-3 text-red-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Active result — chart + diagnostics */}
                {results
                  .filter((r) => r.metric === activeTab)
                  .map((r) => (
                    <MetricResultCard key={r.metric} result={r} />
                  ))}

                {/* All forecast tables — always visible */}
                {results.some((r) => !r.error) && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-t border-slate-200 pt-4">
                      <h3 className="text-sm font-semibold text-slate-700">
                        Tabel Hasil Forecast
                      </h3>
                      <span className="text-xs text-slate-400">— semua metrik</span>
                    </div>
                    {results.map((r) => (
                      <ForecastTableSection key={r.metric} result={r} />
                    ))}
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
