"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

export default function LandasanTeoriPage() {
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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950">
            <BookOpen className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 dark:text-violet-400">
              BAB II
            </p>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              Landasan Teori
            </h1>
          </div>
        </div>

        <div className="prose-custom space-y-8">

          {/* 2.1 Time Series */}
          <section>
            <h2>2.1 Data Time Series</h2>
            <p>
              <strong>Data time series</strong> adalah kumpulan data yang
              dicatat secara berurutan pada interval waktu yang tetap — misalnya
              setiap jam, hari, bulan, atau tahun. Karakteristik utamanya adalah
              urutan waktu sangat penting; nilai hari ini dipengaruhi oleh nilai
              hari sebelumnya.
            </p>
            <blockquote>
              Analogi: Bayangkan Anda mencatat berat badan Anda setiap pagi
              selama setahun. Kumpulan catatan itu adalah data time series —
              urutan waktunya tidak bisa diacak.
            </blockquote>
            <p>
              Data utilisasi server (CPU, Memory, Storage) adalah contoh
              time series karena nilainya dicatat secara periodik dan memiliki
              pola yang berulang dari waktu ke waktu.
            </p>

            <h3>Komponen Data Time Series</h3>
            <p>
              Setiap data time series umumnya tersusun dari empat komponen:
            </p>
            <table>
              <thead>
                <tr>
                  <th>Komponen</th>
                  <th>Definisi</th>
                  <th>Contoh pada Server</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Trend (T)</strong></td>
                  <td>Kecenderungan naik atau turun jangka panjang</td>
                  <td>Penggunaan storage yang terus meningkat seiring waktu</td>
                </tr>
                <tr>
                  <td><strong>Seasonal (S)</strong></td>
                  <td>Pola berulang pada interval waktu tertentu</td>
                  <td>CPU meningkat setiap akhir bulan karena batch process</td>
                </tr>
                <tr>
                  <td><strong>Cyclic (C)</strong></td>
                  <td>Fluktuasi yang tidak teratur, lebih panjang dari satu musim</td>
                  <td>Lonjakan 2–3 tahun akibat proyek besar</td>
                </tr>
                <tr>
                  <td><strong>Irregular (I)</strong></td>
                  <td>Variasi acak/tak terduga (noise)</td>
                  <td>Spike CPU tiba-tiba karena bug</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* 2.2 Stasioneritas */}
          <section>
            <h2>2.2 Stasioneritas (Stationarity)</h2>
            <p>
              Sebuah data time series dikatakan <strong>stasioner</strong> jika
              sifat statistiknya — yaitu rata-rata (mean), varians, dan
              autokovarians — tidak berubah seiring waktu.
            </p>
            <blockquote>
              Analogi: Bayangkan gelombang laut. Gelombang yang "stasioner"
              punya tinggi rata-rata yang sama sepanjang waktu, tidak semakin
              tinggi atau semakin rendah. Gelombang yang "tidak stasioner" bisa
              semakin tinggi atau berubah pola secara dramatis.
            </blockquote>
            <p>
              Model ARIMA <strong>membutuhkan data yang stasioner</strong>.
              Jika data belum stasioner, perlu dilakukan proses{" "}
              <strong>differencing</strong> — yaitu menghitung selisih antara
              nilai saat ini dan nilai sebelumnya — hingga data menjadi
              stasioner.
            </p>

            <h3>Mengapa Stasioneritas Penting?</h3>
            <p>
              Model statistik seperti ARIMA bekerja dengan asumsi bahwa pola
              data bersifat konsisten. Jika rata-rata terus naik (trend kuat),
              model tidak bisa membuat prediksi yang andal karena tidak tahu
              "di mana" data akan berada di masa depan.
            </p>
          </section>

          {/* 2.3 Uji ADF */}
          <section>
            <h2>2.3 Uji Augmented Dickey-Fuller (ADF)</h2>
            <p>
              Uji ADF adalah uji statistik yang digunakan untuk menentukan
              apakah sebuah time series sudah stasioner atau belum. Uji ini
              menguji hipotesis:
            </p>
            <ul>
              <li>
                <strong>H₀ (Hipotesis Nol):</strong> Data <em>tidak</em>{" "}
                stasioner (ada unit root)
              </li>
              <li>
                <strong>H₁ (Hipotesis Alternatif):</strong> Data stasioner
                (tidak ada unit root)
              </li>
            </ul>
            <p>
              Keputusan diambil berdasarkan <strong>p-value</strong>:
            </p>
            <ul>
              <li>
                Jika <InlineMath math="p \leq 0.05" />: Tolak H₀ →{" "}
                <strong>Data stasioner</strong>
              </li>
              <li>
                Jika <InlineMath math="p > 0.05" />: Gagal tolak H₀ →{" "}
                <strong>Data tidak stasioner</strong>, perlu differencing
              </li>
            </ul>
            <blockquote>
              Analogi: p-value adalah "bukti" melawan hipotesis nol. Semakin
              kecil p-value, semakin kuat bukti bahwa data kita stasioner.
              Ambang batas 0.05 (5%) adalah standar yang paling umum digunakan.
            </blockquote>
          </section>

          {/* 2.4 ARIMA */}
          <section>
            <h2>2.4 Model ARIMA</h2>
            <p>
              ARIMA adalah singkatan dari{" "}
              <strong>
                Auto<em>R</em>egressive <em>I</em>ntegrated <em>M</em>oving{" "}
                <em>A</em>verage
              </strong>
              . Model ini menggabungkan tiga komponen utama untuk memodelkan
              data time series.
            </p>

            <h3>Tiga Komponen ARIMA(p, d, q)</h3>
            <table>
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Nama</th>
                  <th>Penjelasan Sederhana</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>p</strong></td>
                  <td>Autoregressive (AR)</td>
                  <td>
                    Menggunakan p nilai masa lalu untuk memprediksi nilai
                    sekarang. Seperti meramal cuaca hari ini berdasarkan cuaca
                    3 hari lalu.
                  </td>
                </tr>
                <tr>
                  <td><strong>d</strong></td>
                  <td>Integrated (I)</td>
                  <td>
                    Berapa kali differencing dilakukan agar data stasioner.
                    d=1 berarti kita gunakan selisih antar nilai berurutan.
                  </td>
                </tr>
                <tr>
                  <td><strong>q</strong></td>
                  <td>Moving Average (MA)</td>
                  <td>
                    Menggunakan q error prediksi masa lalu untuk koreksi.
                    Seperti belajar dari kesalahan prediksi sebelumnya.
                  </td>
                </tr>
              </tbody>
            </table>

            <h3>Persamaan ARIMA</h3>
            <p>
              Secara matematis, model ARIMA(p,d,q) dapat ditulis sebagai:
            </p>
            <BlockMath math="\phi(B)(1-B)^d y_t = \theta(B)\varepsilon_t" />
            <p>Atau dalam bentuk yang lebih mudah dipahami:</p>
            <BlockMath math="y_t = c + \phi_1 y_{t-1} + \ldots + \phi_p y_{t-p} - \theta_1 \varepsilon_{t-1} - \ldots - \theta_q \varepsilon_{t-q} + \varepsilon_t" />
            <p>Keterangan:</p>
            <ul>
              <li>
                <InlineMath math="y_t" /> = nilai pada waktu t (yang ingin
                diprediksi)
              </li>
              <li>
                <InlineMath math="\phi_i" /> = koefisien AR (pengaruh nilai
                masa lalu)
              </li>
              <li>
                <InlineMath math="\theta_i" /> = koefisien MA (pengaruh error
                masa lalu)
              </li>
              <li>
                <InlineMath math="\varepsilon_t" /> = error (noise) pada waktu t
              </li>
            </ul>
          </section>

          {/* 2.5 SARIMA */}
          <section>
            <h2>2.5 Model SARIMA</h2>
            <p>
              SARIMA (Seasonal ARIMA) adalah perluasan dari ARIMA yang mampu
              menangkap pola musiman (seasonal pattern). Notasinya adalah{" "}
              <strong>SARIMA(p,d,q)(P,D,Q)[m]</strong>.
            </p>
            <table>
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Penjelasan</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>P</strong></td>
                  <td>Seasonal AR — pengaruh nilai pada musim sebelumnya</td>
                </tr>
                <tr>
                  <td><strong>D</strong></td>
                  <td>Seasonal differencing — menghilangkan trend musiman</td>
                </tr>
                <tr>
                  <td><strong>Q</strong></td>
                  <td>Seasonal MA — koreksi error dari musim sebelumnya</td>
                </tr>
                <tr>
                  <td><strong>m</strong></td>
                  <td>
                    Periode musiman — m=12 untuk data bulanan (1 siklus = 12
                    bulan)
                  </td>
                </tr>
              </tbody>
            </table>
            <blockquote>
              Contoh: Jika penggunaan server selalu meningkat setiap bulan
              Desember (karena tutup tahun), SARIMA dengan m=12 akan menangkap
              pola tahunan ini, sedangkan ARIMA biasa tidak bisa.
            </blockquote>
          </section>

          {/* 2.6 Auto ARIMA */}
          <section>
            <h2>2.6 Auto ARIMA</h2>
            <p>
              Menentukan nilai optimal (p, d, q) secara manual membutuhkan
              keahlian statistik yang mendalam. <strong>Auto ARIMA</strong>{" "}
              mengotomatisasi proses ini dengan mencoba berbagai kombinasi
              parameter dan memilih yang terbaik berdasarkan kriteria AIC.
            </p>
            <p>
              Dalam aplikasi ini, Auto ARIMA diimplementasikan menggunakan
              library Python <code>pmdarima</code> dengan fungsi{" "}
              <code>auto_arima()</code>. Proses kerjanya:
            </p>
            <ol>
              <li>Uji stasioneritas dengan ADF test</li>
              <li>Tentukan nilai d (berapa kali differencing dibutuhkan)</li>
              <li>Cari nilai p dan q terbaik dengan grid search</li>
              <li>Uji pola seasonal untuk menentukan P, D, Q, m</li>
              <li>Pilih model dengan AIC terendah</li>
            </ol>
          </section>

          {/* 2.7 AIC */}
          <section>
            <h2>2.7 Akaike Information Criterion (AIC)</h2>
            <p>
              AIC adalah ukuran kualitas model yang menyeimbangkan antara{" "}
              <strong>kebaikan fit</strong> (seberapa baik model menjelaskan
              data) dan <strong>kompleksitas model</strong> (jumlah parameter).
            </p>
            <BlockMath math="\text{AIC} = 2k - 2\ln(\hat{L})" />
            <p>Keterangan:</p>
            <ul>
              <li>
                <InlineMath math="k" /> = jumlah parameter model
              </li>
              <li>
                <InlineMath math="\hat{L}" /> = nilai likelihood maksimum model
              </li>
            </ul>
            <blockquote>
              Prinsipnya: Model yang lebih baik memiliki AIC lebih rendah.
              AIC menghukum model yang terlalu kompleks (terlalu banyak
              parameter) untuk mencegah overfitting.
            </blockquote>
          </section>

          {/* 2.8 Metrik Evaluasi */}
          <section>
            <h2>2.8 Metrik Evaluasi Model</h2>
            <p>
              Setelah model dilatih, kita perlu mengukur seberapa akurat
              prediksinya. Tiga metrik utama yang digunakan:
            </p>

            <h3>MAPE — Mean Absolute Percentage Error</h3>
            <BlockMath math="\text{MAPE} = \frac{1}{n}\sum_{t=1}^{n}\left|\frac{y_t - \hat{y}_t}{y_t}\right| \times 100\%" />
            <p>
              MAPE mengukur rata-rata persentase kesalahan prediksi. Ini adalah
              metrik paling intuitif karena hasilnya dalam persen.
            </p>
            <table>
              <thead>
                <tr>
                  <th>Nilai MAPE</th>
                  <th>Interpretasi</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>&lt; 10%</td>
                  <td>Sangat Baik — prediksi sangat akurat</td>
                </tr>
                <tr>
                  <td>10% – 20%</td>
                  <td>Baik — prediksi cukup andal</td>
                </tr>
                <tr>
                  <td>20% – 50%</td>
                  <td>Wajar — perlu perhatian</td>
                </tr>
                <tr>
                  <td>&gt; 50%</td>
                  <td>Kurang baik — model perlu ditinjau ulang</td>
                </tr>
              </tbody>
            </table>

            <h3>RMSE — Root Mean Squared Error</h3>
            <BlockMath math="\text{RMSE} = \sqrt{\frac{1}{n}\sum_{t=1}^{n}(y_t - \hat{y}_t)^2}" />
            <p>
              RMSE mengukur rata-rata kesalahan dalam satuan yang sama dengan
              data asli. RMSE lebih sensitif terhadap kesalahan besar karena
              menggunakan kuadrat error.
            </p>

            <h3>MAE — Mean Absolute Error</h3>
            <BlockMath math="\text{MAE} = \frac{1}{n}\sum_{t=1}^{n}|y_t - \hat{y}_t|" />
            <p>
              MAE mengukur rata-rata kesalahan absolut. Lebih robust terhadap
              outlier dibanding RMSE karena tidak mengkuadratkan error.
            </p>
          </section>

          {/* 2.9 Confidence Interval */}
          <section>
            <h2>2.9 Interval Kepercayaan (Confidence Interval)</h2>
            <p>
              Setiap nilai forecast disertai dengan{" "}
              <strong>interval kepercayaan 95%</strong> yang menunjukkan
              rentang nilai di mana nilai aktual di masa depan diperkirakan
              akan berada dengan probabilitas 95%.
            </p>
            <blockquote>
              Contoh: Forecast CPU untuk Januari 2026 adalah 72%, dengan CI
              [65%, 79%]. Artinya, kita 95% yakin bahwa nilai aktual CPU
              Januari 2026 akan berada antara 65% dan 79%.
            </blockquote>
            <p>
              Semakin jauh periode prediksi, semakin lebar interval
              kepercayaannya — mencerminkan ketidakpastian yang semakin
              meningkat untuk prediksi jangka panjang.
            </p>
          </section>

        </div>

        <div className="mt-10 flex items-center justify-between">
          <Link href="/modul/pendahuluan" className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-slate-700 no-underline transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-[var(--surface-alt)]">
            <ArrowLeft className="h-4 w-4" />
            Sebelumnya: Pendahuluan
          </Link>
          <Link href="/modul/metodologi" className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white no-underline transition-colors hover:bg-indigo-700">
            Selanjutnya: Metodologi
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
