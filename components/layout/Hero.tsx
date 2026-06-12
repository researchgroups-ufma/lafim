/**
 * Hero — Seção principal fullscreen do site LaFiM
 *
 * Comportamento:
 *   - Ocupa 100% da altura da tela (100svh)
 *   - Exibe um vídeo de fundo em loop, mudo e com autoplay
 *   - Overlay escuro sobre o vídeo para legibilidade
 *   - Logo SVG do LaFiM posicionada no canto inferior esquerdo
 *   - Linha horizontal separando logo do subtítulo
 *   - Subtítulo abaixo da linha
 *
 * Props:
 *   images   — mantido por compatibilidade com page.tsx (não utilizado)
 *   subtitle — texto exibido abaixo da linha separadora (opcional)
 *
 * Usado em: app/(site)/page.tsx
 *
 * ATENÇÃO: precisa de "use client" pois renderiza HeroLogo (GSAP) e TextEffect.
 */

"use client";

import { TextEffect } from "@/components/motion-primitives/text-effect";
import HeroLogo from "@/components/HeroLogo";

type HeroProps = {
  images: string[];
  subtitle?: string;
};

export default function Hero({ subtitle }: HeroProps) {
  return (
    <section
      id="hero"
      style={{
        position: "relative",
        width: "100%",
        height: "100svh",        /* ocupa exatamente a altura visível da tela */
        overflow: "hidden",
        display: "flex",
        alignItems: "center",  /* centraliza verticalmente no hero */
        justifyContent: "center", /* centraliza horizontalmente também */
      }}
    >

      {/* ── Vídeo de fundo ──────────────────────────────────────────────────
          Ocupa todo o hero, tocando em loop, mudo e automaticamente.
          poster é exibido enquanto o vídeo carrega.                        */}
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="/images/hero-poster.jpg"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover", /* cobre sem distorcer */
        }}
      >
        <source src="/videos/video-hero.mp4" type="video/mp4" />
      </video>

      {/* ── Overlay escuro ──────────────────────────────────────────────────
          Gradiente da esquerda (mais escuro) para a direita (transparente).
          Garante legibilidade do texto sobre qualquer imagem de fundo.    */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to right, rgba(8,8,8,0.92) 0%, rgba(8,8,8,0.6) 50%, rgba(8,8,8,0.2) 100%)",
        }}
      />

      {/* ── Overlay inferior ────────────────────────────────────────────────
          Gradiente vertical extra na parte inferior para o texto           */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(8,8,8,0.95) 0%, transparent 50%)",
        }}
      />

      {/* ── Conteúdo — canto inferior esquerdo ─────────────────────────────
          zIndex 10 garante que fique acima dos overlays                   */}
      <div
        className="container-site"
        style={{
          position: "relative",
          zIndex: 10,
          paddingBottom: "4rem",  /* espaço entre o conteúdo e a borda inferior */
          maxWidth: "700px",      /* limita a largura do bloco de texto         */
        }}
      >

        {/* Logo SVG do LaFiM — animado (montagem da DAC) */}
        <div style={{ marginBottom: "1rem" }}>
          <HeroLogo />
        </div>

        {/* Linha horizontal separadora — estilo Unearthly Materials */}
        <div
          style={{
            width: "100%",
            height: "1px",
            backgroundColor: "rgba(245, 245, 240, 0.3)", /* branco sutil      */
            marginBottom: "1.25rem",
          }}
        />

        {/* Subtítulo abaixo da linha */}
        {subtitle && (
           <TextEffect
              per="char"
              preset="fade"
              style={{
              color: "var(--color-text-muted)",
              fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)",
              fontWeight: 300,
              letterSpacing: "0.02em",
              maxWidth: "480px",
              display: "block",
            }}
          >
            {subtitle}
           </TextEffect>

        )}

      </div>
    </section>
  );
}
