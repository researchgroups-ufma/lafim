/**
 * page.tsx — Homepage do site LaFiM (branch lafim-design)
 *
 * Wrapper fino: o conteúdo real vive em components/pages/HomePage.tsx,
 * compartilhado entre as rotas PT e EN.
 */

import HomePage from "@/components/pages/HomePage";
import { siteConfig } from "@/lib/config";
import { pageMetadata } from "@/lib/i18n/seo";

// title absoluto: evita o title.template ("%s | LaFiM") do layout na home,
// preservando o comportamento atual (aba mostra só o nome do laboratório).
export const metadata = pageMetadata(
  "pt",
  "/",
  { absolute: `${siteConfig.acronym} — ${siteConfig.university}` },
  siteConfig.description
);

export default function Page() {
  return <HomePage locale="pt" />;
}
