/**
 * page.tsx — Página News (EN)
 *
 * Wrapper fino da rota: delega o conteúdo a NewsPage com locale="en".
 */

import NewsPage from "@/components/pages/NewsPage";
import { pageMetadata } from "@/lib/i18n/seo";

const description = "A Federal University of Maranhão laboratory dedicated to experimental research in Materials Physics: synthesis of inorganic materials and the study of their properties under extreme conditions of pressure and temperature.";

export const metadata = pageMetadata("en", "/news", "News", description);

export default function Page() {
  return <NewsPage locale="en" />;
}
