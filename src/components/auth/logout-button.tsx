"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/i18n/provider";

export function LogoutButton() {
  const router = useRouter();
  const { t } = useI18n();

  async function handleLogout() {
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return <button className="logout-button" type="button" onClick={handleLogout}>{t("common.actions.logout")}</button>;
}
