/**
 * PageHeaderMeta — Faixa de identificação no topo do PageHeader
 *
 * Client Component: lê a rota atual para decidir o idioma do nome do
 * laboratório, sem que cada página precise repassar o locale ao PageHeader.
 *
 * O logo é lafim-simbolo-sigla.svg: o new_lafim.svg sem o grupo "subtitle"
 * (nome por extenso em letra pequena) — só a gaxeta, os diamantes e "LaFiM".
 */

"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { getDictionary } from "@/lib/i18n";

export default function PageHeaderMeta() {
  const pathname = usePathname();
  const locale = pathname === "/en" || pathname.startsWith("/en/") ? "en" : "pt";

  return (
    <div className="page-header-meta">
      <Image
        src="/logo/lafim-simbolo-sigla.svg"
        alt="LaFiM"
        width={183}
        height={48}
        className="page-header-logo"
      />
      <span className="page-header-meta-text">
        <span>
          <span className="page-header-lab">{getDictionary(locale).labName} · </span>
          UFMA
        </span>
      </span>
    </div>
  );
}
