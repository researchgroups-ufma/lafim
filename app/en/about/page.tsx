/**
 * page.tsx — Página About (EN)
 *
 * Wrapper fino da rota: delega o conteúdo a AboutPage com locale="en".
 */

import AboutPage from "@/components/pages/AboutPage";
import { pageMetadata } from "@/lib/i18n/seo";

const description = "A Federal University of Maranhão laboratory dedicated to experimental research in Materials Physics: synthesis of inorganic materials and the study of their properties under extreme conditions of pressure and temperature.";

export const metadata = pageMetadata("en", "/about", "About", description);

export default function Page() {
  return <AboutPage locale="en" />;
}
