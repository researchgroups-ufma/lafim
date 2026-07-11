/**
 * page.tsx — Página Contato (PT)
 *
 * Wrapper fino da rota: delega o conteúdo a ContactPage com locale="pt".
 */

import ContactPage from "@/components/pages/ContactPage";

export const metadata = { title: "Contato", alternates: { canonical: "/contact" } };

export default function Page() {
  return <ContactPage locale="pt" />;
}
