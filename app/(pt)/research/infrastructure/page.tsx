/**
 * page.tsx — Página Infraestrutura (PT)
 *
 * Rota: /research/infrastructure
 *
 * Wrapper fino da rota: delega o conteúdo a InfrastructurePage com locale="pt".
 */

import InfrastructurePage from "@/components/pages/InfrastructurePage";
import { siteConfig } from "@/lib/config";
import { pageMetadata } from "@/lib/i18n/seo";

export const metadata = pageMetadata("pt", "/research/infrastructure", "Infraestrutura", siteConfig.description);

export default function Page() {
  return <InfrastructurePage locale="pt" />;
}
