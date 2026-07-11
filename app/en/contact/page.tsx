/**
 * page.tsx — Página Contact (EN)
 *
 * Wrapper fino da rota: delega o conteúdo a ContactPage com locale="en".
 */

import ContactPage from "@/components/pages/ContactPage";
import { pageMetadata } from "@/lib/i18n/seo";

const description = "Research in condensed matter physics, nanomaterials and superconductivity at UFMA.";

export const metadata = pageMetadata("en", "/contact", "Contact", description);

export default function Page() {
  return <ContactPage locale="en" />;
}
