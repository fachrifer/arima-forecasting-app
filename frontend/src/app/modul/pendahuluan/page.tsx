import Link from "next/link";
import { ArrowRight } from "lucide-react";

const techStack = [
  { component: "Bahasa", tech: "Python 3.9+", reason: "Dukungan pustaka statistik dan data science terlengkap." },
  { component: "Framework App", tech: "Next.js + FastAPI", reason: "Antarmuka web modern dengan backend API Python yang cepat." },
  { component: "Containerization", tech: "Docker", reason: "Menjamin isolasi lingkungan dan kemudahan distribusi aplikasi." },
  { component: "Model Statistik", tech: "Statsmodels & Pmdarima", reason: "Implementasi ARIMA/SARIMA dengan identifikasi parameter otomatis." },
];

export default function PendahuluanPage() {
  return (
    <div className="prose-custom max-w-4xl">
      <p className="!mb-1 text-sm font-semibold uppercase tracking-wider text-indigo-600">
        BAB I
      </p>
      <h1 className="!mt-0">Pendahuluan</h1>

      <h2 className="border-l-4 border-indigo-500 pl-4">1.1 Latar Belakang Masalah</h2>
      <p>
        Pusat Sistem Informasi dan Teknologi Keuangan (<strong>Pusintek</strong>) memiliki
        peran krusial dalam mengelola infrastruktur virtualisasi VMware yang mendukung
        layanan finansial negara. Selama ini, perencanaan kapasitas di Pusintek masih
        bersifat <em>reaktif</em> dan dilakukan secara manual menggunakan analisis
        sederhana, yang berisiko pada <strong>over-provisioning</strong> (pemborosan
        anggaran) atau <strong>under-provisioning</strong> (gangguan performa sistem).
      </p>
      <p>
        Meskipun data historis dari VMware Aria Operations tersedia melimpah, data
        tersebut belum diolah menjadi wawasan prediktif yang dapat diakses dengan mudah
        oleh tim pengambil keputusan. Oleh karena itu, diperlukan sebuah solusi berupa
        aplikasi peramalan mandiri (<em>self-service</em>) yang mampu melakukan
        forecasting utilisasi CPU, Memori, dan Disk secara proaktif.
      </p>
      <p>
        Metode <strong>ARIMA</strong> dan <strong>SARIMA</strong> dipilih karena
        ketangguhannya dalam menangkap pola tren dan musiman pada data deret waktu tanpa
        memerlukan dataset sebesar metode deep learning.
      </p>

      <h2 className="border-l-4 border-indigo-500 pl-4">1.2 Identifikasi Masalah</h2>
      <div className="space-y-3">
        {[
          {
            title: "Pengelolaan Kapasitas Bersifat Reaktif",
            desc: "Intervensi hanya dilakukan saat utilisasi mendekati ambang batas kritis.",
          },
          {
            title: "Ketergantungan pada Proses Manual",
            desc: "Estimasi kebutuhan sumber daya masih sering dilakukan menggunakan perhitungan subjektif atau alat bantu sederhana yang kurang akurat.",
          },
          {
            title: "Aksesibilitas Alat Analitik",
            desc: "Belum adanya aplikasi terpusat yang memudahkan pengguna dalam melihat proyeksi kapasitas masa depan secara instan.",
          },
          {
            title: "Risiko Inefisiensi Anggaran",
            desc: "Ketidakpastian prediksi kapasitas mengakibatkan kesulitan dalam menyusun rencana pengadaan perangkat keras tahunan yang tepat sasaran.",
          },
        ].map((item, i) => (
          <div key={i} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="!mb-1 font-semibold text-slate-800">
              {i + 1}. {item.title}
            </p>
            <p className="!mb-0 text-sm text-slate-600">{item.desc}</p>
          </div>
        ))}
      </div>

      <h2 className="border-l-4 border-indigo-500 pl-4">1.3 Rumusan Masalah</h2>
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-5">
        <p className="!mb-0 text-indigo-900">
          Bagaimana merancang dan membangun aplikasi forecasting utilisasi sumber daya
          komputasi berbasis Next.js dan Docker yang menerapkan model ARIMA dan SARIMA
          guna menghasilkan prediksi kapasitas CPU, Memori, dan Disk yang akurat serta
          membandingkan performanya dengan metode peramalan standar di Excel untuk
          mendukung perencanaan kapasitas yang proaktif di Pusintek Kementerian Keuangan?
        </p>
      </div>

      <h2 className="border-l-4 border-indigo-500 pl-4">1.4 Batasan Masalah</h2>
      <ul>
        <li><strong>Variabel:</strong> Terbatas pada utilisasi CPU (%), Memori (%), dan Disk (GB/TB).</li>
        <li><strong>Sumber Data:</strong> Data historis 2 tahun terakhir dari VMware Aria Operations dan Laporan ATS.</li>
        <li><strong>Deployment:</strong> Aplikasi dijalankan menggunakan Docker container.</li>
        <li><strong>Lingkup Analisis:</strong> Perbandingan terbatas antara ARIMA/SARIMA dengan peramalan berbasis Exponential Smoothing di Excel.</li>
      </ul>

      <h2 className="border-l-4 border-indigo-500 pl-4">1.5 Evaluasi Model</h2>
      <p>
        Akurasi diukur menggunakan metrik statistik:{" "}
        <strong>Mean Absolute Percentage Error (MAPE)</strong>,{" "}
        <strong>RMSE</strong>, dan <strong>MAE</strong>. Target akurasi adalah nilai
        MAPE &lt; 10% (kategori &quot;Sangat Baik&quot;).
      </p>

      <h2 className="border-l-4 border-indigo-500 pl-4">1.6 Tech Stack</h2>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Komponen</th>
              <th>Teknologi</th>
              <th>Alasan Penggunaan</th>
            </tr>
          </thead>
          <tbody>
            {techStack.map((row) => (
              <tr key={row.component}>
                <td className="font-semibold">{row.component}</td>
                <td><code>{row.tech}</code></td>
                <td>{row.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-10 flex justify-end">
        <Link
          href="/modul/landasan-teori"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white no-underline transition-colors hover:bg-indigo-700"
        >
          Selanjutnya: Landasan Teori
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
