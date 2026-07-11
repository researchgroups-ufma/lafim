/**
 * index.ts — Ponto de entrada do módulo de i18n
 *
 * Reexporta o dicionário e expõe os helpers `getDictionary` (busca as
 * strings de UI de um idioma) e `localizeHref` (prefixa uma URL interna
 * com o segmento de idioma quando necessário).
 */

export * from "./dictionaries";

import { dictionaries, type Locale } from "./dictionaries";

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

// localizeHref("/research", "en") -> "/en/research"; ("/", "en") -> "/en"
export function localizeHref(href: string, locale: Locale): string {
  if (locale === "pt") return href;
  return href === "/" ? "/en" : `/en${href}`;
}
