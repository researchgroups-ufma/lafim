/**
 * page.tsx — Página Members (EN)
 *
 * Wrapper fino da rota: delega o conteúdo a MembersPage com locale="en".
 */

import MembersPage from "@/components/pages/MembersPage";
import { pageMetadata } from "@/lib/i18n/seo";

const description = "Research in condensed matter physics, nanomaterials and superconductivity at UFMA.";

export const metadata = pageMetadata("en", "/members", "Members", description);

export default function Page() {
  return <MembersPage locale="en" />;
}
