"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Upload, Settings2, Cpu, TrendingUp, BarChart3, Eye } from "lucide-react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import python from "react-syntax-highlighter/dist/esm/languages/hljs/python";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";

SyntaxHighlighter.registerLanguage("python", python);

const workflowSteps = [
  { icon: Upload, title: "Upload CSV", description: "Pengguna mengunggah file CSV berisi data time series." },
  { icon: Settings2, title: "Validasi & Preprocessing", description: "Backend memvalidasi format, menangani missing values, dan menyiapkan data." },
  { icon: Cpu, title: "Fitting Model", description: "auto_arima mencari kombinasi parameter (p,d,q) optimal secara otomatis." },
  { icon: TrendingUp, title: "Generate Forecast", description: "Model menghasilkan prediksi beserta confidence interval." },
  { icon: BarChart3, title: "Hitung Metrik", description: "MAPE, RMSE, dan MAE dihitung untuk evaluasi akurasi model." },
  { icon: Eye, title: "Visualisasi Hasil", description: "Hasil dikembalikan ke frontend dan ditampilkan dalam grafik interaktif." },
];

const coreCode = `import pmdarima as pm
import pandas as pd

# Baca data time series
df = pd.read_csv("data.csv", parse_dates=["Tanggal"])
df.set_index("Tanggal", inplace=True)

# Auto ARIMA - pencarian parameter optimal
model = pm.auto_arima(
    df["CPU"],
    seasonal=True,
    m=12,                 # periode musiman (bulanan)
    stepwise=True,
    suppress_warnings=True,
    error_action="ignore",
)

# Forecast 24 bulan ke depan dengan confidence interval
forecast, conf_int = model.predict(
    n_periods=24,
    return_conf_int=True,
    alpha=0.05,           # 95% confidence interval
)

print(f"Model terbaik: {model.order} x {model.seasonal_order}")
print(f"AIC: {model.aic():.2f}")`;

export default function ImplementasiPage() {
  return (
    <div className="prose-custom max-w-4xl">
      <p className="!mb-1 text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">BAB IV</p>
      <h1 className="!mt-0">Implementasi dan Hasil</h1>

      <h2 className="border-l-4 border-indigo-500 pl-4">4.1 Pembuatan Aplikasi</h2>
      <p>
        Aplikasi forecasting yang dikembangkan bersifat <strong>self-service</strong>,
        memungkinkan administrator infrastruktur untuk melakukan peramalan secara mandiri
        tanpa memerlukan keahlian pemrograman atau statistik lanjutan. Pengguna cukup
        mengunggah file CSV berisi data historis, dan aplikasi akan secara otomatis:
      </p>
      <ul>
        <li>Memvalidasi dan memproses data input.</li>
        <li>Menjalankan <code>auto_arima</code> untuk menentukan model terbaik.</li>
        <li>Menghasilkan forecasting beserta confidence interval.</li>
        <li>Menghitung metrik evaluasi (MAPE, RMSE, MAE).</li>
        <li>Menampilkan hasil dalam bentuk grafik interaktif.</li>
      </ul>

      <h2 className="border-l-4 border-indigo-500 pl-4">4.2 Arsitektur Aplikasi</h2>
      <table>
        <thead>
          <tr><th>Layer</th><th>Teknologi</th><th>Fungsi</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>Frontend</td>
            <td>Next.js (React, TypeScript)</td>
            <td>Antarmuka pengguna, upload file, visualisasi chart, modul pembelajaran</td>
          </tr>
          <tr>
            <td>Backend</td>
            <td>FastAPI (Python)</td>
            <td>API endpoint, pemrosesan data, pemodelan ARIMA/SARIMA, komputasi metrik</td>
          </tr>
          <tr>
            <td>Container</td>
            <td>Docker &amp; Docker Compose</td>
            <td>Orkestrasi multi-container, isolasi environment</td>
          </tr>
        </tbody>
      </table>

      <h2 className="border-l-4 border-indigo-500 pl-4">4.3 Alur Kerja Aplikasi</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {workflowSteps.map(({ icon: Icon, title, description }, idx) => (
          <div key={idx} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {idx + 1}
              </span>
              <Icon className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
            </div>
            <h3 className="!mt-0 !mb-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
            <p className="!mb-0 text-sm text-slate-500 dark:text-slate-400">{description}</p>
          </div>
        ))}
      </div>

      <h2 className="border-l-4 border-indigo-500 pl-4">Contoh Kode: Auto ARIMA</h2>
      <div className="overflow-hidden rounded-xl border border-slate-700">
        <SyntaxHighlighter
          language="python"
          style={atomOneDark}
          customStyle={{ margin: 0, padding: "1.25rem", fontSize: "0.875rem", lineHeight: "1.6", borderRadius: 0 }}
        >
          {coreCode}
        </SyntaxHighlighter>
      </div>

      <h2 className="border-l-4 border-indigo-500 pl-4">4.4 Hasil Perbandingan</h2>
      <p>
        Hasil perbandingan forecasting antara aplikasi (ARIMA/SARIMA) dengan Excel
        FORECAST.ETS menunjukkan keunggulan signifikan:
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border-2 border-indigo-400 bg-indigo-50 p-6 text-center dark:border-indigo-600 dark:bg-indigo-950">
          <p className="!mb-1 text-sm font-medium text-indigo-600 dark:text-indigo-400">ARIMA/SARIMA (Aplikasi)</p>
          <p className="!mb-1 text-4xl font-bold text-indigo-700 dark:text-indigo-300">4,5%</p>
          <p className="!mb-0 text-sm text-indigo-600 dark:text-indigo-400">MAPE — Sangat Baik</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
          <p className="!mb-1 text-sm font-medium text-slate-500 dark:text-slate-400">Excel FORECAST.ETS</p>
          <p className="!mb-1 text-4xl font-bold text-slate-700 dark:text-slate-200">12,8%</p>
          <p className="!mb-0 text-sm text-slate-500 dark:text-slate-400">MAPE — Baik</p>
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 p-6 dark:border-indigo-800 dark:bg-indigo-950">
        <p className="!mb-0 font-medium text-indigo-900 dark:text-indigo-200">
          Model ARIMA/SARIMA mencapai akurasi <strong>2,8x lebih baik</strong> dibandingkan
          Excel ETS, dengan MAPE jauh di bawah target 10%.
        </p>
      </div>

      <div className="mt-10 flex items-center justify-between">
        <Link href="/modul/metodologi" className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-slate-700 no-underline transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-[var(--surface-alt)]">
          <ArrowLeft className="h-4 w-4" />
          Sebelumnya
        </Link>
        <Link href="/modul/kesimpulan" className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white no-underline transition-colors hover:bg-indigo-700">
          Selanjutnya: Kesimpulan
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
