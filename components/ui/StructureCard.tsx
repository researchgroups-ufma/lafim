/**
 * StructureCard — Card de membro da estrutura do laboratório
 *
 * Estado fechado: foto, nome, função e linha de pesquisa.
 * Ao clicar: abre modal com foto maior, bio completa e links acadêmicos.
 *
 * Fase 4: o modal será substituído pelo Morphing Dialog do Motion Primitives,
 * mantendo a mesma interface de props — nenhum código externo precisará mudar.
 *
 * Props:
 *   name          — nome completo do membro (obrigatório)
 *   role          — função no laboratório (obrigatório)
 *   bio           — biografia completa (opcional)
 *   photo         — caminho da foto em /uploads/ (opcional)
 *   research_area — linha de pesquisa (opcional)
 *   email         — e-mail institucional (opcional)
 *   linkedin      — URL do LinkedIn (opcional)
 *   lattes        — URL do Lattes (opcional)
 *   orcid         — URL do ORCID (opcional)
 *   scholar       — URL do Google Scholar (opcional)
 *   arxiv         — URL do arXiv (opcional)
 */

"use client";

import Image from "next/image";
import { useState } from "react";
import MemberLinks from "@/components/ui/MemberLinks";

type StructureCardProps = {
  name: string;
  role: string;
  bio?: string;
  photo?: string;
  research_area?: string;
  email?: string;
  linkedin?: string;
  lattes?: string;
  orcid?: string;
  scholar?: string;
  arxiv?: string;
};

export default function StructureCard({
  name, role, bio, photo, research_area, email, linkedin, lattes, orcid, scholar, arxiv,
}: StructureCardProps) {
  // Controla se o modal de detalhes está aberto
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ── Card fechado ──────────────────────────────────────────────────── */}
      <div
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        role="button"
        tabIndex={0}
        style={{
          cursor: "pointer",
          backgroundColor: "var(--color-bg-elevated)",
          border: "1px solid var(--color-border-strong)",
          borderRadius: "0.5rem",
          overflow: "hidden",
          transition: "border-color 0.2s ease",
        }}
        className="structure-card"
      >
        {/* Foto ou placeholder com inicial */}
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "1 / 1",
            backgroundColor: "var(--color-bg-subtle)",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {photo ? (
            <Image
              src={photo}
              alt={`Foto de ${name}`}
              fill
              sizes="(max-width: 768px) 100vw, 240px"
              style={{ objectFit: "cover" }}
            />
          ) : (
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "2.5rem",
                fontWeight: 600,
                color: "var(--color-primary)",
              }}
            >
              {name.charAt(0)}
            </span>
          )}
        </div>

        {/* Informações básicas */}
        <div style={{ padding: "1.25rem" }}>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
              fontWeight: 500,
              color: "var(--color-text)",
              marginBottom: "0.25rem",
            }}
          >
            {name}
          </p>
          <p style={{ fontSize: "0.8rem", color: "var(--color-primary)", marginBottom: "0.25rem" }}>
            {role}
          </p>
          {research_area && (
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-subtle)" }}>
              {research_area}
            </p>
          )}
          {/* Indicador de que há mais informações */}
          <p style={{ fontSize: "0.7rem", color: "var(--color-text-subtle)", marginTop: "0.75rem" }}>
            Ver perfil →
          </p>
        </div>
      </div>

      {/* ── Modal de detalhes ─────────────────────────────────────────────── */}
      {open && (
        <>
          {/* Overlay escuro — clique fora fecha o modal */}
          <div
            onClick={() => setOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
                setOpen(false);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Fechar"
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.75)",
              zIndex: 200,
            }}
          />

          {/* Conteúdo do modal */}
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 201,
              backgroundColor: "var(--color-bg-elevated)",
              border: "1px solid var(--color-border-strong)",
              borderRadius: "0.75rem",
              width: "min(600px, 90vw)",
              maxHeight: "85vh",
              overflowY: "auto",
              padding: "2rem",
            }}
          >
            {/* Botão fechar */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "none",
                border: "none",
                color: "var(--color-text-muted)",
                fontSize: "1.25rem",
                cursor: "pointer",
                lineHeight: 1,
              }}
              aria-label="Fechar"
            >
              ✕
            </button>

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
              {/* Foto maior */}
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
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.3rem",
                    fontWeight: 500,
                    color: "var(--color-text)",
                    marginBottom: "0.2rem",
                  }}
                >
                  {name}
                </p>
                <p style={{ fontSize: "0.8rem", color: "var(--color-primary)", marginBottom: "0.2rem" }}>
                  {role}
                </p>
                {research_area && (
                  <p style={{ fontSize: "0.8rem", color: "var(--color-text-subtle)", marginBottom: "1rem" }}>
                    {research_area}
                  </p>
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
            )}
          </div>
        </>
      )}
    </>
  );
}
