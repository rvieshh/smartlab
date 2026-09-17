"use client";

import { useI18n } from "@/i18n/provider";

export function LoadingState() {
  const { t } = useI18n();
  return <div className="data-state data-state--loading" role="status">{t("common.states.loading")}</div>;
}

export function ErrorState({ reset }: { reset?: () => void }) {
  const { t } = useI18n();
  return <div className="data-state" role="alert"><p>{t("common.states.error")}</p>{reset ? <button className="table-action" type="button" onClick={reset}>{t("common.actions.refresh")}</button> : null}</div>;
}
