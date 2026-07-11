/**
 * page.tsx — Página Linhas de Pesquisa (PT)
 *
 * Wrapper fino da rota: delega o conteúdo a ResearchPage com locale="pt".
 */

import ResearchPage from "@/components/pages/ResearchPage";

export const metadata = { title: "Pesquisa", alternates: { canonical: "/research" } };

export default function Page() {
  return <ResearchPage locale="pt" />;
}
