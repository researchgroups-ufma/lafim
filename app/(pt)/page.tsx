/**
 * page.tsx — Homepage do site LaFiM (branch lafim-design)
 *
 * Wrapper fino: o conteúdo real vive em components/pages/HomePage.tsx,
 * compartilhado entre as rotas PT e EN.
 */

import HomePage from "@/components/pages/HomePage";

export default function Page() {
  return <HomePage locale="pt" />;
}
