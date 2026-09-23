/**
 * page.tsx — Página Members (EN)
 *
 * Wrapper fino da rota: delega o conteúdo a MembersPage com locale="en".
 */

import MembersPage from "@/components/pages/MembersPage";
import { pageMetadata } from "@/lib/i18n/seo";

const description = "A Federal University of Maranhão laboratory dedicated to experimental research in Materials Physics: synthesis of inorganic materials and the study of their properties under extreme conditions of pressure and temperature.";

export const metadata = pageMetadata("en", "/members", "Members", description);

export default function Page() {
  return <MembersPage locale="en" />;
}
