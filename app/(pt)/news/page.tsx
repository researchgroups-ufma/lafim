/**
 * page.tsx — Página Notícias (PT)
 *
 * Wrapper fino da rota: delega o conteúdo a NewsPage com locale="pt".
 */

import NewsPage from "@/components/pages/NewsPage";

export const metadata = { title: "Notícias", alternates: { canonical: "/news" } };

export default function Page() {
  return <NewsPage locale="pt" />;
}
