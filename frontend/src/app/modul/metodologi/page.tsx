"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, ClipboardList } from "lucide-react";

export default function MetodologiPage() {
  return (
    <div>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {/* Back */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Beranda
        </Link>

        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950">
            <ClipboardList className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
              BAB III
            </p>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              Metodologi Penelitian
            </h1>
          </div>
        </div>

        <div className="prose-custom space-y-6">
          <section>
            <h2>3.1 Jenis Penelitian</h2>
            <p>
              Penelitian ini menggunakan pendekatan kuantitatif berbasis data
              historis utilisasi server. Model yang dibangun termasuk dalam
              kategori penelitian terapan (applied research) dengan tujuan
              menghasilkan sistem yang dapat langsung digunakan untuk pengambilan
              keputusan kapasitas infrastruktur.
            </p>
          </section>

          <section>
            <h2>3.2 Data dan Sumber Data</h2>
            <p>
              Data yang digunakan adalah data time series utilisasi server yang
              meliputi tiga metrik utama:
            </p>
            <ul>
              <li>
                <strong>CPU Utilization</strong> — persentase penggunaan prosesor
                (0–100%)
              </li>
              <li>
                <strong>Memory Utilization</strong> — penggunaan memori dalam
                satuan GB atau TB
              </li>
              <li>
                <strong>Storage Utilization</strong> — penggunaan disk dalam
                satuan GB atau TB
              </li>
            </ul>
            <p>
              Data dikumpulkan secara periodik (bulanan) dan disimpan dalam
              format CSV dengan kolom: Tanggal, CPU, Memory, Storage. Minimal
              24 data historis diperlukan untuk menghasilkan model yang andal.
            </p>
          </section>

          <section>
            <h2>3.3 Tahapan Penelitian</h2>
            <p>
              Penelitian dilakukan melalui tahapan sistematis berikut:
            </p>

            <h3>Tahap 1 — Pengumpulan dan Persiapan Data</h3>
            <p>
              Data historis utilisasi server dikumpulkan dari sistem monitoring.
              Data kemudian dibersihkan dari nilai kosong atau anomali, dan
              diformat sesuai kebutuhan input model (format CSV).
            </p>

            <h3>Tahap 2 — Analisis Stasioneritas</h3>
            <p>
              Uji Augmented Dickey-Fuller (ADF) dilakukan untuk menguji apakah
              data sudah stasioner. Jika tidak stasioner, dilakukan differencing
              (pengurangan antar selisih nilai berurutan) hingga data menjadi
              stasioner.
            </p>

            <h3>Tahap 3 — Identifikasi dan Pemilihan Model</h3>
            <p>
              Menggunakan library <code>pmdarima</code> dengan fungsi{" "}
              <code>auto_arima</code>, sistem secara otomatis melakukan pencarian
              parameter ARIMA (p, d, q) dan SARIMA (P, D, Q, m) terbaik
              berdasarkan nilai AIC (Akaike Information Criterion) terendah.
            </p>

            <h3>Tahap 4 — Pelatihan Model</h3>
            <p>
              Model ARIMA/SARIMA terpilih dilatih menggunakan seluruh data
              historis yang tersedia. Evaluasi model dilakukan menggunakan
              metrik MAPE, RMSE, dan MAE untuk mengukur akurasi prediksi pada
              data historis (in-sample).
            </p>

            <h3>Tahap 5 — Forecasting</h3>
            <p>
              Setelah model terlatih, dilakukan prediksi ke depan (out-of-sample
              forecast) sesuai periode yang ditentukan pengguna (1–5 tahun).
              Setiap prediksi dilengkapi dengan confidence interval 95%.
            </p>

            <h3>Tahap 6 — Visualisasi dan Pelaporan</h3>
            <p>
              Hasil forecast ditampilkan dalam bentuk grafik interaktif, tabel
              lengkap, dan dapat diekspor dalam format CSV atau PDF untuk
              keperluan pelaporan.
            </p>
          </section>

          <section>
            <h2>3.4 Arsitektur Sistem</h2>
            <p>
              Sistem dibangun menggunakan arsitektur client-server dua lapis:
            </p>
            <table>
              <thead>
                <tr>
                  <th>Komponen</th>
                  <th>Teknologi</th>
                  <th>Fungsi</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Frontend</td>
                  <td>Next.js 16 + TypeScript</td>
                  <td>Antarmuka pengguna, visualisasi, ekspor</td>
                </tr>
                <tr>
                  <td>Backend</td>
                  <td>FastAPI (Python)</td>
                  <td>API endpoint, running ARIMA engine</td>
                </tr>
                <tr>
                  <td>Model Engine</td>
                  <td>pmdarima + statsmodels</td>
                  <td>Auto ARIMA, forecasting, evaluasi</td>
                </tr>
                <tr>
                  <td>Deployment</td>
                  <td>Docker + Docker Compose</td>
                  <td>Containerisasi dan orkestrasi</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2>3.5 Evaluasi Model</h2>
            <p>
              Kualitas model diukur menggunakan tiga metrik evaluasi standar:
            </p>
            <table>
              <thead>
                <tr>
                  <th>Metrik</th>
                  <th>Formula</th>
                  <th>Interpretasi</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>MAPE</td>
                  <td>Mean Absolute Percentage Error</td>
                  <td>&lt;10%: Sangat Baik, &lt;20%: Baik</td>
                </tr>
                <tr>
                  <td>RMSE</td>
                  <td>Root Mean Squared Error</td>
                  <td>Semakin kecil semakin baik</td>
                </tr>
                <tr>
                  <td>MAE</td>
                  <td>Mean Absolute Error</td>
                  <td>Semakin kecil semakin baik</td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>

        <div className="mt-10 flex items-center justify-between">
          <Link href="/modul/landasan-teori" className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-slate-700 no-underline transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-[var(--surface-alt)]">
            <ArrowLeft className="h-4 w-4" />
            Sebelumnya: Landasan Teori
          </Link>
          <Link href="/modul/implementasi" className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white no-underline transition-colors hover:bg-indigo-700">
            Selanjutnya: Implementasi
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
