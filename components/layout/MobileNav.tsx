/**
 * MobileNav — Navegação para telas pequenas (abaixo de 768px)
 *
 * Exibida apenas em mobile (md:hidden). Em desktop a SideNav assume.
 *
 * Estrutura:
 *   1. Navbar fina fixa no topo (h-14) com o botão hamburguer à direita
 *   2. Overlay fullscreen (AnimatePresence) com os links centralizados
 *
 * O botão hamburguer anima entre as três linhas e o "X" via Framer Motion.
 * O overlay entra com fade + slide e fecha ao clicar em um link ou no X.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// Links da navegação mobile — mesmos da SideNav, simplificados e sem submenu
const LINKS = [
  { label: "Início", href: "/" },
  { label: "Pesquisa", href: "/research" },
  { label: "Infraestrutura", href: "/research/infrastructure" },
  { label: "Membros", href: "/members" },
  { label: "Publicações", href: "/publications" },
  { label: "Notícias", href: "/news" },
  { label: "Sobre", href: "/about" },
  { label: "Contato", href: "/contact" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Base de cada linha do hamburguer — posição via `top`, movimento via `y`
  const lineBase: React.CSSProperties = {
    position: "absolute",
    left: 0,
    width: 24,
    height: 2,
    borderRadius: 2,
    backgroundColor: "#1c1c1c",
  };

  return (
    <>
      {/* ── Navbar fixa (apenas mobile) ───────────────────────────────────── */}
      <header
        className="mobile-only"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          height: "3.5rem",
          backgroundColor: "#f7f4ed",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          padding: "0 1.25rem",
        }}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          style={{
            position: "relative",
            width: 24,
            height: 24,
            padding: 0,
            background: "none",
            border: "none",
            cursor: "pointer",
            zIndex: 51, // acima do overlay para o X continuar clicável
          }}
        >
          <motion.span
            style={{ ...lineBase, top: 5 }}
            animate={open ? { y: 6, rotate: 45 } : { y: 0, rotate: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          />
          <motion.span
            style={{ ...lineBase, top: 11 }}
            animate={{ opacity: open ? 0 : 1 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          />
          <motion.span
            style={{ ...lineBase, top: 17 }}
            animate={open ? { y: -6, rotate: -45 } : { y: 0, rotate: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          />
        </button>
      </header>

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
              aria-label="Navegação mobile"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1.5rem",
              }}
            >
              {LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={`mobile-nav-link${isActive ? " is-active" : ""}`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
