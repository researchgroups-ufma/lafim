/**
 * SideNav — Índice de navegação fixo no lado direito (desktop)
 *
 * Na home, sobre o Hero, os links formam um índice grande à direita do logo.
 * Ao rolar, o mesmo índice encolhe até o tamanho compacto e continua fixo no
 * mesmo lugar. Nas páginas internas ele já começa compacto. Nunca some.
 *
 * A página ativa é marcada com um ponto. A cor vem de mix-blend-mode
 * (ver SideNav.module.css), então não há detecção de fundo em JS.
 *
 * Oculto abaixo de 768px pela classe global .side-nav; lá o MobileNav assume.
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/lib/config";
import { getDictionary, localizeHref, type Locale } from "@/lib/i18n";
import LanguageSwitch from "./LanguageSwitch";
import s from "./SideNav.module.css";

// Quanto rolar na home até o índice grande encolher
const LIMIAR_COMPACTO = 120;

export default function SideNav({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const dict = getDictionary(locale);

  // Só a home (PT e EN) tem o Hero escuro em tela cheia. Decidir pela rota,
  // e não pelo DOM, faz o HTML estático já sair no estado certo.
  const isHome = pathname === "/" || pathname === "/en";

  const [rolou, setRolou] = useState(false);
  useEffect(() => {
    const onScroll = () => setRolou(window.scrollY > LIMIAR_COMPACTO);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const compacto = !isHome || rolou;

  return (
    <nav aria-label={dict.a11y.mainNav} className={`side-nav ${s.nav}`} data-compacto={compacto}>
      <ul className={s.lista}>
        {navLinks.map((link) => {
          const href = localizeHref(link.href, locale);
          const isActive =
            pathname === href || (link.href !== "/" && pathname.startsWith(href + "/"));
          return (
            <li key={link.href}>
              <Link href={href} aria-current={isActive ? "page" : undefined}>
                {dict.nav[link.key]}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className={s.idioma}>
        <LanguageSwitch locale={locale} />
      </div>
    </nav>
  );
}
