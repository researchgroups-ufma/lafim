/**
 * seo.ts — Helper de metadata por rota (hreflang + canonical)
 *
 * `pageMetadata` monta o objeto `alternates` (canonical + hreflang cruzado
 * pt-BR/en/x-default) de uma rota a partir do seu caminho canônico PT,
 * evitando repetir a lógica de `localizeHref` em cada wrapper de página.
 */

import type { Metadata } from "next";
import { type Locale, localizeHref } from "@/lib/i18n";

/**
 * Monta `title`/`description`/`alternates` de uma página para o `locale`
 * dado. `pathPt` é o caminho canônico PT da rota (ex.: "/research"; raiz
 * é "/"); o helper deriva o caminho EN correspondente via `localizeHref`.
 */
export function pageMetadata(
  locale: Locale,
  pathPt: string,
  title: Metadata["title"],
  description?: string
): Metadata {
  const en = localizeHref(pathPt, "en");
  const self = locale === "en" ? en : pathPt;
  return {
    title,
    description,
    alternates: {
      canonical: self,
      languages: { "pt-BR": pathPt, en, "x-default": pathPt },
    },
  };
}
