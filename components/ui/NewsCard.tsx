/**
 * NewsCard — Notícia individual com Morphing Dialog
 *
 * Client Component. O card fechado (trigger) preserva exatamente o visual da
 * lista de notícias; ao clicar, abre um Morphing Dialog (Motion Primitives,
 * mesmo padrão de MemberCardModal) com o texto integral e um carrossel de
 * imagens.
 *
 * Imagens: `cover_image` é a principal (exibida no card). No dialog, o
 * carrossel percorre `images` — que o Server Component monta como
 * [cover_image, ...gallery]. Com uma só imagem, o carrossel não mostra controles.
 *
 * Props:
 *   item    — notícia serializável vinda do Server Component
 *   isFirst — true para o primeiro item (borda superior da lista)
 */

"use client";

import Image from "next/image";
import { useState } from "react";
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContent,
  MorphingDialogTitle,
  MorphingDialogClose,
  MorphingDialogDescription,
  MorphingDialogContainer,
} from "@/components/motion-primitives/morphing-dialog";

export type NewsItem = {
  slug: string;
  title: string;
  dateFormatted: string;
  year: number;
  month: number;
  category?: string;
  excerpt?: string;
  cover_image?: string;
  images: string[];
  body?: string;
};

type NewsCardProps = {
  item: NewsItem;
  isFirst: boolean;
};

export default function NewsCard({ item, isFirst }: NewsCardProps) {
  return (
    <MorphingDialog
      transition={{ type: "spring", bounce: 0.05, duration: 0.3 }}
    >
      {/* ── Card fechado (trigger) — mantém o visual da lista ─────────────── */}
      <MorphingDialogTrigger
        className="stack-mobile"
        style={{
          display: "grid",
          gridTemplateColumns: item.cover_image ? "1fr 200px" : "1fr",
          gap: "2rem",
          alignItems: "start",
          padding: "2rem 0",
          width: "100%",
          textAlign: "left",
          borderBottom: "1px solid var(--color-border)",
          borderTop: isFirst ? "1px solid var(--color-border)" : "none",
          background: "none",
        }}
      >
        {/* Conteúdo */}
        <div>
          {/* Categoria e data */}
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              alignItems: "center",
              marginBottom: "0.75rem",
            }}
          >
            {item.category && (
              <span className="badge badge-primary">{item.category}</span>
            )}
            <span style={{ fontSize: "0.8rem", color: "var(--color-text-subtle)" }}>
              {item.dateFormatted}
            </span>
          </div>

          {/* Título */}
          <MorphingDialogTitle
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.2rem",
              fontWeight: 500,
              color: "var(--color-text)",
              marginBottom: "0.5rem",
              lineHeight: 1.3,
            }}
          >
            {item.title}
          </MorphingDialogTitle>

          {/* Resumo */}
          {item.excerpt && (
            <p
              style={{
                fontSize: "0.9rem",
                color: "var(--color-text-muted)",
                fontWeight: 300,
                lineHeight: 1.6,
              }}
            >
              {item.excerpt}
            </p>
          )}

          {/* Indicador de abertura */}
          <span
            style={{
              display: "inline-block",
              marginTop: "0.75rem",
              fontSize: "0.8rem",
              fontWeight: 400,
              color: "var(--color-primary)",
            }}
          >
            Ler matéria completa →
          </span>
        </div>

        {/* Imagem de capa — oculta no mobile (.desktop-only); reaparece no
            carrossel do dialog ao abrir o card. */}
        {item.cover_image && (
          <Image
            src={item.cover_image}
            alt={item.title}
            className="desktop-only"
            width={200}
            height={113}
            style={{
              width: "100%",
              height: "auto",
              aspectRatio: "16/9",
              objectFit: "cover",
              border: "1px solid var(--color-border-strong)",
            }}
          />
        )}
      </MorphingDialogTrigger>

      {/* ── Dialog expandido ──────────────────────────────────────────────── */}
      <MorphingDialogContainer>
        <MorphingDialogContent
          style={{
            backgroundColor: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border-strong)",
            borderRadius: "0.75rem",
            width: "min(720px, 92vw)",
            maxHeight: "85vh",
            overflowY: "auto",
            padding: "2rem",
          }}
        >
          {/* Carrossel de imagens */}
          {item.images.length > 0 && (
            <NewsCarousel images={item.images} alt={item.title} />
          )}

          {/* Categoria e data */}
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              alignItems: "center",
              marginBottom: "0.75rem",
            }}
          >
            {item.category && (
              <span className="badge badge-primary">{item.category}</span>
            )}
            <span style={{ fontSize: "0.8rem", color: "var(--color-text-subtle)" }}>
              {item.dateFormatted}
            </span>
          </div>

          {/* Título */}
          <MorphingDialogTitle
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.5rem",
              fontWeight: 500,
              color: "var(--color-text)",
              marginBottom: "1.25rem",
              lineHeight: 1.25,
            }}
          >
            {item.title}
          </MorphingDialogTitle>

          {/* Texto integral */}
          {item.body && (
            <MorphingDialogDescription
              disableLayoutAnimation
              variants={{
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
                exit: { opacity: 0, y: 20 },
              }}
            >
              <div
                style={{
                  borderTop: "1px solid var(--color-border)",
                  paddingTop: "1.5rem",
                }}
              >
                {item.body
                  .split(/\n{2,}/)
                  .map((para) => para.trim())
                  .filter(Boolean)
                  .map((para, i) => (
                    <p
                      key={i}
                      style={{
                        fontSize: "0.95rem",
                        lineHeight: 1.8,
                        color: "var(--color-text-muted)",
                        fontWeight: 300,
                        marginBottom: "1rem",
                      }}
                    >
                      {para.replace(/^>\s?/, "")}
                    </p>
                  ))}
              </div>
            </MorphingDialogDescription>
          )}

          {/* Botão fechar */}
          <MorphingDialogClose className="text-zinc-400" />
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}

