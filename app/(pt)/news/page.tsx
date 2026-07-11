/**
 * page.tsx — Página Notícias (PT)
 *
 * Wrapper fino da rota: delega o conteúdo a NewsPage com locale="pt".
 */

import NewsPage from "@/components/pages/NewsPage";
import { siteConfig } from "@/lib/config";
import { pageMetadata } from "@/lib/i18n/seo";

export const metadata = pageMetadata("pt", "/news", "Notícias", siteConfig.description);

export default function Page() {
  return <NewsPage locale="pt" />;
}
