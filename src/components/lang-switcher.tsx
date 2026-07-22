"use client";

import { useTranslate } from "@/lib/i18n/context";
import { Languages } from "lucide-react";

export function LangSwitcher() {
  const { lang, setLang } = useTranslate();

  return (
    <button
      onClick={() => setLang(lang === "es" ? "en" : "es")}
      className="p-2 rounded-xl hover:bg-white/10 transition flex items-center gap-1 text-sm"
      aria-label="Cambiar idioma"
    >
      <Languages className="w-4 h-4" />
      {lang === "es" ? "EN" : "ES"}
    </button>
  );
}
