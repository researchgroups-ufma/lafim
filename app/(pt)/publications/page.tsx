/**
 * page.tsx — Página Publicações (PT)
 *
 * Wrapper fino da rota: delega o conteúdo a PublicationsPage com locale="pt".
 */

import PublicationsPage from "@/components/pages/PublicationsPage";

export const metadata = {
  title: "Publicações",
  alternates: { canonical: "/publications" },
};

export default function Page() {
  return <PublicationsPage locale="pt" />;
}
