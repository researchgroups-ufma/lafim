/**
 * page.tsx — Página Sobre (PT)
 *
 * Wrapper fino da rota: delega o conteúdo a AboutPage com locale="pt".
 */

import AboutPage from "@/components/pages/AboutPage";
import { siteConfig } from "@/lib/config";
import { pageMetadata } from "@/lib/i18n/seo";

export const metadata = pageMetadata("pt", "/about", "Sobre", siteConfig.description);

export default function Page() {
  return <AboutPage locale="pt" />;
}
