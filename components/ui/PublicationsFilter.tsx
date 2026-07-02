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
 *   - Select de ano filtra por ano de publicação (combina com o filtro de tag)
 *   - Paginação: no máximo 10 publicações por página
 *   - Publicações com featured: true recebem badge dourado
 *
 * Nota: publicações só têm `year` (sem mês), por isso o filtro é apenas por ano
 * — diferente das notícias, que têm data completa e filtram também por mês.
 *
 * Props:
 *   publications — array de publicações lidas de content/publications/
 */

"use client";

import { useMemo, useState } from "react";

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

const PER_PAGE = 10;

export default function PublicationsFilter({ publications }: PublicationsFilterProps) {
  // Filtro de tag ativo — "all" por padrão
  const [activeFilter, setActiveFilter] = useState("all");
  // Filtro de ano — "all" por padrão
  const [filterYear, setFilterYear] = useState("all");
  const [page, setPage] = useState(1);

  // Anos distintos presentes nas publicações, em ordem decrescente
  const allYears = useMemo(
    () => [...new Set(publications.map((p) => p.year))].sort((a, b) => b - a),
    [publications],
  );

  // Filtra por tag e por ano, depois ordena por ano (mais recente primeiro).
  // O sort estável preserva a ordem original dentro de cada ano.
  const filtered = useMemo(
    () =>
      publications
        .filter((pub) => {
          if (activeFilter !== "all" && !(pub.tags || []).includes(activeFilter)) return false;
          if (filterYear !== "all" && pub.year !== Number(filterYear)) return false;
          return true;
        })
        .sort((a, b) => b.year - a.year),
    [publications, activeFilter, filterYear],
  );

  // Paginação
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE,
  );

  // Agrupa apenas os itens da página atual por ano (mantém os cabeçalhos de ano)
  const byYear = pageItems.reduce<Record<number, Publication[]>>((acc, pub) => {
    if (!acc[pub.year]) acc[pub.year] = [];
    acc[pub.year].push(pub);
    return acc;
  }, {});

  // Anos presentes na página atual, em ordem decrescente
  const years = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => b - a);

  // Trocar qualquer filtro reinicia para a primeira página
  function changeFilter(value: string) {
    setActiveFilter(value);
    setPage(1);
  }
  function changeYear(value: string) {
    setFilterYear(value);
    setPage(1);
  }

  return (
    <div>

      {/* ── Barra de filtros ──────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center", marginBottom: "2rem" }}>
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => changeFilter(filter.value)}
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
              transition: "border-color 0.15s ease, background-color 0.15s ease, color 0.15s ease",
            }}
          >
            {filter.label}
          </button>
        ))}

        {/* Filtro de ano */}
        <select
          value={filterYear}
          onChange={(e) => changeYear(e.target.value)}
          aria-label="Filtrar por ano"
          style={selectStyle}
        >
          <option value="all">Todos os anos</option>
          {allYears.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        {filterYear !== "all" && (
          <button
            type="button"
            onClick={() => changeYear("all")}
            style={{
              fontSize: "0.8rem",
              color: "var(--color-text-subtle)",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              textDecoration: "underline",
            }}
          >
            Limpar filtro de ano
          </button>
        )}
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

      {/* ── Paginação ───────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
            alignItems: "center",
            marginTop: "2.5rem",
          }}
        >
          <button
            type="button"
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage === 1}
            style={pageButtonStyle(false, currentPage === 1)}
          >
            ← Anterior
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              aria-current={p === currentPage ? "page" : undefined}
              style={pageButtonStyle(p === currentPage, false)}
            >
              {p}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={pageButtonStyle(false, currentPage === totalPages)}
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  );
}

// Estilo do select de filtro de ano — espelha o da página de notícias
const selectStyle: React.CSSProperties = {
  fontSize: "0.85rem",
  fontFamily: "var(--font-body)",
  color: "var(--color-text-muted)",
  backgroundColor: "var(--color-bg-elevated)",
  border: "1px solid var(--color-border-strong)",
  padding: "0.4rem 0.75rem",
  cursor: "pointer",
};

// Estilo dos botões de paginação — ativo segue o padrão âmbar do site
function pageButtonStyle(active: boolean, disabled: boolean): React.CSSProperties {
  return {
    fontSize: "0.8rem",
    fontWeight: 400,
    fontFamily: "var(--font-body)",
    padding: "0.3rem 0.8rem",
    border: "1px solid",
    borderColor: active ? "var(--color-primary)" : "var(--color-border-strong)",
    backgroundColor: active ? "var(--color-primary)" : "var(--color-bg-elevated)",
    color: active ? "var(--color-bg-elevated)" : "var(--color-text-muted)",
    cursor: disabled ? "default" : "pointer",
    opacity: disabled ? 0.4 : 1,
    transition: "border-color 0.15s ease, background-color 0.15s ease, color 0.15s ease",
  };
}
