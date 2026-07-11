/**
 * page.tsx — Página Infraestrutura (PT)
 *
 * Rota: /research/infrastructure
 *
 * Wrapper fino da rota: delega o conteúdo a InfrastructurePage com locale="pt".
 */

import InfrastructurePage from "@/components/pages/InfrastructurePage";

export const metadata = { title: "Infraestrutura", alternates: { canonical: "/research/infrastructure" } };

export default function Page() {
  return <InfrastructurePage locale="pt" />;
}
