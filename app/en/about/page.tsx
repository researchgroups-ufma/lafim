/**
 * page.tsx — Página About (EN)
 *
 * Wrapper fino da rota: delega o conteúdo a AboutPage com locale="en".
 */

import AboutPage from "@/components/pages/AboutPage";
import { pageMetadata } from "@/lib/i18n/seo";

const description = "Research in condensed matter physics, nanomaterials and superconductivity at UFMA.";

export const metadata = pageMetadata("en", "/about", "About", description);

export default function Page() {
  return <AboutPage locale="en" />;
}
