/**
 * MobileNav — Navegação para telas pequenas (abaixo de 768px)
 *
 * Exibida apenas em mobile (md:hidden). Em desktop a SideNav assume.
 *
 * Estrutura:
 *   1. Botão hamburguer flutuante no canto superior direito (sem barra)
 *   2. Overlay fullscreen (AnimatePresence) com os links centralizados
 *
 * O botão hamburguer anima entre as três linhas e o "X" via Framer Motion.
 * O overlay entra com fade + slide e fecha ao clicar em um link ou no X.
 *
 * Sem a barra por trás, o botão fica direto sobre o conteúdo e precisa
 * trocar de cor conforme o que está atrás dele — igual ao SideNav, que faz
 * o mesmo com os links. Ver o comentário em `overDark` abaixo.
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getDictionary, localizeHref, type Locale } from "@/lib/i18n";
import LanguageSwitch from "./LanguageSwitch";

// Links da navegação mobile — mesmos da SideNav, simplificados e sem submenu.
// Infraestrutura (/research/infrastructure) saiu do menu enquanto é reformulada.
const LINKS = [
  { key: "home", href: "/" },
  { key: "research", href: "/research" },
  { key: "members", href: "/members" },
  { key: "publications", href: "/publications" },
  { key: "news", href: "/news" },
  { key: "about", href: "/about" },
  { key: "contact", href: "/contact" },
] as const;

// Distância do topo em que o botão flutua — usada tanto no posicionamento
// quanto para decidir se ele está sobre o bloco escuro.
const BOTAO_TOPO = 20;

// Base de cada linha do hamburguer — posição via `top`, movimento via `y`.
// A cor NÃO vive aqui: depende do que está atrás do botão (ver overDark).
const lineBase: React.CSSProperties = {
  position: "absolute",
  left: 0,
  width: 24,
  height: 2,
  borderRadius: 2,
  transition: "background-color 0.15s ease",
};

export default function MobileNav({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const dict = getDictionary(locale);

  // O botão está sobre o bloco escuro da página (hoje só o Hero da home;
  // o PageHeader das internas é claro)? Diferente do SideNav, que fica no centro da tela e usa um
  // IntersectionObserver, o botão fica a 20px do topo: basta checar se o bloco
  // cobre esse ponto. Vale a linha do hamburguer, não a do topo do bloco.
  const [overDark, setOverDark] = useState(true);

  useEffect(() => {
    const darkBlock = document.querySelector("[data-dark-bg]");
    if (!darkBlock) {
      setOverDark(false); // páginas sem bloco escuro → linhas charcoal
      return;
    }
    const alvo = BOTAO_TOPO + 12; // meio do ícone (24px de altura)
    const check = () => {
      const r = darkBlock.getBoundingClientRect();
      setOverDark(r.top <= alvo && r.bottom >= alvo);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [pathname]);

  // Aberto, o botão está sobre o overlay escuro e sempre vai de claro.
  const lineColor = open ? "#f5f5f0" : overDark ? "#ffffff" : "#1c1c1c";

  return (
    <>
      {/* ── Botão flutuante (apenas mobile) ───────────────────────────────── */}
        <button
          type="button"
          className="mobile-only"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? dict.a11y.closeMenu : dict.a11y.openMenu}
          aria-expanded={open}
          style={{
            position: "fixed",
            top: BOTAO_TOPO,
            right: "1.25rem",
            width: 24,
            height: 24,
            padding: 0,
            background: "none",
            border: "none",
            cursor: "pointer",
            // Acima do overlay do menu (z-40) para o X continuar clicável, e
            // ABAIXO do modal (z-50) — senão o botão flutua sobre o dialog.
            zIndex: 45,
          }}
        >
          <motion.span
            style={{ ...lineBase, top: 5, backgroundColor: lineColor }}
            animate={open ? { y: 6, rotate: 45 } : { y: 0, rotate: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          />
          <motion.span
            style={{ ...lineBase, top: 11, backgroundColor: lineColor }}
            animate={{ opacity: open ? 0 : 1 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          />
          <motion.span
            style={{ ...lineBase, top: 17, backgroundColor: lineColor }}
            animate={open ? { y: -6, rotate: -45 } : { y: 0, rotate: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          />
        </button>

      {/* ── Overlay fullscreen ────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-only"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 40,
              backgroundColor: "rgba(10, 10, 10, 0.85)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <nav
              aria-label={dict.a11y.mobileNav}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1.5rem",
              }}
            >
              {LINKS.map((link) => {
                const href = localizeHref(link.href, locale);
                const isActive = pathname === href;
                return (
                  <Link
                    key={link.href}
                    href={href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={`mobile-nav-link${isActive ? " is-active" : ""}`}
                  >
                    {dict.nav[link.key]}
                  </Link>
                );
              })}

              {/* Switch de idioma PT | EN */}
              <div style={{ color: "#f5f5f0" }}>
                <LanguageSwitch locale={locale} />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
