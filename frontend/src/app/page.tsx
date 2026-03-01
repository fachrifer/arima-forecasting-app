import Link from "next/link";
import { BarChart3, BookOpen, FlaskConical, ChevronRight } from "lucide-react";

const includeModul = process.env.NEXT_PUBLIC_INCLUDE_MODUL === "true";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[var(--background)]">
      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            <BarChart3 className="h-4 w-4" />
            ARIMA / SARIMA Forecasting
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl dark:text-slate-100">
            Prediksi Utilisasi Server
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
            Aplikasi berbasis web untuk memprediksi utilisasi CPU, Memory, dan
            Storage server menggunakan model time series ARIMA/SARIMA.
          </p>
        </div>

        {/* Cards */}
        <div className={`grid gap-6 ${includeModul ? "sm:grid-cols-2" : "max-w-lg mx-auto"}`}>
          {/* Modul — only shown when built with NEXT_PUBLIC_INCLUDE_MODUL=true */}
          {includeModul && (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950">
                <BookOpen className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <h2 className="mb-2 text-lg font-bold text-slate-900 dark:text-slate-100">
                Modul Pembelajaran
              </h2>
              <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
                Pelajari teori dasar time series, konsep ARIMA/SARIMA, dan
                metodologi penelitian secara terstruktur.
              </p>
              <div className="space-y-2">
                <Link
                  href="/modul/landasan-teori"
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-violet-50 hover:text-violet-700 dark:bg-[var(--surface-alt)] dark:text-slate-300 dark:hover:bg-violet-950 dark:hover:text-violet-300"
                >
                  BAB II — Landasan Teori
                  <ChevronRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/modul/metodologi"
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-violet-50 hover:text-violet-700 dark:bg-[var(--surface-alt)] dark:text-slate-300 dark:hover:bg-violet-950 dark:hover:text-violet-300"
                >
                  BAB III — Metodologi
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Aplikasi */}
          <div className="flex flex-col rounded-2xl border border-indigo-200 bg-indigo-600 p-6 shadow-lg shadow-indigo-600/20 dark:border-indigo-800 dark:bg-indigo-700 dark:shadow-indigo-900/30">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <FlaskConical className="h-5 w-5 text-white" />
            </div>
            <h2 className="mb-2 text-lg font-bold text-white">
              Aplikasi Forecasting
            </h2>
            <p className="mb-6 flex-1 text-sm text-indigo-100">
              Upload data CSV utilisasi server, pilih metrik (CPU, Memory,
              Storage), dan dapatkan prediksi dengan model ARIMA/SARIMA otomatis.
            </p>
            <Link
              href="/aplikasi"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-indigo-700 shadow transition-transform hover:scale-[1.02] dark:bg-slate-100"
            >
              <FlaskConical className="h-4 w-4" />
              Buka Aplikasi
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
