/**
 * LanguageSwitch — Alterna entre as árvores PT e EN preservando a rota atual
 *
 * Deriva o destino de cada idioma a partir do pathname atual (rotas
 * espelhadas 1:1 entre `/` e `/en`), destaca o idioma ativo e usa
 * `next/link` para a navegação. Trocar de árvore raiz causa full page
 * reload — comportamento esperado neste site multi-root-layout.
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";

// Remove/adiciona o prefixo /en preservando o restante do caminho
function toLocale(pathname: string, target: Locale): string {
  const stripped = pathname.replace(/^\/en(?=\/|$)/, "") || "/";
  return target === "en" ? (stripped === "/" ? "/en" : `/en${stripped}`) : stripped;
}

export default function LanguageSwitch({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Idioma" style={{ display: "flex", gap: "0.5rem" }}>
      {(["pt", "en"] as const).map((target) => (
        <Link
          key={target}
          href={toLocale(pathname, target)}
          aria-current={locale === target ? "true" : undefined}
          style={{
            fontSize: "0.8rem",
            fontWeight: locale === target ? 600 : 400,
            opacity: locale === target ? 1 : 0.6,
            textTransform: "uppercase",
          }}
        >
          {target}
        </Link>
      ))}
    </nav>
  );
}
