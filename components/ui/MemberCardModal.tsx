/**
 * MemberCardModal — Card de membro com Morphing Dialog
 *
 * Usa o MorphingDialog do Motion Primitives para criar uma transição
 * fluida entre o card fechado e o modal expandido.
 *
 * Estado fechado: nome, área de pesquisa, bolsa e ano de início.
 * Ao clicar: expande com animação morphing mostrando foto, bio
 * completa e links acadêmicos.
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
 *   lattes        — URL do Lattes (opcional)
 *   orcid         — URL do ORCID (opcional)
 *   scholar       — URL do Google Scholar (opcional)
 *   arxiv         — URL do arXiv (opcional)
 */

"use client";

import Image from "next/image";
import MemberLinks from "@/components/ui/MemberLinks";
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContent,
  MorphingDialogTitle,
  MorphingDialogSubtitle,
  MorphingDialogClose,
  MorphingDialogDescription,
  MorphingDialogContainer,
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
  lattes?: string;
  orcid?: string;
  scholar?: string;
  arxiv?: string;
};

export default function MemberCardModal({
  name, role, research_area, scholarship, year_start,
  bio, photo, email, linkedin, lattes, orcid, scholar, arxiv,
}: MemberCardModalProps) {
  return (
    <MorphingDialog
      transition={{
        type: "spring",
        bounce: 0.05,
        duration: 0.3,
      }}
    >

      {/* ── Card fechado (trigger) ─────────────────────────────────────────── */}
      <MorphingDialogTrigger
        style={{
          backgroundColor: "var(--color-bg-elevated)",
          padding: "1.5rem",
          transition: "background-color 0.15s ease",
          width: "100%",
          textAlign: "left",
          cursor: "pointer",
        }}
        className="member-card-hover"
      >
        {/* Nome */}
        <MorphingDialogTitle
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.05rem",
            fontWeight: 500,
            color: "var(--color-text)",
            marginBottom: "0.15rem",
          }}
        >
          {name}
        </MorphingDialogTitle>

        {/* Área de pesquisa e bolsa */}
        <MorphingDialogSubtitle
          style={{
            fontSize: "0.8rem",
            color: "var(--color-text-muted)",
            fontWeight: 300,
            lineHeight: 1.5,
            marginBottom: "1rem",
          }}
        >
          {research_area}
          {scholarship && (
            <>
              <br />
              <em style={{ fontSize: "0.75rem", color: "var(--color-text-subtle)" }}>
                Bolsa {scholarship}
                {year_start && ` · desde ${year_start}`}
              </em>
            </>
          )}
        </MorphingDialogSubtitle>

        {/* Indicador de que há mais informações */}
        <p style={{ fontSize: "0.7rem", color: "var(--color-text-subtle)" }}>
          Ver perfil →
        </p>
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
            overflowY: "auto",
            padding: "2rem",
          }}
        >

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
                <Image
                  src={photo}
                  alt={`Foto de ${name}`}
                  fill
                  sizes="140px"
                  style={{ objectFit: "cover" }}
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
                lattes={lattes}
                orcid={orcid}
                scholar={scholar}
                arxiv={arxiv}
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

          {/* Botão fechar */}
          <MorphingDialogClose className="text-zinc-400" />

        </MorphingDialogContent>
      </MorphingDialogContainer>

    </MorphingDialog>
  );
}
