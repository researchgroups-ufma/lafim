/**
 * ThemeProvider — Injeta as CSS variables do config.ts no elemento raiz
 *
 * Por que isso existe:
 *   As CSS variables definidas em globals.css são a fonte visual do site.
 *   O ThemeProvider garante que os valores de lib/config.ts e o CSS estejam
 *   sempre sincronizados, injetando as variáveis via style inline no runtime.
 *   Assim, qualquer alteração em lib/config.ts reflete automaticamente no visual
 *   sem precisar editar o globals.css manualmente.
 *
 * Como funciona:
 *   Lê o objeto designTokens de lib/config.ts, monta um objeto com todas as
 *   CSS variables e aplica via style inline no div raiz que envolve o site.
 *
 * Usado em: app/layout.tsx (layout raiz — envolve todas as páginas)
 *
 * ATENÇÃO: precisa de "use client" porque acessa os tokens em runtime
 * no lado do cliente. Não realiza nenhuma lógica de servidor.
 */

"use client";

import { MotionConfig } from "framer-motion";
import { MotionConfig as MotionConfigReact } from "motion/react";
import { designTokens } from "@/lib/config";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colors, fonts } = designTokens;

  // Monta o objeto com todas as CSS variables do design system
  // As chaves seguem exatamente os nomes definidos em globals.css
  const cssVars = {
    "--color-bg":            colors.bg,
    "--color-bg-elevated":   colors.bgElevated,
    "--color-bg-subtle":     colors.bgSubtle,
    "--color-primary":       colors.primary,
    "--color-primary-hover": colors.primaryHover,
    "--color-primary-muted": colors.primaryMuted,
    "--color-text":          colors.text,
    "--color-text-muted":    colors.textMuted,
    "--color-text-subtle":   colors.textSubtle,
    "--color-border":        colors.border,
    "--color-border-strong": colors.borderStrong,
    "--font-display":        fonts.display,
    "--font-body":           fonts.body,
  } as React.CSSProperties;

  // O div raiz recebe todas as variáveis como style inline
  // Todos os componentes filhos herdam essas variáveis via CSS cascade.
  //
  // Os dois MotionConfig são intencionais: o projeto usa "framer-motion"
  // (templates, Hero, MobileNav, SideNav, EquipmentCard) e "motion/react"
  // (motion-primitives). São pacotes instalados separadamente, com contextos
  // React distintos — um provider sozinho não alcançaria a outra metade.
  //
  // reducedMotion="user" respeita a preferência do sistema (WCAG 2.3.3):
  // animações de transform/layout são neutralizadas, opacidade é preservada.
  return (
    <MotionConfig reducedMotion="user">
      <MotionConfigReact reducedMotion="user">
        <div style={cssVars}>{children}</div>
      </MotionConfigReact>
    </MotionConfig>
  );
}
