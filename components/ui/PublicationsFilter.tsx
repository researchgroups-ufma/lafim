/**
 * PublicationsFilter — Barra de filtros e lista de publicações
 *
 * Client Component — precisa de "use client" para o useState dos filtros.
 *
 * Recebe todas as publicações como prop (lidas no Server Component page.tsx)
 * e filtra/exibe conforme o botão ativo.
 *
 * Comportamento:
 *   - Botão "Todas" mostra todas as publicações
 *   - Demais botões filtram por tag (campo tags no frontmatter)
 *   - Anos sem publicações visíveis são ocultados automaticamente
 *   - Publicações com featured: true recebem badge dourado
 *
 * Props:
 *   publications — array de publicações lidas de content/publications/
 */

"use client";

import { useState } from "react";

type Publication = {
  slug: string;
  title: string;
  authors: string;
  year: number;
  journal?: string;
  doi?: string;
  arxiv?: string;
  type: string;
  research_area?: string;
  tags?: string[];
  featured?: boolean;
};

type PublicationsFilterProps = {
  publications: Publication[];
};

// Filtros disponíveis — label exibido e valor que deve estar no campo tags
const FILTERS = [
  { label: "Todas",         value: "all" },
  { label: "Mat. Condensada", value: "mat" },
  { label: "Supercondutividade", value: "supercond" },
  { label: "Nanomateriais", value: "nano" },
  { label: "Computacional", value: "comp" },
];

export default function PublicationsFilter({ publications }: PublicationsFilterProps) {
  // Filtro ativo — "all" por padrão
  const [activeFilter, setActiveFilter] = useState("all");

  // Filtra as publicações pelo filtro ativo
  const filtered = publications.filter((pub) => {
    if (activeFilter === "all") return true;
    return (pub.tags || []).includes(activeFilter);
  });

  // Agrupa as publicações filtradas por ano em ordem decrescente
  const byYear = filtered.reduce<Record<number, Publication[]>>((acc, pub) => {
    if (!acc[pub.year]) acc[pub.year] = [];
    acc[pub.year].push(pub);
    return acc;
  }, {});

  // Anos em ordem decrescente (mais recente primeiro)
  const years = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div>

      {/* ── Barra de filtros ──────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "2rem" }}>
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            aria-pressed={activeFilter === filter.value}
            style={{
              fontSize: "0.75rem",
              fontWeight: 400,
              padding: "0.3rem 0.9rem",
              border: "1px solid",
              borderColor: activeFilter === filter.value
                ? "var(--color-primary)"
                : "var(--color-border-strong)",
              backgroundColor: activeFilter === filter.value
                ? "var(--color-primary)"    /* ativo — fundo âmbar            */
                : "var(--color-bg-elevated)", /* inativo — fundo elevado      */
              color: activeFilter === filter.value
                ? "var(--color-bg-elevated)" /* texto claro sobre charcoal    */
                : "var(--color-text-muted)",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              transition: "all 0.15s ease",
            }}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* ── Lista de publicações agrupada por ano ─────────────────────────── */}
      {years.length === 0 ? (
        <p style={{ color: "var(--color-text-subtle)", fontSize: "0.9rem" }}>
          Nenhuma publicação encontrada para este filtro.
        </p>
      ) : (
        years.map((year) => (
          <div key={year} style={{ marginBottom: "1rem" }}>

            {/* Cabeçalho do ano */}
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.2rem",
                fontWeight: 400,
                color: "var(--color-text)",
                margin: "2.5rem 0 0",
                paddingBottom: "0.4rem",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              {year}
            </h3>

            {/* Publicações do ano */}
            {byYear[year].map((pub) => (
              <div
                key={pub.slug}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: "1.5rem",
                  alignItems: "start",
                  padding: "1.2rem 0",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                {/* Lado esquerdo — dados da publicação */}
                <div>

                  {/* Título */}
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.05rem",
                      fontWeight: 500,
                      color: "var(--color-text)",
                      lineHeight: 1.35,
                      marginBottom: "0.25rem",
                    }}
                  >
                    {pub.title}
                  </p>

                  {/* Autores */}
                  <p style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", fontWeight: 300, lineHeight: 1.5, marginBottom: "0.2rem" }}>
                    {pub.authors}
                  </p>

                  {/* Periódico */}
                  {pub.journal && (
                    <p style={{ fontSize: "0.82rem", fontStyle: "italic", color: "var(--color-primary-muted)" }}>
                      {pub.journal}
                    </p>
                  )}

                  {/* Tags e badge de destaque */}
                  <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                    {pub.featured && (
                      <span className="badge badge-primary">Destaque</span>
                    )}
                    {pub.type && (
                      <span className="badge badge-muted">{pub.type}</span>
                    )}
                    {(pub.tags || []).map((tag) => (
                      <span key={tag} className="badge badge-muted">{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Lado direito — links */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", alignItems: "flex-end", flexShrink: 0 }}>
                  {pub.arxiv && (
                    <a
                      href={`https://arxiv.org/abs/${pub.arxiv}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pill-link"
                    >
                      arXiv ↗
                    </a>
                  )}
                  {pub.doi && (
                    <a
                      href={`https://doi.org/${pub.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pill-link"
                    >
                      DOI ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
