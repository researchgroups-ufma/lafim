/**
 * page.tsx — Página Contact (EN)
 *
 * Wrapper fino da rota: delega o conteúdo a ContactPage com locale="en".
 */

import ContactPage from "@/components/pages/ContactPage";
import { pageMetadata } from "@/lib/i18n/seo";

const description = "A Federal University of Maranhão laboratory dedicated to experimental research in Materials Physics: synthesis of inorganic materials and the study of their properties under extreme conditions of pressure and temperature.";

export const metadata = pageMetadata("en", "/contact", "Contact", description);

export default function Page() {
  return <ContactPage locale="en" />;
}
