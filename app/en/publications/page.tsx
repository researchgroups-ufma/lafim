/**
 * page.tsx — Página Publications (EN)
 *
 * Wrapper fino da rota: delega o conteúdo a PublicationsPage com locale="en".
 */

import PublicationsPage from "@/components/pages/PublicationsPage";
import { pageMetadata } from "@/lib/i18n/seo";

const description = "Research in condensed matter physics, nanomaterials and superconductivity at UFMA.";

export const metadata = pageMetadata("en", "/publications", "Publications", description);

export default function Page() {
  return <PublicationsPage locale="en" />;
}
