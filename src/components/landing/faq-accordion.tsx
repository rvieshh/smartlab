"use client";

import { useCallback, useState } from "react";
import { useI18n } from "@/i18n/provider";

const faqNumbers = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export function FaqAccordion() {
  const { t } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const toggle = useCallback((index: number) => setOpenIndex((previous) => previous === index ? null : index), []);

  return (
    <div className="faq-list" role="list" aria-label={t("home.faq.aria.list")}>
      {faqNumbers.map((number, index) => {
        const isOpen = openIndex === index;
        const answerId = `faq-answer-${number}`;
        return (
          <div className="faq-item" key={number} role="listitem">
            <button className="faq-item__button" aria-expanded={isOpen} aria-controls={answerId} type="button" onClick={() => toggle(index)}>
              <span>{t(`home.faq.q${number}`)}</span>
              <span className={`faq-item__icon${isOpen ? " faq-item__icon--open" : ""}`} aria-hidden="true">+</span>
            </button>
            <div id={answerId} className={`faq-item__answer${isOpen ? " faq-item__answer--open" : ""}`} role="region" aria-hidden={!isOpen}>
              <p>{t(`home.faq.a${number}`)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
