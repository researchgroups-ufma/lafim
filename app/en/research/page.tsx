/**
 * page.tsx — Página Research (EN)
 *
 * Wrapper fino da rota: delega o conteúdo a ResearchPage com locale="en".
 */

import ResearchPage from "@/components/pages/ResearchPage";

export const metadata = { title: "Research", alternates: { canonical: "/en/research" } };

export default function Page() {
  return <ResearchPage locale="en" />;
}
