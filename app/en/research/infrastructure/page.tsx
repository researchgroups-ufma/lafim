/**
 * page.tsx — Página Infrastructure (EN)
 *
 * Rota: /en/research/infrastructure
 *
 * Wrapper fino da rota: delega o conteúdo a InfrastructurePage com locale="en".
 */

import InfrastructurePage from "@/components/pages/InfrastructurePage";
import { pageMetadata } from "@/lib/i18n/seo";

const description = "A Federal University of Maranhão laboratory dedicated to experimental research in Materials Physics: synthesis of inorganic materials and the study of their properties under extreme conditions of pressure and temperature.";

export const metadata = pageMetadata("en", "/research/infrastructure", "Infrastructure", description);

export default function Page() {
  return <InfrastructurePage locale="en" />;
}
