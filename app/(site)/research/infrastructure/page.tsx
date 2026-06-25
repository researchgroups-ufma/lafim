/**
 * page.tsx — Página Infraestrutura
 *
 * Rota: /research/infrastructure
 *
 * Server Component — lê o texto introdutório de content/equipment/index.md
 * e os equipamentos de content/equipment/ via getCollection().
 * Exibe grid de cards com modal de detalhes ao clicar (EquipmentCard).
 *
 * Fase 4: os cards receberão Morphing Dialog do Motion Primitives.
 */

import { getCollection, getSingleFile } from "@/lib/mdx";
import PageHeader from "@/components/ui/PageHeader";
import EquipmentCard from "@/components/ui/EquipmentCard";
import { siteConfig } from "@/lib/config";

export const metadata = { title: "Infraestrutura", alternates: { canonical: "/research/infrastructure" } };

export default async function InfrastructurePage() {
  // Texto introdutório e lista de equipamentos — leituras independentes, em paralelo
  const [pageInfo, allEquipment] = await Promise.all([
    getSingleFile("equipment/index.md"),
    getCollection("equipment"),
  ]);

  const equipment = allEquipment.filter(
    (e) => e.slug !== "placeholder" && e.slug !== "index"
  );

  return (
    <div>
      <PageHeader
        title="Infraestrutura"
        eyebrow={`${siteConfig.acronym} · ${siteConfig.university}`}
      />

      <main>
        <div className="container-site">
          <section style={{ padding: "4rem 0" }}>

            {/* Texto introdutório — editável pelo CMS em content/equipment/index.md */}
            {(pageInfo.intro as string | undefined) && (
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
                {pageInfo.intro as string}
              </p>
            )}

            {/* Grid de equipamentos */}
            {equipment.length === 0 ? (
              <p style={{ color: "var(--color-text-subtle)" }}>
                Nenhum equipamento cadastrado ainda.
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: "1.5rem",
                }}
              >
                {equipment.map((item) => (
                  <EquipmentCard
                    key={item.slug}
                    title={item.title as string}
                    summary={item.summary as string}
                    description={item.description as string | undefined}
                    photo={item.photo as string | undefined}
                    manufacturer={item.manufacturer as string | undefined}
                    model={item.model as string | undefined}
                  />
                ))}
              </div>
            )}

          </section>
        </div>
      </main>
    </div>
  );
}
