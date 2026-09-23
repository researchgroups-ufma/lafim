/**
 * page.tsx — Página Research (EN)
 *
 * Wrapper fino da rota: delega o conteúdo a ResearchPage com locale="en".
 */

import ResearchPage from "@/components/pages/ResearchPage";
import { pageMetadata } from "@/lib/i18n/seo";

const description = "A Federal University of Maranhão laboratory dedicated to experimental research in Materials Physics: synthesis of inorganic materials and the study of their properties under extreme conditions of pressure and temperature.";

export const metadata = pageMetadata("en", "/research", "Research", description);

export default function Page() {
  return <ResearchPage locale="en" />;
}
