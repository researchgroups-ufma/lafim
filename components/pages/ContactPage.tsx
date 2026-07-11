/**
 * ContactPage.tsx — Conteúdo da página Contato, parametrizado por locale
 *
 * Exibe as informações de contato do laboratório lidas de lib/config.ts.
 * Também exibe o coordenador com links acadêmicos se estiver cadastrado.
 */

import { getCollection } from "@/lib/mdx";
import { siteConfig } from "@/lib/config";
import PageHeader from "@/components/ui/PageHeader";
import MemberLinks from "@/components/ui/MemberLinks";
import { getDictionary, type Locale } from "@/lib/i18n";

export default async function ContactPage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const allMembers = await getCollection("members", locale);
  const coordinator = allMembers.find((m) => m.role === "Coordenador");

  return (
    <div>
      <PageHeader title={dict.contact.title} />

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
                  {dict.contact.info}
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
                    {dict.contact.local}
                  </dt>
                  <dd style={{ color: "var(--color-text-muted)", fontWeight: 300, lineHeight: 1.6 }}>
                    {siteConfig.department}<br />
                    {siteConfig.university}<br />
                    {siteConfig.location}
                  </dd>

                  <dt style={{ fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--color-text-subtle)", paddingTop: "0.1rem" }}>
                    {dict.contact.email}
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
                        {dict.contact.lattes}
                      </dt>
                      <dd>
                        <MemberLinks lattes={coordinator.lattes as string} locale={locale} />
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
                  {dict.contact.opportunities}
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
                  {dict.contact.opportunitiesText}
                </p>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="pill-link"
                  style={{ display: "inline-block" }}
                >
                  {dict.contact.sendEmail}
                </a>
              </div>

            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
