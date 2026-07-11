/**
 * page.tsx — Página News (EN)
 *
 * Wrapper fino da rota: delega o conteúdo a NewsPage com locale="en".
 */

import NewsPage from "@/components/pages/NewsPage";
import { pageMetadata } from "@/lib/i18n/seo";

const description = "Research in condensed matter physics, nanomaterials and superconductivity at UFMA.";

export const metadata = pageMetadata("en", "/news", "News", description);

export default function Page() {
  return <NewsPage locale="en" />;
}
