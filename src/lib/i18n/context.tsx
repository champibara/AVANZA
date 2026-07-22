"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { dict, type Lang } from "./dictionary";

type I18nCtx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (section: keyof typeof dict.es, key: string) => string;
};

const Ctx = createContext<I18nCtx | null>(null);

function getInitialLang(): Lang {
  if (typeof window === "undefined") return "es";
  const stored = localStorage.getItem("lang");
  if (stored === "es" || stored === "en") return stored;
  return navigator.language?.startsWith("en") ? "en" : "es";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");

  useEffect(() => {
    setLangState(getInitialLang());
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  }, []);

  const t = useCallback(
    (section: keyof typeof dict.es, key: string): string => {
      const s = dict[lang][section] as Record<string, string>;
      return s?.[key] ?? dict.es[section]?.[key as never] ?? key;
    },
    [lang]
  );

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useTranslate() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTranslate must be used within I18nProvider");
  return ctx;
}
