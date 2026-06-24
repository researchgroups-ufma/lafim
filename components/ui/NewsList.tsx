/**
 * NewsList — Lista interativa de notícias
 *
 * Client Component — precisa de "use client" para os useState de filtro,
 * paginação e expansão. Recebe as notícias já lidas/ordenadas pelo Server
 * Component (app/(site)/news/page.tsx).
 *
 * Comportamento:
 *   - Filtro por mês e ano da postagem (selects independentes)
 *   - Paginação: no máximo 10 notícias por página
 *   - Clique no título/resumo expande o texto integral na própria página
 *
 * Datas: o servidor já envia `dateFormatted` (pt-BR) para exibição e
 * `year`/`month` para filtro — este componente nunca importa lib/mdx (fs).
 *
 * Props:
 *   news — array de notícias serializáveis vindas do Server Component
 */

"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

type NewsItem = {
  slug: string;
  title: string;
  dateFormatted: string;
  year: number;
  month: number;
  category?: string;
  excerpt?: string;
  cover_image?: string;
  body?: string;
};

type NewsListProps = {
  news: NewsItem[];
};

const PER_PAGE = 10;

// Nomes dos meses em pt-BR — índice 1..12
const MONTH_NAMES = [
  "", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export default function NewsList({ news }: NewsListProps) {
  const [filterYear, setFilterYear] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Anos distintos presentes nas notícias, em ordem decrescente
  const years = useMemo(
    () => [...new Set(news.map((n) => n.year))].sort((a, b) => b - a),
    [news],
  );

  // Aplica os filtros de ano e mês
  const filtered = useMemo(
    () =>
      news.filter((n) => {
        if (filterYear !== "all" && n.year !== Number(filterYear)) return false;
        if (filterMonth !== "all" && n.month !== Number(filterMonth)) return false;
        return true;
      }),
    [news, filterYear, filterMonth],
  );

  // Paginação
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE,
  );

  // Troca de filtro sempre reinicia para a primeira página e fecha expansões
  function changeYear(value: string) {
    setFilterYear(value);
    setPage(1);
    setExpanded(null);
  }
  function changeMonth(value: string) {
    setFilterMonth(value);
    setPage(1);
    setExpanded(null);
  }
  function goToPage(p: number) {
    setPage(p);
    setExpanded(null);
  }

  return (
    <div>
      {/* ── Filtros de data ─────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: "2.5rem",
        }}
      >
        <select
          value={filterMonth}
          onChange={(e) => changeMonth(e.target.value)}
          aria-label="Filtrar por mês"
          style={selectStyle}
        >
          <option value="all">Todos os meses</option>
          {MONTH_NAMES.slice(1).map((name, i) => (
            <option key={i + 1} value={i + 1}>
              {name}
            </option>
          ))}
        </select>

        <select
          value={filterYear}
          onChange={(e) => changeYear(e.target.value)}
          aria-label="Filtrar por ano"
          style={selectStyle}
        >
          <option value="all">Todos os anos</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        {(filterMonth !== "all" || filterYear !== "all") && (
          <button
            type="button"
            onClick={() => {
              changeYear("all");
              changeMonth("all");
            }}
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
            Limpar filtros
          </button>
        )}
      </div>

      {/* ── Lista de notícias ───────────────────────────────────────────── */}
      {pageItems.length === 0 ? (
        <p style={{ color: "var(--color-text-subtle)" }}>
          Nenhuma notícia encontrada para este filtro.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {pageItems.map((item, index) => {
            const isOpen = expanded === item.slug;
            return (
              <div
                key={item.slug}
                style={{
                  display: "grid",
                  gridTemplateColumns: item.cover_image ? "1fr 200px" : "1fr",
                  gap: "2rem",
                  alignItems: "start",
                  padding: "2rem 0",
                  borderBottom: "1px solid var(--color-border)",
                  borderTop: index === 0 ? "1px solid var(--color-border)" : "none",
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
                    <span
                      style={{ fontSize: "0.8rem", color: "var(--color-text-subtle)" }}
                    >
                      {item.dateFormatted}
                    </span>
                  </div>

                  {/* Título + resumo — botão que expande/recolhe o texto integral */}
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : item.slug)}
                    aria-expanded={isOpen}
                    aria-controls={`news-body-${item.slug}`}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    <span
                      style={{
                        display: "block",
                        fontFamily: "var(--font-display)",
                        fontSize: "1.2rem",
                        fontWeight: 500,
                        color: "var(--color-text)",
                        marginBottom: "0.5rem",
                        lineHeight: 1.3,
                      }}
                    >
                      {item.title}
                    </span>

                    {item.excerpt && (
                      <span
                        style={{
                          display: "block",
                          fontSize: "0.9rem",
                          color: "var(--color-text-muted)",
                          fontWeight: 300,
                          lineHeight: 1.6,
                        }}
                      >
                        {item.excerpt}
                      </span>
                    )}

                    <span
                      style={{
                        display: "inline-block",
                        marginTop: "0.75rem",
                        fontSize: "0.8rem",
                        fontWeight: 400,
                        color: "var(--color-primary)",
                      }}
                    >
                      {isOpen ? "Ler menos ↑" : "Ler matéria completa ↓"}
                    </span>
                  </button>

                  {/* Texto integral — só renderiza quando expandido */}
                  {isOpen && item.body && (
                    <div
                      id={`news-body-${item.slug}`}
                      style={{
                        marginTop: "1.5rem",
                        paddingTop: "1.5rem",
                        borderTop: "1px solid var(--color-border)",
                        maxWidth: "680px",
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
                  )}
                </div>

                {/* Imagem de capa — só renderiza se existir */}
                {item.cover_image && (
                  <Image
                    src={item.cover_image}
                    alt={item.title}
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
              </div>
            );
          })}
        </div>
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
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            style={pageButtonStyle(false, currentPage === 1)}
          >
            ← Anterior
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => goToPage(p)}
              aria-current={p === currentPage ? "page" : undefined}
              style={pageButtonStyle(p === currentPage, false)}
            >
              {p}
            </button>
          ))}

          <button
            type="button"
            onClick={() => goToPage(currentPage + 1)}
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

// Estilo dos selects de filtro
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
