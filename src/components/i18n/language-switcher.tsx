"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useI18n } from "@/i18n/provider";

const options = ["en", "id"] as const;

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const close = useCallback((focusTrigger = true) => {
    setOpen(false);
    if (focusTrigger) buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    function handlePointer(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) close(false);
    }
    document.addEventListener("pointerdown", handlePointer);
    return () => document.removeEventListener("pointerdown", handlePointer);
  }, [open, close]);

  function select(option: (typeof options)[number]) {
    setLocale(option);
    close();
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (!open) {
      if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % options.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index + options.length - 1) % options.length);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(options.length - 1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      select(options[activeIndex]);
    }
  }

  return (
    <div className="language-switcher" ref={containerRef} onKeyDown={handleKeyDown}>
      <button
        ref={buttonRef}
        className="language-switcher__trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("common.language.label")}
        onClick={() => setOpen((value) => !value)}
      >
        <span>{locale.toUpperCase()}</span>
        <ChevronDown aria-hidden="true" size={13} />
      </button>
      {open ? (
        <div className="language-switcher__menu" role="listbox" aria-label={t("common.language.label")}>
          {options.map((option, index) => (
            <button
              key={option}
              role="option"
              tabIndex={index === activeIndex ? 0 : -1}
              aria-selected={locale === option}
              className={locale === option ? "language-switcher__option language-switcher__option--active" : "language-switcher__option"}
              type="button"
              onMouseEnter={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
              onClick={() => select(option)}
            >
              {option === "en" ? t("common.language.english") : t("common.language.indonesian")}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
