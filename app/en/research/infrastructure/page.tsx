/**
 * page.tsx — Página Infrastructure (EN)
 *
 * Rota: /en/research/infrastructure
 *
 * Wrapper fino da rota: delega o conteúdo a InfrastructurePage com locale="en".
 */

import InfrastructurePage from "@/components/pages/InfrastructurePage";

export const metadata = { title: "Infrastructure", alternates: { canonical: "/en/research/infrastructure" } };

export default function Page() {
  return <InfrastructurePage locale="en" />;
}
