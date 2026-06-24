/**
 * NewsList — Lista interativa de notícias
 *
 * Client Component — precisa de "use client" para os useState de filtro e
 * paginação. Recebe as notícias já lidas/ordenadas pelo Server Component
 * (app/(site)/news/page.tsx) e delega cada item ao NewsCard, que abre o
 * Morphing Dialog com o texto integral e o carrossel de imagens.
 *
 * Comportamento:
 *   - Filtro por mês e ano da postagem (selects independentes)
 *   - Paginação: no máximo 10 notícias por página
 *
 * Datas: o servidor já envia `dateFormatted` (pt-BR) para exibição e
 * `year`/`month` para filtro — este componente nunca importa lib/mdx (fs).
 *
 * Props:
 *   news — array de notícias serializáveis vindas do Server Component
 */

"use client";

import { useMemo, useState } from "react";
import NewsCard, { type NewsItem } from "@/components/ui/NewsCard";

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

  // Troca de filtro sempre reinicia para a primeira página
  function changeYear(value: string) {
    setFilterYear(value);
    setPage(1);
  }
  function changeMonth(value: string) {
    setFilterMonth(value);
    setPage(1);
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
          {pageItems.map((item, index) => (
            <NewsCard key={item.slug} item={item} isFirst={index === 0} />
          ))}
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
