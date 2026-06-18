/**
 * page.tsx — Página Linhas de Pesquisa
 *
 * Server Component — lê todas as linhas de pesquisa de content/research/
 * via getCollection() e exibe em grid com borda lateral âmbar.
 * Ao clicar em uma linha, exibe a descrição completa abaixo.
 */

import { getCollection } from "@/lib/mdx";
import PageHeader from "@/components/ui/PageHeader";
import Image from "next/image";

export const metadata = { title: "Pesquisa" };

export default async function ResearchPage() {
  const allResearch = await getCollection("research");

  // Remove o placeholder gerado pelo scaffolding
  const lines = allResearch.filter((r) => r.slug !== "placeholder");

  return (
    <div>
      <PageHeader title="Linhas de Pesquisa" />

      <main>
        <div className="container-site">

          {/* ── Introdução ─────────────────────────────────────────────────── */}
          <section style={{ padding: "4rem 0", borderBottom: "1px solid var(--color-border)" }}>
            <p
              style={{
                fontSize: "1rem",
                lineHeight: 1.8,
                color: "var(--color-text-muted)",
                fontWeight: 300,
                maxWidth: "720px",
                marginBottom: "3rem",
              }}
            >
              Desenvolvemos pesquisa de fronteira em física da matéria condensada,
              nanomateriais e supercondutividade. Nosso trabalho combina abordagens
              teóricas, experimentais e computacionais.
            </p>

            {/* ── Grid de linhas ──────────────────────────────────────────── */}
            {lines.length === 0 ? (
              <p style={{ color: "var(--color-text-subtle)" }}>
                Nenhuma linha de pesquisa cadastrada ainda.
              </p>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "3rem",
                }}
              >
                {lines.map((line, index) => (
                  <div
                    key={line.slug}
                    className="stack-mobile"
                    style={{
                      display: "grid",
                      gridTemplateColumns: line.image ? "1fr 280px" : "1fr",
                      gap: "2.5rem",
                      alignItems: "start",
                      paddingBottom: "3rem",
                      borderBottom: index < lines.length - 1
                        ? "1px solid var(--color-border)"
                        : "none",
                    }}
                  >
                    {/* Conteúdo textual */}
                    <div>
                      {/* Borda lateral âmbar + título */}
                      <div
                        style={{
                          borderLeft: "3px solid var(--color-primary)",
                          paddingLeft: "1.25rem",
                          marginBottom: "1.5rem",
                        }}
                      >
                        <h2
                          style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "1.3rem",
                            fontWeight: 500,
                            color: "var(--color-text)",
                          }}
                        >
                          {line.title as string}
                        </h2>
                      </div>

                      {/* Descrição completa — renderiza o body como texto simples */}
                      {(line.body as string | undefined) && (
                        <p
                          style={{
                            fontSize: "0.95rem",
                            lineHeight: 1.8,
                            color: "var(--color-text-muted)",
                            fontWeight: 300,
                          }}
                        >
                          {line.body as string}
                        </p>
                      )}
                    </div>

                    {/* Imagem — só renderiza se existir */}
                    {(line.image as string | undefined) && (
                      <figure>
                        <Image
                          src={line.image as string}
                          alt={line.title as string}
                          width={280}
                          height={210}
                          style={{
                            width: "100%",
                            height: "auto",
                            border: "1px solid var(--color-border-strong)",
                          }}
                        />
                      </figure>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}
