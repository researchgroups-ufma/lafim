/**
 * page.tsx — Página Research (EN)
 *
 * Wrapper fino da rota: delega o conteúdo a ResearchPage com locale="en".
 */

import ResearchPage from "@/components/pages/ResearchPage";
import { pageMetadata } from "@/lib/i18n/seo";

const description = "Research in condensed matter physics, nanomaterials and superconductivity at UFMA.";

export const metadata = pageMetadata("en", "/research", "Research", description);

export default function Page() {
  return <ResearchPage locale="en" />;
}
