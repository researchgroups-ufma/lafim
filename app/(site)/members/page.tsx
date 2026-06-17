/**
 * page.tsx — Página Membros
 *
 * Server Component — lê todos os membros de content/members/ via getCollection()
 * e os distribui por grupo (role) para os componentes de exibição.
 *
 * Grupos exibidos em ordem:
 *   1. Coordenador        — bloco especial com bio expandida e links
 *   2. Equipe ativa       — Pesquisador Sênior, Pós-Doutorando, Doutorando,
 *                           Mestrando, Iniciação Científica
 *   3. Egressos           — lista com ano e instituição atual
 *   4. Colaboradores      — Colaborador Externo
 *
 * Os cards usam MorphingDialog (Motion Primitives) com bio completa
 * e links acadêmicos ao clicar.
 */

import { getCollection } from "@/lib/mdx";
import { siteConfig } from "@/lib/config";
import PageHeader from "@/components/ui/PageHeader";
import MemberCardModal from "@/components/ui/MemberCardModal";
import MemberLinks from "@/components/ui/MemberLinks";
import Image from "next/image";

// Plurais irregulares — os demais recebem "s" simples
const ROLE_PLURAL: Record<string, string> = {
  "Pesquisador Sênior": "Pesquisadores Sênior",
  "Iniciação Científica": "Iniciação Científica",
};

// Ordem de exibição dos grupos na página
const GROUP_ORDER = [
  "Pesquisador Sênior",
  "Pós-Doutorando",
  "Doutorando",
  "Mestrando",
  "Iniciação Científica",
];

export const metadata = {
  title: "Membros",
};

