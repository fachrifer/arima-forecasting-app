import Link from "next/link";
import {
  FileText,
  Lightbulb,
  FlaskConical,
  Layers,
  NotebookPen,
} from "lucide-react";

const chapters = [
  {
    href: "/modul/pendahuluan",
    icon: FileText,
    title: "BAB I: Pendahuluan",
    description:
      "Latar belakang, identifikasi masalah, rumusan masalah, dan batasan penelitian forecasting infrastruktur VMware.",
  },
  {
    href: "/modul/landasan-teori",
    icon: Lightbulb,
    title: "BAB II: Landasan Teori",
    description:
      "Teori ARIMA, SARIMA, uji stasioneritas, metrik evaluasi (MAPE, RMSE, MAE), dan Docker.",
  },
  {
    href: "/modul/metodologi",
    icon: FlaskConical,
    title: "BAB III: Metodologi",
    description:
      "Prosedur pengambilan data, tahapan penelitian, dan pengembangan aplikasi forecasting.",
  },
  {
    href: "/modul/implementasi",
    icon: Layers,
    title: "BAB IV: Implementasi",
    description:
      "Pembangunan aplikasi self-service, arsitektur sistem, dan hasil perbandingan ARIMA vs Excel ETS.",
  },
  {
    href: "/modul/kesimpulan",
    icon: NotebookPen,
    title: "BAB V: Kesimpulan",
    description:
      "Temuan utama penelitian, pencapaian akurasi model, dan saran pengembangan ke depan.",
  },
];

export default function ModulOverviewPage() {
  return (
    <div className="prose-custom max-w-4xl">
      <h1 className="!mt-0">
        Modul Pembelajaran: Forecasting ARIMA &amp; SARIMA
      </h1>

      <p className="text-lg text-slate-600">
        Modul ini membahas teori dan implementasi metode{" "}
        <strong>ARIMA (AutoRegressive Integrated Moving Average)</strong> dan{" "}
        <strong>SARIMA (Seasonal ARIMA)</strong> untuk forecasting penggunaan
        sumber daya infrastruktur TI. Materi disusun berdasarkan penelitian
        skripsi tentang peramalan utilisasi CPU, Memory, dan Disk pada
        infrastruktur VMware di Pusintek Kementerian Keuangan.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {chapters.map(({ href, icon: Icon, title, description }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md no-underline"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-100">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="!mt-0 !mb-1 text-base font-semibold text-slate-900">
              {title}
            </h3>
            <p className="!mb-0 text-sm text-slate-500">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
