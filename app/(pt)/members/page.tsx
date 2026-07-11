/**
 * page.tsx — Página Membros (PT)
 *
 * Wrapper fino da rota: delega o conteúdo a MembersPage com locale="pt".
 */

import MembersPage from "@/components/pages/MembersPage";
import { siteConfig } from "@/lib/config";
import { pageMetadata } from "@/lib/i18n/seo";

export const metadata = pageMetadata("pt", "/members", "Membros", siteConfig.description);

export default function Page() {
  return <MembersPage locale="pt" />;
}
