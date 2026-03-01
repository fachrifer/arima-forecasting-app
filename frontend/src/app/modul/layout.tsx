"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  FileText,
  FlaskConical,
  Layers,
  Lightbulb,
  Menu,
  NotebookPen,
} from "lucide-react";

const sidebarLinks = [
  { href: "/modul", label: "Gambaran Umum", icon: BookOpen },
  { href: "/modul/pendahuluan", label: "BAB I: Pendahuluan", icon: FileText },
  { href: "/modul/landasan-teori", label: "BAB II: Landasan Teori", icon: Lightbulb },
  { href: "/modul/metodologi", label: "BAB III: Metodologi", icon: FlaskConical },
  { href: "/modul/implementasi", label: "BAB IV: Implementasi", icon: Layers },
  { href: "/modul/kesimpulan", label: "BAB V: Kesimpulan", icon: NotebookPen },
];

export default function ModulLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) => pathname === href;

  const currentPage =
    sidebarLinks.find((link) => isActive(link.href))?.label ?? "Modul";

  return (
    <div className="min-h-screen bg-white dark:bg-[var(--background)]">
      {/* Mobile top bar */}
      <div className="sticky top-16 z-40 border-b border-[var(--border)] bg-[var(--surface)] lg:hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          <span className="flex items-center gap-2">
            <Menu className="h-4 w-4" />
            {currentPage}
          </span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${sidebarOpen ? "rotate-180" : ""}`}
          />
        </button>

        {sidebarOpen && (
          <div className="border-t border-[var(--border-light)] bg-[var(--surface)] px-2 py-2">
            {sidebarLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive(href)
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-[var(--surface-alt)] dark:hover:text-slate-200"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mx-auto flex max-w-7xl">
        {/* Desktop sidebar */}
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto border-r border-[var(--border)] bg-[var(--surface)] px-4 py-8">
            <h2 className="mb-6 px-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              Daftar Materi
            </h2>
            <nav className="space-y-1">
              {sidebarLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive(href)
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-[var(--surface-alt)] dark:hover:text-slate-200"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-12 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
