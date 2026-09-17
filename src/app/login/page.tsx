import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getServerLocale } from "@/i18n/server";
import { translate } from "@/i18n";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return { title: translate(locale, "auth.meta.title") };
}

export default async function LoginPage() {
  const supabase = await createClient();
  if (supabase) {
    const { data } = await supabase.auth.getUser();
    if (data.user) redirect("/dashboard");
  }
  return <LoginForm />;
}
