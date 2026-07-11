/**
 * page.tsx — Página Contact (EN)
 *
 * Wrapper fino da rota: delega o conteúdo a ContactPage com locale="en".
 */

import ContactPage from "@/components/pages/ContactPage";

export const metadata = { title: "Contact", alternates: { canonical: "/en/contact" } };

export default function Page() {
  return <ContactPage locale="en" />;
}
