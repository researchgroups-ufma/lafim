/**
 * AboutPage.tsx — Conteúdo da página Sobre, parametrizado por locale
 *
 * Server Component — lê o conteúdo institucional de content/about/index.md
 * (ou index.en.md) via getSingleFile() e exibe missão e histórico do
 * laboratório. about fica fora do i18n do Decap (dois arquivos separados) —
 * se o EN não tiver body/mission (não traduzido), cai no PT.
 */

import { getSingleFile } from "@/lib/mdx";
import { siteConfig } from "@/lib/config";
import PageHeader from "@/components/ui/PageHeader";
import { getDictionary, type Locale } from "@/lib/i18n";

export default async function AboutPage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const aboutFile = locale === "en" ? "about/index.en.md" : "about/index.md";
  let about = await getSingleFile(aboutFile);
  if (locale === "en" && !about.body && !about.mission) {
    about = await getSingleFile("about/index.md");
  }

  return (
    <div>
      <PageHeader title={dict.about.title} />

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
                {dict.about.mission}
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
                {dict.about.history}
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
              {dict.about.institutional}
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
