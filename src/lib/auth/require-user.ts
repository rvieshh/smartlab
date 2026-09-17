import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function requireUser(): Promise<User> {
  const supabase = await createClient();
  if (!supabase) redirect("/login");
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");
  return data.user;
}
