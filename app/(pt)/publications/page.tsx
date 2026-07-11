/**
 * page.tsx — Página Publicações (PT)
 *
 * Wrapper fino da rota: delega o conteúdo a PublicationsPage com locale="pt".
 */

import PublicationsPage from "@/components/pages/PublicationsPage";
import { siteConfig } from "@/lib/config";
import { pageMetadata } from "@/lib/i18n/seo";

export const metadata = pageMetadata("pt", "/publications", "Publicações", siteConfig.description);

export default function Page() {
  return <PublicationsPage locale="pt" />;
}
