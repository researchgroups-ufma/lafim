/**
 * page.tsx — Página Sobre (PT)
 *
 * Wrapper fino da rota: delega o conteúdo a AboutPage com locale="pt".
 */

import AboutPage from "@/components/pages/AboutPage";

export const metadata = { title: "Sobre", alternates: { canonical: "/about" } };

export default function Page() {
  return <AboutPage locale="pt" />;
}
