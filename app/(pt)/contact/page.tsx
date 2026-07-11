/**
 * page.tsx — Página Contato (PT)
 *
 * Wrapper fino da rota: delega o conteúdo a ContactPage com locale="pt".
 */

import ContactPage from "@/components/pages/ContactPage";
import { siteConfig } from "@/lib/config";
import { pageMetadata } from "@/lib/i18n/seo";

export const metadata = pageMetadata("pt", "/contact", "Contato", siteConfig.description);

export default function Page() {
  return <ContactPage locale="pt" />;
}
