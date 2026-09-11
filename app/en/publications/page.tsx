/**
 * page.tsx — Página Publications (EN)
 *
 * Wrapper fino da rota: delega o conteúdo a PublicationsPage com locale="en".
 */

import PublicationsPage from "@/components/pages/PublicationsPage";
import { pageMetadata } from "@/lib/i18n/seo";

const description = "A Federal University of Maranhão laboratory dedicated to experimental research in Materials Physics: synthesis of inorganic materials and the study of their properties under extreme conditions of pressure and temperature.";

export const metadata = pageMetadata("en", "/publications", "Publications", description);

export default function Page() {
  return <PublicationsPage locale="en" />;
}
