/**
 * page.tsx — Página Publications (EN)
 *
 * Wrapper fino da rota: delega o conteúdo a PublicationsPage com locale="en".
 */

import PublicationsPage from "@/components/pages/PublicationsPage";

export const metadata = {
  title: "Publications",
  alternates: { canonical: "/en/publications" },
};

export default function Page() {
  return <PublicationsPage locale="en" />;
}
