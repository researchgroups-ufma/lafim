/**
 * page.tsx — Página Contato
 *
 * Exibe as informações de contato do laboratório lidas de lib/config.ts.
 * Também exibe o coordenador com links acadêmicos se estiver cadastrado.
 */

import { getCollection } from "@/lib/mdx";
import { siteConfig } from "@/lib/config";
import PageHeader from "@/components/ui/PageHeader";
import MemberLinks from "@/components/ui/MemberLinks";

export const metadata = { title: "Contato" };

export default async function ContactPage() {
  const allMembers = await getCollection("members");
  const coordinator = allMembers.find((m) => m.role === "Coordenador");

  return (
    <div>
      <PageHeader title="Contato" />

      <main>
        <div className="container-site">
          <section style={{ padding: "4rem 0" }}>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "4rem",
                alignItems: "start",
              }}
            >

              {/* ── Informações institucionais ──────────────────────────────── */}
              <div>
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.1rem",
                    fontWeight: 500,
                    color: "var(--color-text)",
                    marginBottom: "1.5rem",
                  }}
                >
                  Informações
                </h2>

                {/* Grid de label + valor */}
                <dl
                  style={{
                    display: "grid",
                    gridTemplateColumns: "90px 1fr",
                    gap: "0.6rem 1rem",
                    fontSize: "0.9rem",
                  }}
                >
                  <dt style={{ fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--color-text-subtle)", paddingTop: "0.1rem" }}>
                    Local
                  </dt>
                  <dd style={{ color: "var(--color-text-muted)", fontWeight: 300, lineHeight: 1.6 }}>
                    {siteConfig.department}<br />
                    {siteConfig.university}<br />
                    {siteConfig.location}
                  </dd>

                  <dt style={{ fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--color-text-subtle)", paddingTop: "0.1rem" }}>
                    Email
                  </dt>
                  <dd>
                    <a
                      href={`mailto:${siteConfig.email}`}
                      style={{ color: "var(--color-primary)", fontSize: "0.9rem" }}
                    >
                      {siteConfig.email}
                    </a>
                  </dd>

                  {/* Links do coordenador se disponíveis — ícones SVG */}
                  {coordinator && (coordinator.lattes as string | undefined) && (
                    <>
                      <dt style={{ fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--color-text-subtle)", paddingTop: "0.1rem" }}>
                        Lattes
                      </dt>
                      <dd>
                        <MemberLinks lattes={coordinator.lattes as string} />
                      </dd>
                    </>
                  )}
                </dl>
              </div>

              {/* ── Oportunidades ───────────────────────────────────────────── */}
              <div>
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.1rem",
                    fontWeight: 500,
                    color: "var(--color-text)",
                    marginBottom: "1rem",
                  }}
                >
                  Oportunidades
                </h2>
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "var(--color-text-muted)",
                    fontWeight: 300,
                    lineHeight: 1.75,
                    marginBottom: "1.5rem",
                  }}
                >
                  Interessado em ingressar no grupo como aluno de IC, mestrando
                  ou doutorando? Trabalhamos com bolsas CAPES, CNPq e FAPEMA.
                  Entre em contato pelo e-mail institucional.
                </p>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="pill-link"
                  style={{ display: "inline-block" }}
                >
                  Enviar e-mail →
                </a>
              </div>

            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
