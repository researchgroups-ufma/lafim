/**
 * page.tsx — Página News (EN)
 *
 * Wrapper fino da rota: delega o conteúdo a NewsPage com locale="en".
 */

import NewsPage from "@/components/pages/NewsPage";

export const metadata = { title: "News", alternates: { canonical: "/en/news" } };

export default function Page() {
  return <NewsPage locale="en" />;
}
