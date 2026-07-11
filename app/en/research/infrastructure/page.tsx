/**
 * page.tsx — Página Infrastructure (EN)
 *
 * Rota: /en/research/infrastructure
 *
 * Wrapper fino da rota: delega o conteúdo a InfrastructurePage com locale="en".
 */

import InfrastructurePage from "@/components/pages/InfrastructurePage";
import { pageMetadata } from "@/lib/i18n/seo";

const description = "Research in condensed matter physics, nanomaterials and superconductivity at UFMA.";

export const metadata = pageMetadata("en", "/research/infrastructure", "Infrastructure", description);

export default function Page() {
  return <InfrastructurePage locale="en" />;
}
