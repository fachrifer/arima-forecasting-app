import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Target, Container, Wifi, BrainCircuit } from "lucide-react";

const findings = [
  {
    icon: CheckCircle2,
    title: "Keandalan Aplikasi",
    description: "Aplikasi forecasting self-service berhasil dibangun dan mampu digunakan secara mandiri oleh administrator infrastruktur. Pengguna cukup mengunggah file CSV dan aplikasi secara otomatis menentukan model terbaik serta menghasilkan prediksi.",
  },
  {
    icon: Target,
    title: "Akurasi Model",
    description: "Model ARIMA/SARIMA mencapai MAPE < 5%, jauh melampaui target 10% dan mengungguli Excel FORECAST.ETS yang memiliki MAPE 12,8%. Ini membuktikan efektivitas metode ARIMA/SARIMA untuk peramalan utilisasi sumber daya TI.",
  },
  {
    icon: Container,
    title: "Efisiensi Deployment",
    description: "Penggunaan Docker memastikan konsistensi deployment di berbagai lingkungan. Aplikasi dapat di-deploy dengan satu perintah docker compose up, menghilangkan masalah perbedaan konfigurasi antar environment.",
  },
];

const suggestions = [
  {
    icon: Wifi,
    title: "Integrasi API Real-Time",
    description: "Mengintegrasikan aplikasi secara langsung dengan API VMware Aria Operations untuk mengambil data monitoring secara real-time, sehingga tidak perlu lagi melakukan ekspor CSV secara manual.",
  },
  {
    icon: BrainCircuit,
    title: "Model Hybrid ARIMA-LSTM",
    description: "Mengembangkan model hybrid yang menggabungkan ARIMA untuk komponen linier dengan LSTM (Long Short-Term Memory) untuk menangkap pola non-linier yang lebih kompleks, guna meningkatkan akurasi prediksi.",
  },
];

export default function KesimpulanPage() {
  return (
    <div className="prose-custom max-w-4xl">
      <p className="!mb-1 text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">BAB V</p>
      <h1 className="!mt-0">Kesimpulan dan Saran</h1>

      <h2 className="border-l-4 border-indigo-500 pl-4">5.1 Kesimpulan</h2>
      <p>Berdasarkan hasil penelitian dan implementasi yang telah dilakukan, dapat disimpulkan tiga temuan utama berikut:</p>

      <div className="mt-4 space-y-4">
        {findings.map(({ icon: Icon, title, description }, idx) => (
          <div key={idx} className="flex gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50 dark:bg-green-950">
              <Icon className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="!mt-0 !mb-1 text-base font-semibold text-slate-900 dark:text-slate-100">{idx + 1}. {title}</h3>
              <p className="!mb-0 text-sm text-slate-600 dark:text-slate-400">{description}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="border-l-4 border-indigo-500 pl-4">5.2 Saran</h2>
      <p>Untuk pengembangan lebih lanjut, penelitian ini merekomendasikan dua arah pengembangan:</p>

      <div className="mt-4 space-y-4">
        {suggestions.map(({ icon: Icon, title, description }, idx) => (
          <div key={idx} className="flex gap-4 rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-950">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900">
              <Icon className="h-5 w-5 text-amber-700 dark:text-amber-300" />
            </div>
            <div>
              <h3 className="!mt-0 !mb-1 text-base font-semibold text-amber-900 dark:text-amber-200">{idx + 1}. {title}</h3>
              <p className="!mb-0 text-sm text-amber-800 dark:text-amber-300">{description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between">
        <Link href="/modul/implementasi" className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-slate-700 no-underline transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-[var(--surface-alt)]">
          <ArrowLeft className="h-4 w-4" />
          Sebelumnya
        </Link>
        <Link href="/aplikasi" className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white no-underline transition-colors hover:bg-indigo-700">
          Coba Aplikasi
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
