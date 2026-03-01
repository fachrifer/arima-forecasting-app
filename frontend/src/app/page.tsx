import Link from "next/link";
import { BarChart3, BookOpen, FlaskConical, ChevronRight } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-700">
            <BarChart3 className="h-4 w-4" />
            ARIMA / SARIMA Forecasting
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Prediksi Utilisasi Server
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Aplikasi berbasis web untuk memprediksi utilisasi CPU, Memory, dan
            Storage server menggunakan model time series ARIMA/SARIMA.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Modul */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
              <BookOpen className="h-5 w-5 text-violet-600" />
            </div>
            <h2 className="mb-2 text-lg font-bold text-slate-900">
              Modul Pembelajaran
            </h2>
            <p className="mb-5 text-sm text-slate-500">
              Pelajari teori dasar time series, konsep ARIMA/SARIMA, dan
              metodologi penelitian secara terstruktur.
            </p>
            <div className="space-y-2">
              <Link
                href="/modul/landasan-teori"
                className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-violet-50 hover:text-violet-700"
              >
                BAB II — Landasan Teori
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href="/modul/metodologi"
                className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-violet-50 hover:text-violet-700"
              >
                BAB III — Metodologi
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Aplikasi */}
          <div className="flex flex-col rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 shadow-lg shadow-indigo-600/20">
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
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-indigo-700 shadow transition-transform hover:scale-[1.02]"
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
