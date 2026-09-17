import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getServerLocale } from "@/i18n/server";
import { I18nProvider } from "@/i18n/provider";
import "./globals.css";
import "./landing.css";
import "./landing-sections.css";
import "./auth.css";
import "./dashboard.css";
import "./history.css";
import "./devices.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "SmartLab — IoT Laboratory Monitoring",
  description: "SmartLab combines IoT and AI analysis for laboratory monitoring.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getServerLocale();
  return (
    <html lang={locale} className={`${geist.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body><I18nProvider initialLocale={locale}>{children}</I18nProvider></body>
    </html>
  );
}
