/**
 * page.tsx — Página Linhas de Pesquisa (PT)
 *
 * Wrapper fino da rota: delega o conteúdo a ResearchPage com locale="pt".
 */

import ResearchPage from "@/components/pages/ResearchPage";
import { siteConfig } from "@/lib/config";
import { pageMetadata } from "@/lib/i18n/seo";

export const metadata = pageMetadata("pt", "/research", "Pesquisa", siteConfig.description);

export default function Page() {
  return <ResearchPage locale="pt" />;
}