export default async function MembersPage() {
  const allMembers = await getCollection("members");

  // Remove o placeholder gerado pelo scaffolding
  const members = allMembers.filter((m) => m.slug !== "placeholder");

  // Separa os grupos
  const coordinator = members.find((m) => m.role === "Coordenador");
  const activeMembers = members.filter((m) => GROUP_ORDER.includes(m.role as string));
  const alumni = members.filter((m) => m.role === "Egresso");
  const collaborators = members.filter((m) => m.role === "Colaborador Externo");

  return (
    <div>

      <PageHeader title="Membros do laboratório" />

      <main>
        <div className="container-site">

          {/* ── Coordenador ─────────────────────────────────────────────────
              Bloco especial com foto, bio completa e links acadêmicos      */}
          {coordinator && (
            <section
              style={{
                padding: "4rem 0",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <h2 className="section-title" style={{ fontSize: "1.5rem" }}>
                Coordenador
              </h2>
              <span className="title-accent" />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "160px 1fr",
                  gap: "2.5rem",
                  alignItems: "start",
                }}
              >
                {/* Foto ou placeholder com inicial */}
                <figure style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  {(coordinator.photo as string | undefined) ? (
                    <Image
                      src={coordinator.photo as string}
                      alt={`Foto de ${coordinator.title as string}`}
                      width={160}
                      height={188}
                      style={{
                        aspectRatio: "0.85",
                        objectFit: "cover",
                        border: "1px solid var(--color-border-strong)",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "160px",
                        aspectRatio: "0.85",
                        backgroundColor: "var(--color-bg-elevated)",
                        border: "1px solid var(--color-border-strong)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span style={{ color: "var(--color-primary)", fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 600 }}>
                        {(coordinator.title as string).charAt(0)}
                      </span>
                    </div>
                  )}
                  <figcaption style={{ fontSize: "0.72rem", color: "var(--color-text-subtle)", textAlign: "center", marginTop: "0.5rem", fontStyle: "italic" }}>
                    {coordinator.title as string}
                  </figcaption>
                </figure>

                {/* Informações do coordenador */}
                <div>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 500, color: "var(--color-text)", marginBottom: "0.2rem" }}>
                    {coordinator.title as string}
                  </p>
                  <p style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-primary)", marginBottom: "1.25rem" }}>
                    Coordenador · {siteConfig.acronym}
                  </p>

                  {/* Bio — parágrafos separados por linha em branco no frontmatter */}
                  <div style={{ marginBottom: "1.25rem" }}>
                    {typeof coordinator.bio === "string" && coordinator.bio.split("\n\n").map((p) => (
                      <p key={p} style={{ fontSize: "0.92rem", lineHeight: 1.8, color: "var(--color-text-muted)", fontWeight: 300, marginBottom: "0.85rem" }}>
                        {p}
                      </p>
                    ))}
                  </div>

                  {/* Links acadêmicos em ícones — só renderiza se o campo existir */}
                  <MemberLinks
                    email={coordinator.email as string | undefined}
                    linkedin={coordinator.linkedin as string | undefined}
                    lattes={coordinator.lattes as string | undefined}
                    orcid={coordinator.orcid as string | undefined}
                    scholar={coordinator.scholar as string | undefined}
                    arxiv={coordinator.arxiv as string | undefined}
                  />
                </div>
              </div>
            </section>
          )}

          {/* ── Membros ativos agrupados por role ───────────────────────────
              Renderiza um grupo por vez seguindo GROUP_ORDER
              Cada card usa MemberCardModal — clicável com modal de detalhes */}
          {GROUP_ORDER.some((role) => activeMembers.some((m) => m.role === role)) && (
            <section style={{ padding: "4rem 0", borderBottom: "1px solid var(--color-border)" }}>
              <h2 className="section-title" style={{ fontSize: "1.5rem" }}>
                Equipe
              </h2>
              <span className="title-accent" />

              {GROUP_ORDER.map((role) => {
                const group = activeMembers.filter((m) => m.role === role);
                if (group.length === 0) return null;

                return (
                  <div key={role} style={{ marginBottom: "2.5rem" }}>
                    {/* Label do grupo — ex: "Doutorandos" */}
                    <p className="group-label">{ROLE_PLURAL[role] ?? `${role}s`}</p>

                    {/* Grid de cards clicáveis */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 240px))",
                        gap: "1px",
                        backgroundColor: "var(--color-border)",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      {group.map((member) => (
                        <MemberCardModal
                          key={member.slug}
                          name={member.title as string}
                          role={member.role as string}
                          research_area={member.research_area as string | undefined}
                          scholarship={member.scholarship as string | undefined}
                          year_start={member.year_start as string | undefined}
                          bio={member.bio as string | undefined}
                          photo={member.photo as string | undefined}
                          email={member.email as string | undefined}
                          linkedin={member.linkedin as string | undefined}
                          lattes={member.lattes as string | undefined}
                          orcid={member.orcid as string | undefined}
                          scholar={member.scholar as string | undefined}
                          arxiv={member.arxiv as string | undefined}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </section>
          )}

          {/* ── Egressos ────────────────────────────────────────────────────
              Lista com nome, nível, tema e ano de conclusão               */}
          {alumni.length > 0 && (
            <section style={{ padding: "4rem 0", borderBottom: "1px solid var(--color-border)" }}>
              <h2 className="section-title" style={{ fontSize: "1.5rem" }}>Egressos</h2>
              <span className="title-accent" />

              <div>
                {alumni.map((member, index) => (
                  <div
                    key={member.slug}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      gap: "1rem",
                      alignItems: "baseline",
                      padding: "0.75rem 0",
                      borderBottom: "1px solid var(--color-border)",
                      borderTop: index === 0 ? "1px solid var(--color-border)" : "none",
                    }}
                  >
                    <div>
                      <p style={{ fontFamily: "var(--font-display)", fontSize: "1rem", color: "var(--color-text)" }}>
                        {member.title as string}
                      </p>
                      <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", fontWeight: 300 }}>
                        {member.role as string}
                        {(member.research_area as string | undefined) && ` · ${member.research_area as string}`}
                        {(member.current_institution as string | undefined) && (
                          <em> · {member.current_institution as string}</em>
                        )}
                      </p>
                    </div>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-subtle)", whiteSpace: "nowrap" }}>
                      {member.year_end as string}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Colaboradores externos ───────────────────────────────────────
              Grid 2 colunas com nome e instituição                        */}
          {collaborators.length > 0 && (
            <section style={{ padding: "4rem 0" }}>
              <h2 className="section-title" style={{ fontSize: "1.5rem" }}>
                Colaboradores externos
              </h2>
              <span className="title-accent" />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                {collaborators.map((member) => (
                  <div
                    key={member.slug}
                    style={{
                      padding: "1rem 1.25rem",
                      border: "1px solid var(--color-border-strong)",
                      backgroundColor: "var(--color-bg-elevated)",
                    }}
                  >
                    <p style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 500, color: "var(--color-text)", marginBottom: "0.15rem" }}>
                      {member.title as string}
                    </p>
                    <p style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", fontWeight: 300 }}>
                      {member.affiliation as string}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </main>
    </div>
  );
}
