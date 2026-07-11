/**
 * PublicationsPage.tsx — Conteúdo da página Publicações, parametrizado por locale
 *
 * Server Component — lê todas as publicações de content/publications/
 * e passa para o PublicationsFilter (Client Component) que gerencia
 * os filtros interativos.
 *
 * Seções:
 *   1. Page Header
 *   2. Texto introdutório com links externos
 *   3. PublicationsFilter — filtros + lista agrupada por ano
 *   4. Teses e dissertações (filtradas por type: "Tese" ou "Dissertação")
 */

import { getCollection } from "@/lib/mdx";
import { siteConfig } from "@/lib/config";
import PublicationsFilter from "@/components/ui/PublicationsFilter";
import PageHeader from "@/components/ui/PageHeader";
import { getDictionary, type Locale } from "@/lib/i18n";

export default async function PublicationsPage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const allPublications = await getCollection("publications");

  // Remove o placeholder gerado pelo scaffolding
  const publications = allPublications.filter((p) => p.slug !== "placeholder");

  // Separa artigos/preprints de teses e dissertações
  const papers = publications.filter(
    (p) => p.type !== "Tese" && p.type !== "Dissertação"
  ) as {
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
  }[];

  const theses = publications.filter(
    (p) => p.type === "Tese" || p.type === "Dissertação"
  );

  return (
    <div>

      <PageHeader title={dict.publications.title} />

      <main>
        <div className="container-site">
          <section style={{ padding: "4rem 0", borderBottom: "1px solid var(--color-border)" }}>

            {/* Texto introdutório com links externos */}
            <p
              style={{
                fontSize: "0.92rem",
                color: "var(--color-text-muted)",
                fontWeight: 300,
                lineHeight: 1.75,
                marginBottom: "2rem",
                maxWidth: "700px",
              }}
            >
              {dict.publications.intro}{" "}
              {/* TODO: substituir pelos links reais do coordenador */}
              <a href="https://lattes.cnpq.br/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary)" }}>
                {dict.publications.introLattes}
              </a>
              ,{" "}
              <a href="https://scholar.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary)" }}>
                {dict.publications.introScholar}
              </a>{" "}
              e{" "}
              <a href="https://arxiv.org/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-primary)" }}>
                {dict.publications.introArxiv}
              </a>
              .
            </p>

            {/* Filtros + lista — Client Component */}
            <PublicationsFilter publications={papers} strings={dict.publications} typeLabels={dict.pubTypes} />

          </section>

          {/* ── Teses e dissertações ──────────────────────────────────────── */}
          {theses.length > 0 && (
            <section style={{ padding: "4rem 0" }}>
              <h2 className="section-title" style={{ fontSize: "1.5rem" }}>
                {dict.publications.theses}
              </h2>
              <span className="title-accent" />

              {theses
                .sort((a, b) => ((b.year as number) || 0) - ((a.year as number) || 0))
                .map((thesis) => (
                  <div
                    key={thesis.slug}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      gap: "1.5rem",
                      alignItems: "start",
                      padding: "1.2rem 0",
                      borderBottom: "1px solid var(--color-border)",
                    }}
                  >
                    <div>
                      <p style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", fontWeight: 500, color: "var(--color-text)", marginBottom: "0.25rem" }}>
                        {thesis.title as string}
                      </p>
                      <p style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", fontWeight: 300 }}>
                        {thesis.authors as string} · {dict.pubTypes[thesis.type as string] ?? (thesis.type as string)}
                      </p>
                      <p style={{ fontSize: "0.82rem", fontStyle: "italic", color: "var(--color-text-subtle)" }}>
                        {siteConfig.university}, {thesis.year as number}
                      </p>
                    </div>
                    {/* Link para PDF ou DOI se disponível */}
                    {(thesis.doi as string | undefined) && (
                      <div style={{ flexShrink: 0 }}>
                        <a
                          href={`https://doi.org/${thesis.doi as string}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pill-link"
                        >
                          {dict.publications.pdf}
                        </a>
                      </div>
                    )}
                  </div>
                ))}
            </section>
          )}

        </div>
      </main>
    </div>
  );
}