/* ── Carrossel ──────────────────────────────────────────────────────────────
 * Percorre as imagens da notícia. Com uma única imagem, não exibe controles.
 */
function NewsCarousel({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const many = images.length > 1;

  function go(next: number) {
    setIndex((next + images.length) % images.length);
  }

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "16/9",
          overflow: "hidden",
          borderRadius: "0.375rem",
          border: "1px solid var(--color-border-strong)",
          backgroundColor: "var(--color-bg-subtle)",
        }}
      >
        <Image
          src={images[index]}
          alt={`${alt} — imagem ${index + 1}`}
          fill
          sizes="(max-width: 720px) 92vw, 720px"
          style={{ objectFit: "cover" }}
        />

        {many && (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Imagem anterior"
              style={arrowStyle("left")}
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Próxima imagem"
              style={arrowStyle("right")}
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Indicadores */}
      {many && (
        <div
          style={{
            display: "flex",
            gap: "0.4rem",
            justifyContent: "center",
            marginTop: "0.75rem",
          }}
        >
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Ir para imagem ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              style={{
                width: "0.5rem",
                height: "0.5rem",
                borderRadius: "9999px",
                border: "none",
                padding: 0,
                cursor: "pointer",
                backgroundColor:
                  i === index ? "var(--color-primary)" : "var(--color-border-strong)",
                transition: "background-color 0.15s ease",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Estilo das setas de navegação do carrossel
function arrowStyle(side: "left" | "right"): React.CSSProperties {
  return {
    position: "absolute",
    top: "50%",
    [side]: "0.5rem",
    transform: "translateY(-50%)",
    width: "2rem",
    height: "2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.4rem",
    lineHeight: 1,
    borderRadius: "9999px",
    border: "1px solid var(--color-border-strong)",
    backgroundColor: "var(--color-bg-elevated)",
    color: "var(--color-text)",
    cursor: "pointer",
  };
}
