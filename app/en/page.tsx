/**
 * page.tsx — Homepage do site LaFiM (EN)
 *
 * Wrapper fino: o conteúdo real vive em components/pages/HomePage.tsx,
 * compartilhado entre as rotas PT e EN.
 */

import HomePage from "@/components/pages/HomePage";
import { pageMetadata } from "@/lib/i18n/seo";

// title absoluto: evita o title.template ("%s | LaFiM") do layout na home,
// mesmo comportamento da raiz PT.
export const metadata = pageMetadata(
  "en",
  "/",
  { absolute: "LaFiM — Laboratory of Materials Physics" },
  "Research in condensed matter physics, nanomaterials and superconductivity at UFMA."
);

export default function Page() {
  return <HomePage locale="en" />;
}
