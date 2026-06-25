/**
 * page.tsx — Página Sobre
 *
 * Server Component — lê o conteúdo institucional de content/about/index.md
 * via getSingleFile() e exibe missão e histórico do laboratório.
 */

import { getSingleFile } from "@/lib/mdx";
import { siteConfig } from "@/lib/config";
import PageHeader from "@/components/ui/PageHeader";

export const metadata = { title: "Sobre", alternates: { canonical: "/about" } };

export default async function AboutPage() {
  const about = await getSingleFile("about/index.md");

  return (
    <div>
      <PageHeader title="Sobre o Laboratório" />

      <main>
        <div className="container-site">

          {/* ── Missão ─────────────────────────────────────────────────────── */}
          {(about.mission as string | undefined) && (
            <section
              style={{
                padding: "4rem 0",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <h2 className="section-title" style={{ fontSize: "1.5rem" }}>
                Missão
              </h2>
              <span className="title-accent" />
              <p
                style={{
                  fontSize: "1.05rem",
                  lineHeight: 1.8,
                  color: "var(--color-text-muted)",
                  fontWeight: 300,
                  maxWidth: "720px",
                  borderLeft: "3px solid var(--color-primary)",
                  paddingLeft: "1.5rem",
                  fontStyle: "italic",
                }}
              >
                {about.mission as string}
              </p>
            </section>
          )}

          {/* ── Histórico ──────────────────────────────────────────────────── */}
          {(about.body as string | undefined) && (
            <section style={{ padding: "4rem 0", borderBottom: "1px solid var(--color-border)" }}>
              <h2 className="section-title" style={{ fontSize: "1.5rem" }}>
                Histórico
              </h2>
              <span className="title-accent" />
              <div style={{ maxWidth: "720px" }}>
                {(about.body as string).split("\n\n").map((paragraph) => (
                  <p
                    key={paragraph}
                    style={{
                      fontSize: "0.97rem",
                      lineHeight: 1.85,
                      color: "var(--color-text-muted)",
                      fontWeight: 300,
                      marginBottom: "1.1rem",
                    }}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          )}

          {/* ── Vínculo institucional ──────────────────────────────────────── */}
          <section style={{ padding: "4rem 0" }}>
            <h2 className="section-title" style={{ fontSize: "1.5rem" }}>
              Vínculo Institucional
            </h2>
            <span className="title-accent" />
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <p style={{ fontSize: "0.95rem", color: "var(--color-text-muted)" }}>
                {siteConfig.name}
              </p>
              <p style={{ fontSize: "0.95rem", color: "var(--color-text-muted)" }}>
                {siteConfig.department}
              </p>
              <p style={{ fontSize: "0.95rem", color: "var(--color-text-muted)" }}>
                {siteConfig.university}
              </p>
              <p style={{ fontSize: "0.95rem", color: "var(--color-text-muted)" }}>
                {siteConfig.location}
              </p>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
