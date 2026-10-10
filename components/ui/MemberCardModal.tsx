/**
 * MemberCardModal — Card de membro com Morphing Dialog
 *
 * Usa o MorphingDialog do Motion Primitives para criar uma transição
 * fluida entre o card fechado e o modal expandido.
 *
 * Estado fechado: foto, nome, bolsa e ano de início. No hover, uma faixa
 * "Ver perfil" sobe de dentro da foto (CSS em .member-card, globals.css).
 * Ao clicar: expande com animação morphing — a foto voa do card para o
 * modal (MorphingDialogImage, mesmo layoutId) — com bio e links acadêmicos.
 *
 * Fase futura: ajustar variantes e transição conforme feedback visual.
 *
 * Props:
 *   name          — nome completo (obrigatório)
 *   role          — função no laboratório (obrigatório)
 *   research_area — linha de pesquisa (opcional)
 *   scholarship   — bolsa: CAPES, CNPq, FAPEMA (opcional)
 *   year_start    — ano de início no grupo (opcional)
 *   bio           — biografia completa (opcional)
 *   photo         — caminho da foto em /uploads/ (opcional)
 *   email         — e-mail institucional (opcional)
 *   linkedin      — URL do LinkedIn (opcional)
 *   instagram     — URL do Instagram (opcional)
 *   lattes        — URL do Lattes (opcional)
 *   orcid         — URL do ORCID (opcional)
 *   scholar       — URL do Google Scholar (opcional)
 *   arxiv         — URL do arXiv (opcional)
 */

"use client";

import MemberLinks from "@/components/ui/MemberLinks";
import { getDictionary, type Locale } from "@/lib/i18n";
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContent,
  MorphingDialogTitle,
  MorphingDialogSubtitle,
  MorphingDialogClose,
  MorphingDialogDescription,
  MorphingDialogContainer,
  MorphingDialogImage,
} from "@/components/motion-primitives/morphing-dialog";

type MemberCardModalProps = {
  name: string;
  role: string;
  research_area?: string;
  scholarship?: string;
  year_start?: string;
  bio?: string;
  photo?: string;
  email?: string;
  linkedin?: string;
  instagram?: string;
  lattes?: string;
  orcid?: string;
  scholar?: string;
  arxiv?: string;
  /** idioma dos aria-labels dos links (default "pt") */
  locale?: Locale;
};

export default function MemberCardModal({
  name, role, research_area, scholarship, year_start,
  bio, photo, email, linkedin, instagram, lattes, orcid, scholar, arxiv, locale = "pt",
}: MemberCardModalProps) {
  const { a11y, members: t } = getDictionary(locale);

  return (
    <MorphingDialog
      transition={{
        type: "spring",
        bounce: 0.05,
        duration: 0.3,
      }}
    >

      {/* ── Card fechado (trigger) ─────────────────────────────────────────── */}
      {/* Sem transform no hover: o trigger e a foto são animados por layoutId,
          e um transform CSS brigaria com a animação de abertura. */}
      <MorphingDialogTrigger className="member-card">
        <span className="member-card__photo">
          {photo ? (
            <MorphingDialogImage src={photo} alt={`${a11y.photoOf} ${name}`} />
          ) : (
            <span className="member-card__initial">{name.charAt(0)}</span>
          )}
          <span className="member-card__more" aria-hidden="true">{t.viewProfile}</span>
        </span>

        <MorphingDialogTitle className="member-card__name">{name}</MorphingDialogTitle>

        {(scholarship || year_start || research_area) && (
          <MorphingDialogSubtitle className="member-card__meta">
            {research_area && <>{research_area}<br /></>}
            {scholarship && t.scholarship.replace("{bolsa}", scholarship)}
            {scholarship && year_start && " · "}
            {year_start && `${t.since} ${year_start}`}
          </MorphingDialogSubtitle>
        )}
      </MorphingDialogTrigger>

      {/* ── Modal expandido ───────────────────────────────────────────────── */}
      <MorphingDialogContainer>
        <MorphingDialogContent
          style={{
            backgroundColor: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border-strong)",
            borderRadius: "0.75rem",
            width: "min(600px, 90vw)",
            maxHeight: "85vh",
            padding: "2rem",
            // ancora o MorphingDialogClose, que é `absolute`, no modal —
            // sem isso ele se prende ao container fixo e vai para o canto da tela
            position: "relative",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Só este bloco rola: o Close fica ancorado no Content, que não
              rola, e assim continua visível no canto durante a leitura. */}
          <div style={{ overflowY: "auto" }}>

          {/* Layout: foto + info lado a lado */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "140px 1fr",
              gap: "1.5rem",
              alignItems: "start",
              marginBottom: "1.5rem",
            }}
          >
            {/* Foto ou placeholder com inicial */}
            <div
              style={{
                position: "relative",
                width: "140px",
                aspectRatio: "0.85",
                backgroundColor: "var(--color-bg-subtle)",
                borderRadius: "0.375rem",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {photo ? (
                <MorphingDialogImage
                  src={photo}
                  alt={`${a11y.photoOf} ${name}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "3rem",
                    fontWeight: 600,
                    color: "var(--color-primary)",
                  }}
                >
                  {name.charAt(0)}
                </span>
              )}
            </div>

            {/* Nome, função e links */}
            <div>
              <MorphingDialogTitle
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.3rem",
                  fontWeight: 500,
                  color: "var(--color-text)",
                  marginBottom: "0.2rem",
                }}
              >
                {name}
              </MorphingDialogTitle>

              <p style={{ fontSize: "0.8rem", color: "var(--color-primary)", marginBottom: "0.2rem" }}>
                {role}
              </p>

              {research_area && (
                <MorphingDialogSubtitle
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--color-text-subtle)",
                    marginBottom: "1rem",
                  }}
                >
                  {research_area}
                </MorphingDialogSubtitle>
              )}

              {/* Links acadêmicos — ícones SVG */}
              <MemberLinks
                email={email}
                linkedin={linkedin}
                instagram={instagram}
                lattes={lattes}
                orcid={orcid}
                scholar={scholar}
                arxiv={arxiv}
                locale={locale}
              />
            </div>
          </div>

          {/* Bio completa */}
          {bio && (
            <MorphingDialogDescription
              disableLayoutAnimation
              variants={{
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
                exit:    { opacity: 0, y: 20 },
              }}
            >
              <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "1.5rem" }}>
                {bio.split("\n\n").map((paragraph) => (
                  <p
                    key={paragraph}
                    style={{
                      fontSize: "0.9rem",
                      lineHeight: 1.8,
                      color: "var(--color-text-muted)",
                      fontWeight: 300,
                      marginBottom: "0.85rem",
                    }}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </MorphingDialogDescription>
          )}

          </div>

          {/* Botão fechar — canto superior direito do modal */}
          <MorphingDialogClose className="modal-close" label={a11y.close} />

        </MorphingDialogContent>
      </MorphingDialogContainer>

    </MorphingDialog>
  );
}
