"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { SmartLabMark } from "@/components/landing/smartlab-mark";
import { useI18n } from "@/i18n/provider";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      if (!supabase) { setError(t("auth.error.notConfigured")); return; }
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) { setError(t("auth.error.invalid")); return; }
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError(t("auth.error.network"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-language"><LanguageSwitcher /></div>
      <section className="auth-panel" aria-labelledby="login-title">
        <Link className="auth-brand" href="/" aria-label={t("auth.aria.home")}><SmartLabMark size={42} /><span>SmartLab</span></Link>
        <div className="auth-heading"><p className="auth-eyebrow">{t("auth.eyebrow")}</p><h1 id="login-title">{t("auth.title")}</h1><p>{t("auth.description")}</p></div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label><span>{t("auth.email")}</span><input type="email" aria-label={t("auth.email")} autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={loading} /></label>
          <label><span>{t("auth.password")}</span><input type="password" aria-label={t("auth.password")} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required disabled={loading} /></label>
          {error ? <p className="auth-error" role="alert">{error}</p> : null}
          <button className="auth-submit" type="submit" disabled={loading}>{loading ? t("auth.signingIn") : t("auth.login")}</button>
        </form>
        <p className="auth-footnote">{t("auth.footnote")}</p>
      </section>
    </main>
  );
}
