/**
 * page.tsx — Página Members (EN)
 *
 * Wrapper fino da rota: delega o conteúdo a MembersPage com locale="en".
 */

import MembersPage from "@/components/pages/MembersPage";

export const metadata = {
  title: "Members",
  alternates: { canonical: "/en/members" },
};

export default function Page() {
  return <MembersPage locale="en" />;
}
