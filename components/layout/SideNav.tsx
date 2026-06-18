/**
 * SideNav — Menu de navegação lateral fixo no lado direito
 *
 * Animações implementadas com GSAP:
 *   1. Stagger na entrada dos links (cascata de cima para baixo)
 *   2. Hover com timeline coordenada — texto desliza + underline âmbar cresce
 *   3. Indicador de link ativo — ponto âmbar com entrada animada (back.out)
 *   4. Reveal do dropdown — AnimatePresence + GSAP (height/opacity)
 *
 * Para adicionar subitens a outro link:
 *   Adicione uma nova entrada no objeto SUB_ITEMS.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { navLinks } from "@/lib/config";

// Subitens de cada link principal
const SUB_ITEMS: Record<string, { label: string; href: string }[]> = {
  "/research": [
    { label: "Infraestrutura", href: "/research/infrastructure" },
  ],
};

export default function SideNav() {
  const pathname = usePathname();

  // Indica se o menu (centralizado na vertical) está sobreposto ao Hero escuro.
  // Quando true → texto branco; quando false (seções creme) → texto charcoal.
  // Inicializa como true na home para evitar flash escuro antes do observer.
  const [overDark, setOverDark] = useState(pathname === "/");

  // Observa o Hero com uma "linha" no centro vertical da viewport (rootMargin
  // -50%/-50%). Enquanto o Hero cruza essa linha, o menu está sobre fundo escuro.
  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) {
      setOverDark(false); // páginas sem Hero (fundo creme) → texto escuro
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => setOverDark(entry.isIntersecting),
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 }
    );
    io.observe(hero);
    return () => io.disconnect();
  }, [pathname]);

  // Cores derivadas do contexto (escuro sobre o Hero / claro sobre o creme)
  const fg = overDark ? "#ffffff" : "var(--color-text)";
  const accent = overDark ? "#ffffff" : "var(--color-primary)";
  const sepColor = overDark ? "rgba(245, 245, 240, 0.2)" : "rgba(28, 28, 28, 0.15)";

  // Refs para as animações GSAP
  const linksRef = useRef<(HTMLDivElement | null)[]>([]);
  const textsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const underlinesRef = useRef<(HTMLSpanElement | null)[]>([]);
  const subItemsRef = useRef<Record<string, HTMLDivElement | null>>({});

  // 1. Stagger na entrada dos links ao montar
  useEffect(() => {
    gsap.from(linksRef.current, {
      opacity: 0,
      x: 20,
      duration: 0.4,
      stagger: 0.08,
      ease: "power2.out",
    });
  }, []);

  // 2. Hover com timeline coordenada
  const handleEnter = (i: number) => {
    const textEl = textsRef.current[i];
    const underlineEl = underlinesRef.current[i];
    if (!textEl || !underlineEl) return;
    const tl = gsap.timeline();
    tl.to(textEl, { x: -4, duration: 0.2, ease: "power2.out" })
      .to(underlineEl, { scaleX: 1, duration: 0.25, ease: "power2.out" }, 0);
  };

  const handleLeave = (i: number) => {
    const textEl = textsRef.current[i];
    const underlineEl = underlinesRef.current[i];
    if (!textEl || !underlineEl) return;
    const tl = gsap.timeline();
    tl.to(textEl, { x: 0, duration: 0.2, ease: "power2.in" })
      .to(underlineEl, { scaleX: 0, duration: 0.2, ease: "power2.in" }, 0);
  };

  return (
    <nav
      aria-label="Navegação principal"
      className="side-nav"
      style={{
        position: "fixed",
        top: "50%",
        right: "2.5rem",
        transform: "translateY(-50%)",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {navLinks.map((link, index) => {
        const isActive =
          pathname === link.href || pathname.startsWith(link.href + "/");
        const subItems = SUB_ITEMS[link.href];
        const showSubItems = subItems && pathname.startsWith(link.href);

        return (
          <div key={link.href}>

            {/* Linha separadora acima de cada item */}
            <div
              style={{
                width: "100%",
                height: "1px",
                backgroundColor: sepColor,
                transition: "background-color 0.15s ease",
              }}
            />

            {/* Link principal com hover GSAP e indicador âmbar animado */}
            <div
              ref={(el) => { linksRef.current[index] = el; }}
              style={{ transformOrigin: "right center" }}
            >
              <Link
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                onMouseEnter={() => handleEnter(index)}
                onMouseLeave={() => handleLeave(index)}
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: "0.5rem",
                  padding: "0.6rem 0",
                  fontSize: "0.875rem",
                  fontWeight: isActive ? 500 : 400,
                  letterSpacing: "0.04em",
                  color: fg,
                  transition: "color 0.15s ease",
                  whiteSpace: "nowrap",
                }}
              >
                {/* Indicador âmbar — entrada animada com GSAP */}
                {isActive && (
                  <span
                    ref={(el) => {
                      if (el) {
                        gsap.from(el, {
                          scale: 0,
                          opacity: 0,
                          duration: 0.3,
                          ease: "back.out(1.7)",
                        });
                      }
                    }}
                    style={{
                      display: "block",
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: accent,
                      flexShrink: 0,
                    }}
                  />
                )}
                <span ref={(el) => { textsRef.current[index] = el; }}>
                  {link.label}
                </span>
                {/* Underline âmbar — cresce no hover */}
                <span
                  ref={(el) => { underlinesRef.current[index] = el; }}
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: "100%",
                    height: "1px",
                    backgroundColor: accent,
                    transformOrigin: "right center",
                    transform: "scaleX(0)",
                  }}
                />
              </Link>
            </div>

            {/* Subitens — dropdown com AnimatePresence + reveal GSAP */}
            <AnimatePresence>
              {showSubItems && subItems.map((sub) => {
                const subActive = pathname === sub.href;
                return (
                  <motion.div
                    key={sub.href}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    style={{ overflow: "hidden" }}
                    onAnimationStart={(definition) => {
                      // Reveal GSAP apenas na entrada (animate), não na saída
                      if (
                        typeof definition === "object" &&
                        definition !== null &&
                        "opacity" in definition &&
                        (definition as { opacity?: number }).opacity === 1
                      ) {
                        const subItemEl = subItemsRef.current[sub.href];
                        if (subItemEl) {
                          gsap.fromTo(
                            subItemEl,
                            { height: 0, opacity: 0 },
                            {
                              height: "auto",
                              opacity: 1,
                              duration: 0.25,
                              ease: "power2.out",
                              overwrite: "auto",
                            }
                          );
                        }
                      }
                    }}
                  >
                    <div
                      ref={(el) => { subItemsRef.current[sub.href] = el; }}
                    >
                      <Link
                        href={sub.href}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          gap: "0.4rem",
                          padding: "0.35rem 0",
                          fontSize: "0.775rem",
                          letterSpacing: "0.04em",
                          color: subActive
                            ? "var(--color-primary)"
                            : "var(--color-text-muted)",
                          transition: "color 0.15s ease",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {/* Indicador do subitem ativo — entrada GSAP */}
                        {subActive && (
                          <span
                            ref={(el) => {
                              if (el) {
                                gsap.from(el, {
                                  scale: 0,
                                  opacity: 0,
                                  duration: 0.3,
                                  ease: "back.out(1.7)",
                                });
                              }
                            }}
                            style={{
                              display: "block",
                              width: "4px",
                              height: "4px",
                              borderRadius: "50%",
                              backgroundColor: "var(--color-primary)",
                              flexShrink: 0,
                            }}
                          />
                        )}
                        {sub.label}
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Linha separadora abaixo do último item */}
            {index === navLinks.length - 1 && (
              <div
                style={{
                  width: "100%",
                  height: "1px",
                  backgroundColor: "rgba(245, 245, 240, 0.2)",
                }}
              />
            )}

          </div>
        );
      })}
    </nav>
  );
}
