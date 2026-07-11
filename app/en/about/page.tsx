/**
 * page.tsx — Página About (EN)
 *
 * Wrapper fino da rota: delega o conteúdo a AboutPage com locale="en".
 */

import AboutPage from "@/components/pages/AboutPage";

export const metadata = { title: "About", alternates: { canonical: "/en/about" } };

export default function Page() {
  return <AboutPage locale="en" />;
}
