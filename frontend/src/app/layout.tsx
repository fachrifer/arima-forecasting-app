import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aplikasi Forecasting ARIMA/SARIMA",
  description:
    "Aplikasi prediksi utilisasi server menggunakan model ARIMA/SARIMA berbasis data historis CSV.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
