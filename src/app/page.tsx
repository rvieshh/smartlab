import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";
import { getServerLocale } from "@/i18n/server";
import { translate } from "@/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return { title: translate(locale, "home.meta.title"), description: translate(locale, "home.meta.description") };
}

export default function Home() {
  return <LandingPage />;
}
