import { useT, type T, type Lang } from "@/i18n/translations";

export function getClientLang(): Lang {
  const lang = document.documentElement.lang;
  return lang === "ru" ? "ru" : "en";
}

export function getClientT(): T {
  return useT(getClientLang());
}
