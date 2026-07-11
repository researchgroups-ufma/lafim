/**
 * page.tsx — Página Membros (PT)
 *
 * Wrapper fino da rota: delega o conteúdo a MembersPage com locale="pt".
 */

import MembersPage from "@/components/pages/MembersPage";

export const metadata = {
  title: "Membros",
  alternates: { canonical: "/members" },
};

export default function Page() {
  return <MembersPage locale="pt" />;
}
