"use client";

import { useI18n } from "@/i18n/provider";

export function LabPreview() {
  const { t } = useI18n();
  const metrics = [
    { label: t("home.preview.temperature"), value: "24.8°C", className: "lab-preview__metric--temperature" },
    { label: t("home.preview.humidity"), value: "62%", className: "lab-preview__metric--humidity" },
    { label: t("home.preview.occupancy"), value: `3 ${t("home.preview.people")}`, className: "lab-preview__metric--occupancy" },
    { label: t("home.preview.power"), value: "2.1 kW", className: "lab-preview__metric--power" },
  ];

  return (
    <div className="lab-preview" role="img" aria-label={t("home.preview.aria")}>
      <div className="lab-preview__metric-wrap">{metrics.map((metric) => <div className={`lab-preview__metric ${metric.className}`} key={metric.label}><span className="lab-preview__metric-label">{metric.label}</span><strong>{metric.value}</strong></div>)}</div>
      <svg className="lab-preview__scene" viewBox="0 0 690 540" fill="none" aria-hidden="true">
        <path d="M111 181 347 59l236 122v202L347 508 111 383V181Z" fill="#171717" stroke="#4A4A4A" strokeWidth="1.2" /><path d="m111 181 236 122 236-122L347 59 111 181Z" fill="#1D1D1D" stroke="#555" strokeWidth="1.2" /><path d="m111 181 236 122v205L111 383V181Z" fill="#111111" stroke="#3D3D3D" strokeWidth="1.2" /><path d="m583 181-236 122v205l236-125V181Z" fill="#151515" stroke="#3D3D3D" strokeWidth="1.2" /><path d="m347 303 236-122M347 303 111 181M347 303v205" stroke="#363636" strokeWidth="1" /><path d="m173 210 174 90 170-89M173 210v94l174 91 170-91v-93" stroke="#303030" strokeWidth="1" />
        <g opacity=".9"><path d="m198 263 75 39v69l-75-39v-69Z" fill="#0A0A0A" stroke="#555" /><path d="m273 302 46-24v69l-46 24v-69Z" fill="#171717" stroke="#555" /><path d="m198 263 46-24 75 39-46 24-75-39Z" fill="#1D1D1D" stroke="#555" /><path d="m212 275 52 27M212 289l52 27M225 269l52 27" stroke="#3F3F3F" /><rect x="230" y="278" width="27" height="14" rx="2" transform="rotate(28 230 278)" fill="#FF6308" opacity=".8" /></g>
        <g opacity=".95"><path d="m376 312 75-39v69l-75 39v-69Z" fill="#0A0A0A" stroke="#555" /><path d="m451 273 46 24v69l-46-24v-69Z" fill="#171717" stroke="#555" /><path d="m376 312 46-24 75 39-46 24-75-39Z" fill="#1D1D1D" stroke="#555" /><path d="m389 325 52-27M389 339l52-27M403 345l52-27" stroke="#3F3F3F" /><rect x="414" y="313" width="27" height="14" rx="2" transform="rotate(-28 414 313)" fill="#FF6308" opacity=".8" /></g>
        <g><path d="m301 360 46-24 46 24v54l-46 25-46-25v-54Z" fill="#171717" stroke="#666" /><path d="m301 360 46 25 46-25M347 385v54" stroke="#454545" /><circle cx="347" cy="376" r="5" fill="#FF6308" /></g><path d="M258 159h178" stroke="#FF6308" strokeWidth="1.5" opacity=".7" /><circle cx="347" cy="159" r="3" fill="#FF6308" /><path d="m347 159-33 95M347 159l34 95" stroke="#FF6308" strokeWidth="1" opacity=".34" /><g fill="#A1A1A1" fontFamily="Geist, sans-serif" fontSize="10" letterSpacing="1.8" opacity=".8"><text x="153" y="191">LAB / 01</text><text x="475" y="191">{t("home.preview.liveNode").toUpperCase()}</text><text x="319" y="474">SMARTLAB</text></g>
      </svg>
      <div className="lab-preview__device-state"><span><i /> {t("home.preview.ac")}</span><b>{t("common.state.on")}</b></div><div className="lab-preview__caption"><span /> {t("home.preview.liveModel")}</div>
    </div>
  );
}
