"use client";

import Image from "next/image";
import Link from "next/link";
import { FaqAccordion } from "@/components/landing/faq-accordion";
import { SmartLabMark } from "@/components/landing/smartlab-mark";
import { ArrowIcon } from "@/components/landing/arrow-icon";
import { GithubIcon } from "@/components/landing/github-icon";
import { LabPreview } from "@/components/landing/lab-preview";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useI18n } from "@/i18n/provider";

const githubRepositoryUrl = "https://github.com/rvieshh/smartlab";
const githubProfileUrl = "https://github.com/rvieshh";
const ravisenUrl = "https://ravisen.com";

const featureKeys = ["realtime", "environment", "occupancy", "devices", "history", "analysis"] as const;
const introKeys = ["environmental", "occupancy", "devices", "power", "history", "analysis"] as const;
const compareWithout = [1, 2, 3, 4, 5] as const;
const compareWith = [1, 2, 3, 4, 5] as const;
const pipelineKeys = ["sensors", "connection", "processing", "analysis", "dashboard"] as const;

function CtaButtons() {
  const { t } = useI18n();
  return (
    <div className="landing-actions">
      <Link className="landing-button landing-button--primary" href="/login"><span>{t("home.hero.cta.dashboard")}</span><ArrowIcon /></Link>
      <a className="landing-button landing-button--github" href={githubRepositoryUrl} target="_blank" rel="noreferrer"><GithubIcon /><span>{t("home.hero.cta.repository")}</span></a>
    </div>
  );
}

export function LandingPage() {
  const { t } = useI18n();
  return (
    <main className="landing">
      <header className="landing-header">
        <Link className="landing-brand" href="/" aria-label={t("home.aria.home")}><SmartLabMark size={36} /><span>SmartLab</span></Link>
        <div className="landing-header__actions"><span className="landing-status">{t("home.header.status")}</span><LanguageSwitcher /></div>
      </header>

      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-copy">
          <p className="landing-eyebrow">{t("home.hero.eyebrow")}</p>
          <h1 id="landing-title">{t("home.hero.title")}</h1>
          <p className="landing-description">{t("home.hero.description")}</p>
          <CtaButtons />
        </div>
        <LabPreview />
      </section>

      <section className="landing-section landing-intro" aria-labelledby="intro-title">
        <div className="landing-section__head"><p className="landing-eyebrow">{t("home.intro.eyebrow")}</p><h2 id="intro-title">{t("home.intro.title")}</h2><p className="landing-section__lead">{t("home.intro.lead")}</p></div>
        <ul className="intro-list">{introKeys.map((key) => <li key={key}><span>{t(`home.intro.${key}.label`)}</span><p>{t(`home.intro.${key}.text`)}</p></li>)}</ul>
      </section>

      <section className="landing-section landing-features" aria-labelledby="features-title">
        <div className="landing-section__head"><p className="landing-eyebrow">{t("home.features.eyebrow")}</p><h2 id="features-title">{t("home.features.title")}</h2></div>
        <div className="features-grid">{featureKeys.map((key, index) => <article className="feature-card" key={key}><span className="feature-card__number">{String(index + 1).padStart(2, "0")}</span><h3>{t(`home.features.${key}.title`)}</h3><p>{t(`home.features.${key}.text`)}</p></article>)}</div>
      </section>

      <section className="landing-section landing-compare" aria-labelledby="compare-title">
        <div className="landing-section__head"><p className="landing-eyebrow">{t("home.compare.eyebrow")}</p><h2 id="compare-title">{t("home.compare.title")}</h2></div>
        <div className="compare-grid">
          <div className="compare-column"><h3>{t("home.compare.without.title")}</h3><ul>{compareWithout.map((n) => <li key={n}><span className="compare-column__mark" aria-hidden="true">–</span><span>{t(`home.compare.without.${n}`)}</span></li>)}</ul></div>
          <div className="compare-column compare-column--with"><h3>{t("home.compare.with.title")}</h3><ul>{compareWith.map((n) => <li key={n}><span className="compare-column__mark compare-column__mark--accent" aria-hidden="true">+</span><span>{t(`home.compare.with.${n}`)}</span></li>)}</ul></div>
        </div>
      </section>

      <section className="landing-section landing-pipeline" aria-labelledby="pipeline-title">
        <div className="landing-section__head"><p className="landing-eyebrow">{t("home.pipeline.eyebrow")}</p><h2 id="pipeline-title">{t("home.pipeline.title")}</h2></div>
        <ol className="pipeline-flow">{pipelineKeys.map((key, index) => <li key={key}><span className="pipeline-flow__number">{String(index + 1).padStart(2, "0")}</span><h3>{t(`home.pipeline.${key}.title`)}</h3><p>{t(`home.pipeline.${key}.text`)}</p></li>)}</ol>
      </section>

      <section className="landing-section landing-ai" aria-labelledby="ai-title"><div className="ai-grid"><div className="ai-copy"><p className="landing-eyebrow">{t("home.ai.eyebrow")}</p><h2 id="ai-title">{t("home.ai.title")}</h2><p className="landing-section__lead">{t("home.ai.lead")}</p><p className="ai-note">{t("home.ai.note")}</p></div><div className="ai-card"><header className="ai-card__head"><span className="ai-card__label">{t("home.ai.card.label")}</span><span className="ai-card__badge"><i aria-hidden="true" /> {t("home.ai.card.badge")}</span></header><div className="ai-card__evidence"><div><span>{t("dashboard.anomaly.occupancy")}</span><strong>0 {t("common.units.people")}</strong></div><div><span>{t("dashboard.anomaly.ac")}</span><strong>{t("common.state.on")}</strong></div><div><span>{t("dashboard.anomaly.light")}</span><strong>{t("common.state.on")}</strong></div><div><span>{t("dashboard.anomaly.power")}</span><strong>2.84 kW</strong></div></div><p className="ai-card__finding">{t("home.ai.card.finding")}</p><small className="ai-card__note">{t("home.ai.card.note")}</small></div></div></section>

      <section className="landing-section landing-faq" aria-labelledby="faq-title"><div className="landing-section__head"><p className="landing-eyebrow">{t("home.faq.eyebrow")}</p><h2 id="faq-title">{t("home.faq.title")}</h2></div><FaqAccordion /></section>

      <section className="landing-credits" aria-label={t("home.aria.credits")}><p>{t("home.credits.poweredBy")} <a href={githubProfileUrl} target="_blank" rel="noreferrer">rvieshh</a></p><span className="landing-credits__divider" aria-hidden="true" /><p>{t("home.credits.sponsoredBy")} <a href={ravisenUrl} target="_blank" rel="noreferrer" className="landing-credits__logo"><Image src="/ravisen.webp" alt="Ravisen" width={112} height={26} priority /></a></p></section>
      <footer className="landing-footer">{t("home.footer.copyright")}</footer>
    </main>
  );
}
