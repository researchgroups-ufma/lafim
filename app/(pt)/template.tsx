/**
 * template.tsx — Transição de página para o site público
 *
 * O Next.js App Router remonta o template.tsx a cada troca de rota,
 * ao contrário do layout.tsx que persiste. Isso permite animar a
 * entrada de cada página de forma confiável com Framer Motion.
 *
 * Animação: fade in + slide sutil de baixo para cima ao entrar.
 * Sem animação de saída — mantém a navegação ágil.
 */

"use client";

import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
